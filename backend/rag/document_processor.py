import faiss
import numpy as np
import pickle
import os
import re
from pathlib import Path
from typing import List, Tuple, Optional
from PyPDF2 import PdfReader
from sentence_transformers import SentenceTransformer
import hashlib
from datetime import datetime

# Paths for user uploads
UPLOADS_DIR = "data/uploads"
USER_INDICES_DIR = "data/user_indices"

# Ensure directories exist
os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(USER_INDICES_DIR, exist_ok=True)

# Shared embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")


def get_session_dir(session_id: str) -> str:
    """Get or create directory for a session's documents"""
    session_dir = os.path.join(USER_INDICES_DIR, session_id)
    os.makedirs(session_dir, exist_ok=True)
    return session_dir


def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF file"""
    try:
        reader = PdfReader(file_path)
        text_parts = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                text_parts.append(text.strip())
        return "\n\n".join(text_parts)
    except Exception as e:
        raise ValueError(f"Failed to parse PDF: {str(e)}")


def extract_text_from_txt(file_path: str) -> str:
    """Extract text from TXT file"""
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()


def extract_text_from_docx(file_path: str) -> str:
    """Extract text from DOCX file"""
    try:
        import docx
        doc = docx.Document(file_path)
        text_parts = []
        for para in doc.paragraphs:
            if para.text.strip():
                text_parts.append(para.text.strip())
        return "\n\n".join(text_parts)
    except ImportError:
        raise ValueError("python-docx is required for DOCX support")
    except Exception as e:
        raise ValueError(f"Failed to parse DOCX: {str(e)}")


def extract_text(file_path: str, file_type: str) -> str:
    """Extract text from supported file types"""
    file_type = file_type.lower()

    if file_type in ["pdf", "application/pdf"]:
        return extract_text_from_pdf(file_path)
    elif file_type in ["txt", "text/plain"]:
        return extract_text_from_txt(file_path)
    elif file_type in ["docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
        return extract_text_from_docx(file_path)
    else:
        raise ValueError(f"Unsupported file type: {file_type}")


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 100) -> List[str]:
    """Split text into overlapping chunks for better context"""
    # Clean up text
    text = re.sub(r'\s+', ' ', text).strip()

    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size

        # Try to break at sentence boundary
        if end < len(text):
            # Look for sentence end near chunk boundary
            for sep in ['. ', '! ', '? ', '\n']:
                last_sep = text[start:end].rfind(sep)
                if last_sep > chunk_size // 2:
                    end = start + last_sep + 1
                    break

        chunk = text[start:end].strip()
        if len(chunk) > 50:  # Only keep meaningful chunks
            chunks.append(chunk)

        start = end - overlap if end < len(text) else len(text)

    return chunks


def process_document(
    file_content: bytes,
    filename: str,
    file_type: str,
    session_id: str
) -> dict:
    """
    Process an uploaded document:
    1. Save the file
    2. Extract text
    3. Chunk the text
    4. Create embeddings
    5. Add to session's FAISS index
    """
    session_dir = get_session_dir(session_id)

    # Generate unique document ID
    doc_id = hashlib.md5(f"{filename}{datetime.now().isoformat()}".encode()).hexdigest()[:12]

    # Save the file
    safe_filename = re.sub(r'[^\w\-\.]', '_', filename)
    file_path = os.path.join(UPLOADS_DIR, f"{doc_id}_{safe_filename}")

    with open(file_path, "wb") as f:
        f.write(file_content)

    # Extract text
    text = extract_text(file_path, file_type)

    if not text.strip():
        os.remove(file_path)
        raise ValueError("No text content found in document")

    # Chunk the text
    chunks = chunk_text(text)

    if not chunks:
        os.remove(file_path)
        raise ValueError("Document too short or unreadable")

    # Create embeddings
    embeddings = model.encode(chunks, show_progress_bar=False)
    embeddings = np.array(embeddings).astype("float32")

    # Load or create session's document registry
    registry_path = os.path.join(session_dir, "documents.pkl")
    if os.path.exists(registry_path):
        with open(registry_path, "rb") as f:
            documents = pickle.load(f)
    else:
        documents = {}

    # Load or create session's FAISS index
    index_path = os.path.join(session_dir, "doc_index.bin")
    chunks_path = os.path.join(session_dir, "doc_chunks.pkl")

    if os.path.exists(index_path) and os.path.exists(chunks_path):
        index = faiss.read_index(index_path)
        with open(chunks_path, "rb") as f:
            all_chunks = pickle.load(f)
    else:
        dim = embeddings.shape[1]
        index = faiss.IndexFlatL2(dim)
        all_chunks = []

    # Track chunk indices for this document
    start_idx = len(all_chunks)
    end_idx = start_idx + len(chunks)

    # Add to index
    index.add(embeddings)
    all_chunks.extend(chunks)

    # Save updated index
    faiss.write_index(index, index_path)
    with open(chunks_path, "wb") as f:
        pickle.dump(all_chunks, f)

    # Update document registry
    documents[doc_id] = {
        "id": doc_id,
        "filename": filename,
        "file_path": file_path,
        "file_type": file_type,
        "chunks_range": (start_idx, end_idx),
        "num_chunks": len(chunks),
        "text_length": len(text),
        "uploaded_at": datetime.now().isoformat(),
    }

    with open(registry_path, "wb") as f:
        pickle.dump(documents, f)

    return {
        "doc_id": doc_id,
        "filename": filename,
        "num_chunks": len(chunks),
        "text_length": len(text),
    }


def get_user_documents(session_id: str) -> List[dict]:
    """Get list of documents uploaded by a session"""
    session_dir = get_session_dir(session_id)
    registry_path = os.path.join(session_dir, "documents.pkl")

    if not os.path.exists(registry_path):
        return []

    with open(registry_path, "rb") as f:
        documents = pickle.load(f)

    return [
        {
            "id": doc["id"],
            "filename": doc["filename"],
            "file_type": doc["file_type"],
            "num_chunks": doc["num_chunks"],
            "uploaded_at": doc["uploaded_at"],
        }
        for doc in documents.values()
    ]


def delete_user_document(session_id: str, doc_id: str) -> bool:
    """Delete a user's uploaded document"""
    session_dir = get_session_dir(session_id)
    registry_path = os.path.join(session_dir, "documents.pkl")

    if not os.path.exists(registry_path):
        return False

    with open(registry_path, "rb") as f:
        documents = pickle.load(f)

    if doc_id not in documents:
        return False

    doc = documents[doc_id]

    # Remove the file
    if os.path.exists(doc["file_path"]):
        os.remove(doc["file_path"])

    # Remove from registry
    del documents[doc_id]

    with open(registry_path, "wb") as f:
        pickle.dump(documents, f)

    # Note: We don't remove from FAISS index as it would require rebuilding
    # The chunks remain but won't be matched to any document

    return True


def retrieve_from_user_docs(
    session_id: str,
    query_vec: np.ndarray,
    doc_ids: Optional[List[str]] = None,
    top_k: int = 5
) -> str:
    """
    Retrieve relevant context from user's uploaded documents.
    If doc_ids is provided, only search within those documents.
    """
    session_dir = get_session_dir(session_id)
    index_path = os.path.join(session_dir, "doc_index.bin")
    chunks_path = os.path.join(session_dir, "doc_chunks.pkl")
    registry_path = os.path.join(session_dir, "documents.pkl")

    if not os.path.exists(index_path):
        return ""

    index = faiss.read_index(index_path)
    with open(chunks_path, "rb") as f:
        chunks = pickle.load(f)

    query_vec = np.array(query_vec).astype("float32")

    # Search the index
    distances, indices = index.search(query_vec, min(top_k * 2, len(chunks)))

    results = []

    if doc_ids:
        # Filter by specific documents
        with open(registry_path, "rb") as f:
            documents = pickle.load(f)

        valid_ranges = []
        for doc_id in doc_ids:
            if doc_id in documents:
                valid_ranges.append(documents[doc_id]["chunks_range"])

        for idx, dist in zip(indices[0], distances[0]):
            if idx < len(chunks):
                # Check if this chunk belongs to selected documents
                for start, end in valid_ranges:
                    if start <= idx < end:
                        results.append(chunks[idx])
                        break
            if len(results) >= top_k:
                break
    else:
        # Return all matching chunks
        for idx in indices[0]:
            if idx < len(chunks):
                results.append(chunks[idx])
            if len(results) >= top_k:
                break

    return "\n\n".join(results) if results else ""
