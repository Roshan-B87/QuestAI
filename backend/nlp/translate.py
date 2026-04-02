# Translation using a free Google Translate wrapper
# For production use IndicTrans2 model for better Indian language support
# pip install deep-translator

from deep_translator import GoogleTranslator

def translate_to_english(text: str, source_lang: str) -> str:
    """Translate text from source_lang to English"""
    try:
        translated = GoogleTranslator(source=source_lang, target="en").translate(text)
        return translated
    except Exception:
        return text  # Return original if translation fails

def translate_from_english(text: str, target_lang: str) -> str:
    """Translate English text back to target language"""
    try:
        translated = GoogleTranslator(source="en", target=target_lang).translate(text)
        return translated
    except Exception:
        return text
