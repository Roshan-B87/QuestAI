from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List
import json
import asyncio

from nlp.detect import detect_language
from nlp.translate import translate_to_english, translate_from_english
from nlp.intent import classify_intent
from rag.embedder import embed_query
from rag.retriever import retrieve_context
from rag.generator import generate_answer, generate_answer_stream
from rag.document_processor import (
    process_document,
    get_user_documents,
    delete_user_document,
    retrieve_from_user_docs,
)
from data.logger import log_conversation, get_history
from integrations import router as integrations_router

app = FastAPI(
    title="QuestAI API",
    description="Intelligent multi-language campus assistant powered by RAG and LLMs",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register integration webhooks (WhatsApp, Telegram, Slack, Teams)
app.include_router(integrations_router)


class ChatRequest(BaseModel):
    message: str
    session_id: str
    language: str = "auto"
    use_documents: bool = False  # Whether to include user's documents in RAG
    document_ids: Optional[List[str]] = None  # Specific documents to search


class EscalateRequest(BaseModel):
    session_id: str
    reason: str


class QuickReply(BaseModel):
    label: str
    value: str


# Quick reply suggestions based on intent
QUICK_REPLIES = {
    "fee payment": [
        {"label": "💰 Payment Methods", "value": "What are the payment methods available?"},
        {"label": "📅 Due Date", "value": "When is the fee due date?"},
        {"label": "💵 Late Fee", "value": "What is the late fee penalty?"},
    ],
    "scholarship": [
        {"label": "📋 Eligibility", "value": "What is the scholarship eligibility?"},
        {"label": "📝 How to Apply", "value": "How do I apply for scholarship?"},
        {"label": "📆 Deadline", "value": "What is the scholarship deadline?"},
    ],
    "exam schedule": [
        {"label": "📅 Exam Dates", "value": "When are the exams scheduled?"},
        {"label": "📖 Syllabus", "value": "Where can I find the exam syllabus?"},
        {"label": "🏛️ Exam Hall", "value": "Where will the exams be conducted?"},
    ],
    "hostel": [
        {"label": "🏠 Availability", "value": "Is hostel accommodation available?"},
        {"label": "💵 Hostel Fee", "value": "What is the hostel fee?"},
        {"label": "📋 Rules", "value": "What are the hostel rules?"},
    ],
    "library": [
        {"label": "🕐 Timings", "value": "What are the library timings?"},
        {"label": "📚 Book Issue", "value": "How to issue books from library?"},
        {"label": "💻 E-resources", "value": "What e-resources are available?"},
    ],
    "result": [
        {"label": "📊 Check Result", "value": "How do I check my result?"},
        {"label": "📜 Transcript", "value": "How to get my transcript?"},
        {"label": "🔄 Revaluation", "value": "How to apply for revaluation?"},
    ],
    "general query": [
        {"label": "📞 Contact", "value": "How can I contact the college office?"},
        {"label": "🗺️ Campus Map", "value": "Where can I find the campus map?"},
        {"label": "📅 Academic Calendar", "value": "Where is the academic calendar?"},
    ],
}


@app.post("/chat")
async def chat(req: ChatRequest):
    """Main chat endpoint - processes messages and returns AI response"""
    try:
        # Step 1: Detect language
        detected_lang = detect_language(req.message)

        # Step 2: Translate to English if needed
        english_query = req.message
        if detected_lang != "en":
            english_query = translate_to_english(req.message, detected_lang)

        # Step 3: Classify intent
        intent = classify_intent(english_query)

        # Step 4: RAG - embed, retrieve, generate
        query_vec = embed_query(english_query)

        # Get context from knowledge base
        kb_context = retrieve_context(query_vec)

        # Get context from user's uploaded documents if requested
        doc_context = ""
        if req.use_documents:
            doc_context = retrieve_from_user_docs(
                req.session_id,
                query_vec,
                req.document_ids
            )

        # Combine contexts
        if doc_context:
            context = f"--- From Your Documents ---\n{doc_context}\n\n--- From Knowledge Base ---\n{kb_context}"
        else:
            context = kb_context

        answer_en, confidence = generate_answer(english_query, context, detected_lang)

        # Step 5: Check confidence — escalate if low
        if confidence < 0.3:
            log_conversation(req.session_id, req.message, "ESCALATED", detected_lang)
            return {
                "reply": "I'm not confident about this answer. Would you like me to connect you with a human assistant?",
                "escalate": True,
                "detected_lang": detected_lang,
                "intent": intent,
                "confidence": round(confidence, 2),
                "quick_replies": [
                    {"label": "👤 Connect to Human", "value": "ESCALATE"},
                    {"label": "🔄 Try Again", "value": req.message},
                ],
            }

        # Step 6: Always respond in English (understand any language, reply in English)
        final_reply = answer_en

        # Step 7: Log conversation
        log_conversation(req.session_id, req.message, final_reply, detected_lang)

        # Step 8: Get quick replies based on intent
        quick_replies = QUICK_REPLIES.get(intent, QUICK_REPLIES["general query"])

        return {
            "reply": final_reply,
            "detected_lang": detected_lang,
            "intent": intent,
            "confidence": round(confidence, 2),
            "escalate": False,
            "quick_replies": quick_replies,
            "used_documents": req.use_documents and bool(doc_context),
        }

    except Exception as e:
        return {
            "reply": f"Sorry, I encountered an error. Please try again. ({str(e)})",
            "escalate": False,
            "error": True,
        }


@app.post("/chat/stream")
async def chat_stream(req: ChatRequest):
    """Streaming chat endpoint - returns response in real-time chunks"""

    async def generate():
        try:
            # Step 1: Detect language
            detected_lang = detect_language(req.message)

            # Send metadata first
            yield f"data: {json.dumps({'type': 'metadata', 'detected_lang': detected_lang})}\n\n"

            # Step 2: Translate to English if needed
            english_query = req.message
            if detected_lang != "en":
                english_query = translate_to_english(req.message, detected_lang)

            # Step 3: Classify intent
            intent = classify_intent(english_query)
            yield f"data: {json.dumps({'type': 'intent', 'intent': intent})}\n\n"

            # Step 4: RAG - embed, retrieve
            query_vec = embed_query(english_query)
            context = retrieve_context(query_vec)

            # Step 5: Stream the response
            full_response = ""
            for chunk in generate_answer_stream(english_query, context):
                full_response += chunk
                yield f"data: {json.dumps({'type': 'chunk', 'content': chunk})}\n\n"
                await asyncio.sleep(0.01)  # Small delay for smoother streaming

            # Step 6: Calculate confidence
            confidence = 0.85 if "No relevant context" not in context else 0.25

            # Step 7: Always respond in English
            final_reply = full_response

            # Step 8: Log conversation
            log_conversation(req.session_id, req.message, final_reply, detected_lang)

            # Step 9: Send completion with quick replies
            quick_replies = QUICK_REPLIES.get(intent, QUICK_REPLIES["general query"])
            yield f"data: {json.dumps({'type': 'done', 'confidence': round(confidence, 2), 'quick_replies': quick_replies})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


@app.post("/escalate")
async def escalate(req: EscalateRequest):
    """Escalate conversation to human agent"""
    log_conversation(req.session_id, "ESCALATION_REQUEST", req.reason, "N/A")
    return {
        "status": "escalated",
        "message": "Your request has been forwarded to a human agent. You will be contacted within 24 hours.",
        "ticket_id": f"TKT-{req.session_id[:8].upper()}",
    }


@app.get("/history/{session_id}")
async def history(session_id: str):
    """Get chat history for a session"""
    logs = get_history(session_id)
    return {"session_id": session_id, "history": logs}


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok", "service": "Campus Chatbot API", "version": "2.0.0"}


@app.get("/")
async def root():
    """Root endpoint with API info"""
    return {
        "name": "Campus Chatbot API",
        "version": "2.0.0",
        "endpoints": {
            "POST /chat": "Main chat endpoint",
            "POST /chat/stream": "Streaming chat endpoint",
            "POST /escalate": "Escalate to human agent",
            "POST /documents/upload": "Upload a document for RAG",
            "GET /documents/{session_id}": "List uploaded documents",
            "DELETE /documents/{session_id}/{doc_id}": "Delete a document",
            "GET /history/{session_id}": "Get chat history",
            "GET /health": "Health check",
        }
    }


# ============== Document Upload Endpoints ==============

ALLOWED_TYPES = {
    "application/pdf": "pdf",
    "text/plain": "txt",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


@app.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    session_id: str = Form(...)
):
    """
    Upload a document (PDF, TXT, DOCX) for RAG.
    The document will be processed, chunked, and indexed for the session.
    """
    # Validate file type
    content_type = file.content_type
    if content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {content_type}. Allowed: PDF, TXT, DOCX"
        )

    # Read file content
    content = await file.read()

    # Validate file size
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB"
        )

    try:
        result = process_document(
            file_content=content,
            filename=file.filename,
            file_type=ALLOWED_TYPES[content_type],
            session_id=session_id
        )

        return {
            "success": True,
            "message": f"Document '{file.filename}' uploaded and indexed successfully!",
            "document": result
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process document: {str(e)}"
        )


@app.get("/documents/{session_id}")
async def list_documents(session_id: str):
    """List all documents uploaded by a session"""
    documents = get_user_documents(session_id)
    return {
        "session_id": session_id,
        "documents": documents,
        "count": len(documents)
    }


@app.delete("/documents/{session_id}/{doc_id}")
async def remove_document(session_id: str, doc_id: str):
    """Delete a specific document"""
    success = delete_user_document(session_id, doc_id)

    if not success:
        raise HTTPException(status_code=404, detail="Document not found")

    return {
        "success": True,
        "message": f"Document {doc_id} deleted successfully"
    }

