from langdetect import detect, DetectorFactory
DetectorFactory.seed = 0  # Makes detection consistent

def detect_language(text: str) -> str:
    """Detect language of input text. Returns ISO 639-1 code e.g. 'en', 'hi', 'bn'"""
    try:
        lang = detect(text)
        return lang
    except Exception:
        return "en"  # Default to English if detection fails
