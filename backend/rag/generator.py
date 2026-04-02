import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = """You are QuestAI - a friendly AI assistant for college students.

=== ABSOLUTE RULE - ENGLISH ONLY ===
YOU MUST RESPOND ONLY IN ENGLISH. THIS IS NON-NEGOTIABLE.
- Input language: ANY (Hindi, Tamil, Finnish, Spanish, etc.)
- Output language: ENGLISH ONLY - NO EXCEPTIONS
- If someone says "hi" or "namaste" or "hola" - respond in ENGLISH
- If someone asks in any language - respond in ENGLISH
- NEVER write a single word in Hindi, Finnish, Spanish, or any non-English language
- Your response must be 100% English text

You help with:
- Fee payment deadlines and procedures
- Scholarship applications and eligibility
- Exam schedules and results
- Hostel accommodation queries
- Library timings and resources
- Admission procedures
- General campus information

RESPONSE FORMAT:
1. Answer based on provided context
2. Be concise and professional
3. If no context available, say "I don't have that information. Please contact the administration office."
4. Use bullet points for lists
5. ALWAYS USE ENGLISH - NO OTHER LANGUAGE"""


def generate_answer(query: str, context: str, response_language: str = "en") -> tuple[str, float]:
    """Generate answer using Groq API. Returns (answer, confidence_score)
    Note: Always responds in English regardless of input language
    """
    try:
        # Always respond in English - ABSOLUTE REQUIREMENT
        prompt = f"""Context Information:
{context}

Student Question: {query}

MANDATORY: Respond ONLY in ENGLISH. Do not use Hindi, Finnish, Tamil, or any other language. English only."""

        completion = client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
            max_completion_tokens=1024,
            top_p=0.9,
        )

        answer = completion.choices[0].message.content.strip()

        # Confidence scoring based on context relevance
        confidence = 0.85 if "No relevant context" not in context and "No knowledge base" not in context else 0.25

        return answer, confidence

    except Exception as e:
        return f"I'm having trouble connecting right now. Please try again in a moment! Error: {str(e)}", 0.0


def generate_answer_stream(query: str, context: str, response_language: str = "en"):
    """Generate answer using Groq API with streaming. Yields chunks of text.
    Note: Always responds in English regardless of input language
    """
    try:
        # Always respond in English - ABSOLUTE REQUIREMENT
        prompt = f"""Context Information:
{context}

Student Question: {query}

MANDATORY: Respond ONLY in ENGLISH. Do not use Hindi, Finnish, Tamil, or any other language. English only."""

        completion = client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
            max_completion_tokens=1024,
            top_p=0.9,
            stream=True,
        )

        for chunk in completion:
            content = chunk.choices[0].delta.content
            if content:
                yield content

    except Exception as e:
        yield f"Error: {str(e)}"
