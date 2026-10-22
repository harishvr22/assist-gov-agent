"""
voice_service.py — Multi-lingual Indic Speech-to-Text (STT) and Text-to-Speech (TTS) Service
==========================================================================================
Provides server-side audio transcription via Gemini 2.5 Flash multimodal models
and speech synthesis using gTTS (Google Text-to-Speech) for Indic regional languages.
"""

import os
import io
import base64
import logging
from gtts import gTTS

logger = logging.getLogger(__name__)

# Map ISO lang codes (e.g. 'hi-IN', 'mr-IN') to gTTS language codes
LANG_CODE_MAP = {
    "en": "en",
    "en-IN": "en",
    "hi": "hi",
    "hi-IN": "hi",
    "mr": "mr",
    "mr-IN": "mr",
    "ta": "ta",
    "ta-IN": "ta",
    "te": "te",
    "te-IN": "te",
    "bn": "bn",
    "bn-IN": "bn",
    "gu": "gu",
    "gu-IN": "gu",
    "kn": "kn",
    "kn-IN": "kn",
    "ml": "ml",
    "ml-IN": "ml",
    "pa": "pa",
    "pa-IN": "pa",
}

def synthesize_speech(text: str, lang: str = "en-IN") -> str:
    """
    Generates MP3 audio for given text in the requested Indic language.
    Returns base64 data URI string suitable for browser audio playback.
    """
    if not text or not text.strip():
        raise ValueError("Text to synthesize cannot be empty.")

    target_lang = LANG_CODE_MAP.get(lang, "en")
    
    # Strip markdown formatting symbols for cleaner voice rendering
    clean_text = text.replace("*", "").replace("#", "").replace("_", "").replace("`", "").strip()

    try:
        tts = gTTS(text=clean_text, lang=target_lang, tld="co.in", slow=False)
        mp3_fp = io.BytesIO()
        tts.write_to_fp(mp3_fp)
        mp3_fp.seek(0)
        
        audio_b64 = base64.b64encode(mp3_fp.read()).decode("utf-8")
        return f"data:audio/mp3;base64,{audio_b64}"
    except Exception as e:
        logger.warning(f"gTTS with tld='co.in' failed, retrying with default domain: {e}")
        try:
            tts = gTTS(text=clean_text, lang=target_lang, slow=False)
            mp3_fp = io.BytesIO()
            tts.write_to_fp(mp3_fp)
            mp3_fp.seek(0)
            audio_b64 = base64.b64encode(mp3_fp.read()).decode("utf-8")
            return f"data:audio/mp3;base64,{audio_b64}"
        except Exception as err2:
            logger.error(f"gTTS speech synthesis error for lang '{target_lang}': {err2}")
            raise err2


def transcribe_audio(audio_bytes: bytes, mime_type: str = "audio/webm", lang: str = "en-IN") -> str:
    """
    Transcribes audio bytes into text using Gemini 2.5 Multimodal audio capability.
    """
    if not audio_bytes:
        raise ValueError("Audio data cannot be empty.")

    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY environment variable is missing.")

    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        from langchain_core.messages import HumanMessage

        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=0.1,
            google_api_key=api_key,
        )

        audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")
        
        message = HumanMessage(
            content=[
                {
                    "type": "text",
                    "text": (
                        f"Transcribe this user speech audio clip accurately into text in the native script or Latin representation. "
                        f"Expected spoken language code: {lang}. Output ONLY the transcribed text without explanation or quotation marks."
                    )
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:{mime_type};base64,{audio_b64}"
                    }
                }
            ]
        )

        res = llm.invoke([message])
        transcript = res.content if hasattr(res, "content") else str(res)
        return transcript.strip()
    except Exception as e:
        logger.error(f"Error transcribing audio with Gemini: {e}")
        raise e
