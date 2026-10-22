import { useState, useEffect, useRef, useCallback } from "react";

export interface IndicLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_INDIC_LANGUAGES: IndicLanguage[] = [
  { code: "en-IN", name: "English (India)", nativeName: "English", flag: "🇮🇳" },
  { code: "hi-IN", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "mr-IN", name: "Marathi", nativeName: "मराठी", flag: "🇮🇳" },
  { code: "ta-IN", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳" },
  { code: "te-IN", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳" },
  { code: "bn-IN", name: "Bengali", nativeName: "বাংলা", flag: "🇮🇳" },
  { code: "gu-IN", name: "Gujarati", nativeName: "ગુજરાતી", flag: "🇮🇳" },
  { code: "kn-IN", name: "Kannada", nativeName: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "ml-IN", name: "Malayalam", nativeName: "മലയാളം", flag: "🇮🇳" },
  { code: "pa-IN", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
];

export interface UseVoiceReturn {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  supported: boolean;
  error: string | null;
  selectedLanguage: string;
  setSelectedLanguage: (langCode: string) => void;
  handsFreeMode: boolean;
  setHandsFreeMode: (enabled: boolean) => void;
  startListening: (onResult?: (text: string) => void) => void;
  stopListening: () => void;
  speakText: (text: string, onEnd?: () => void) => void;
  stopSpeaking: () => void;
  clearTranscript: () => void;
  languages: IndicLanguage[];
}

export function useVoice(): UseVoiceReturn {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [supported, setSupported] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguageState] = useState<string>("en-IN");
  const [handsFreeMode, setHandsFreeMode] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const onResultCallbackRef = useRef<((text: string) => void) | null>(null);
  const onSpeechEndCallbackRef = useRef<(() => void) | null>(null);

  // Synchronize recognition language whenever selectedLanguage updates
  const setSelectedLanguage = useCallback((langCode: string) => {
    setSelectedLanguageState(langCode);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = langCode;
      } catch (e) {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = selectedLanguage;

        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
          if (onResultCallbackRef.current) {
            onResultCallbackRef.current(currentTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition notice/error:", event.error);
          if (event.error !== "no-speech") {
            setError(`Speech recognition error: ${event.error}`);
          }
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
        setSupported(true);
      } catch (err: any) {
        console.warn("Speech Recognition initialization fallback:", err);
        setSupported(false);
      }
    } else {
      setSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
    };
  }, []);

  const startListening = useCallback((onResult?: (text: string) => void) => {
    setError(null);
    if (onResult) {
      onResultCallbackRef.current = onResult;
    }
    setTranscript("");

    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = selectedLanguage;
        recognitionRef.current.start();
        setIsListening(true);
        return;
      } catch (err: any) {
        try {
          recognitionRef.current.stop();
          recognitionRef.current.start();
          setIsListening(true);
          return;
        } catch (e) {
          console.warn("Native start listening retry failed, using server fallback.");
        }
      }
    }

    // Fallback indicator if browser SpeechRecognition is missing
    setError("Browser speech recognition unavailable. Microphones work best in Chrome/Edge.");
  }, [selectedLanguage]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

  const playServerTTS = useCallback(async (cleanText: string, langCode: string, onEnd?: () => void) => {
    try {
      setIsSpeaking(true);
      const res = await fetch("/api/voice/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanText, lang: langCode }),
      });
      const data = await res.json();
      if (data.status === "success" && data.audio_url) {
        if (!audioPlayerRef.current) {
          audioPlayerRef.current = new Audio();
        }
        audioPlayerRef.current.src = data.audio_url;
        audioPlayerRef.current.onended = () => {
          setIsSpeaking(false);
          if (onSpeechEndCallbackRef.current) {
            onSpeechEndCallbackRef.current();
          }
        };
        audioPlayerRef.current.onerror = (err) => {
          console.error("Server audio playback error:", err);
          setIsSpeaking(false);
          setError("Failed to play audio.");
        };
        await audioPlayerRef.current.play();
      } else {
        throw new Error(data.message || "Synthesis failed");
      }
    } catch (err: any) {
      console.error("Server TTS synthesis error:", err);
      setIsSpeaking(false);
      setError("Speech synthesis unavailable.");
    }
  }, []);

  const speakText = useCallback(async (text: string, onEnd?: () => void) => {
    setError(null);
    onSpeechEndCallbackRef.current = onEnd || null;

    const cleanText = text
      .replace(/[*_#`~]/g, "")
      .replace(/https?:\/\/[^\s]+/g, "link")
      .replace(/\n+/g, " ")
      .trim();

    if (!cleanText) return;

    // Check if browser has a native voice installed for selectedLanguage
    const isEnglish = selectedLanguage.startsWith("en");
    let matchingVoice: SpeechSynthesisVoice | null = null;
    
    if ("speechSynthesis" in window) {
      const voices = window.speechSynthesis.getVoices();
      const langPrefix = selectedLanguage.split("-")[0].toLowerCase();
      matchingVoice = voices.find((v) => {
        const vLang = v.lang.toLowerCase().replace("_", "-");
        return vLang === selectedLanguage.toLowerCase() || vLang.startsWith(langPrefix);
      }) || null;
    }

    // 1. If English OR browser has an installed native voice for the selected language, use Web Speech API
    if ("speechSynthesis" in window && (isEnglish || matchingVoice !== null)) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.lang = selectedLanguage;
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }

        utterance.onstart = () => {
          setIsSpeaking(true);
        };

        utterance.onend = () => {
          setIsSpeaking(false);
          if (onSpeechEndCallbackRef.current) {
            onSpeechEndCallbackRef.current();
          }
        };

        utterance.onerror = (e) => {
          console.warn("Native speech synthesis error, using server fallback", e);
          setIsSpeaking(false);
          playServerTTS(cleanText, selectedLanguage, onEnd);
        };

        window.speechSynthesis.speak(utterance);
        return;
      } catch (e) {
        console.warn("Native speech synthesis exception, using server fallback", e);
      }
    }

    // 2. Server-side TTS fallback via /api/voice/synthesize (gTTS for Tamil & Indic languages)
    await playServerTTS(cleanText, selectedLanguage, onEnd);
  }, [selectedLanguage, playServerTTS]);

  const stopSpeaking = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    setIsSpeaking(false);
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  return {
    isListening,
    isSpeaking,
    transcript,
    supported,
    error,
    selectedLanguage,
    setSelectedLanguage,
    handsFreeMode,
    setHandsFreeMode,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
    clearTranscript,
    languages: SUPPORTED_INDIC_LANGUAGES,
  };
}
