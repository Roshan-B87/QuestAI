INTENTS = [
    "fee payment",
    "scholarship",
    "exam schedule",
    "hostel",
    "admission",
    "library",
    "result",
    "timetable",
    "general query",
]

def classify_intent(text: str) -> str:
    """Simple keyword-based intent classifier. Replace with zero-shot LLM for better accuracy."""
    text_lower = text.lower()
    for intent in INTENTS:
        if any(word in text_lower for word in intent.split()):
            return intent
    return "general query"
