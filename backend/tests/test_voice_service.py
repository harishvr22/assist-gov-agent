import unittest
import os
import sys

# Ensure workspace root is on python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

class TestVoiceService(unittest.TestCase):

    def test_synthesize_speech_english(self):
        from backend.voice_service import synthesize_speech
        audio_url = synthesize_speech("Welcome to GovAssist AI", "en-IN")
        self.assertTrue(audio_url.startswith("data:audio/mp3;base64,"))
        self.assertGreater(len(audio_url), 100)

    def test_synthesize_speech_hindi(self):
        from backend.voice_service import synthesize_speech
        audio_url = synthesize_speech("सरकारी योजनाओं में आपका स्वागत है", "hi-IN")
        self.assertTrue(audio_url.startswith("data:audio/mp3;base64,"))
        self.assertGreater(len(audio_url), 100)

    def test_synthesize_speech_marathi(self):
        from backend.voice_service import synthesize_speech
        audio_url = synthesize_speech("शासकीय योजनांमध्ये आपले स्वागत आहे", "mr-IN")
        self.assertTrue(audio_url.startswith("data:audio/mp3;base64,"))
        self.assertGreater(len(audio_url), 100)

    def test_synthesize_speech_tamil(self):
        from backend.voice_service import synthesize_speech
        audio_url = synthesize_speech("அரசு திட்டங்களுக்கு வரவேற்கிறோம்", "ta-IN")
        self.assertTrue(audio_url.startswith("data:audio/mp3;base64,"))
        self.assertGreater(len(audio_url), 100)

if __name__ == "__main__":
    unittest.main()
