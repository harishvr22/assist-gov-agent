import { useState, useEffect, useRef, useCallback } from "react";

export interface UseVoiceReturn {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  supported: boolean;
  error: string | null;
  startListening: (onResult?: (text: string) => void) => void;
  stopListening: () => void;
  speakText: (text: string, onEnd?: () => void) => void;
  stopSpeaking: () => void;
  clearTranscript: () => void;
}

export function useVoice(): UseVoiceReturn {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [supported, setSupported] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const onResultCallbackRef = useRef<((text: string) => void) | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setSupported(true);
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-IN"; // English (India) default, also works for general speech

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
          console.warn("Speech recognition error:", event.error);
          setError(`Speech recognition error: ${event.error}`);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } catch (err: any) {
        console.error("Failed to initialize Speech Recognition:", err);
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
    };
  }, []);

  const startListening = useCallback((onResult?: (text: string) => void) => {
    setError(null);
    if (!recognitionRef.current) {
      const msg = "Speech Recognition is not supported in this browser. Try Chrome or Edge.";
      setError(msg);
      return;
    }

    onResultCallbackRef.current = onResult || null;
    setTranscript("");
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err: any) {
      console.warn("Speech recognition start failed:", err);
      // Restart if already running
      try {
        recognitionRef.current.stop();
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        setError("Failed to start speech recognition mic input.");
      }
    }
  }, []);

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

  const speakText = useCallback((text: string, onEnd?: () => void) => {
    setError(null);
    if (!("speechSynthesis" in window)) {
      setError("Text-to-speech is not supported in this browser.");
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    // Clean markdown symbols from text before speaking
    const cleanText = text
      .replace(/[*_#`~]/g, "")
      .replace(/https?:\/\/[^\s]+/g, "link")
      .replace(/\n+/g, " ")
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = "en-IN";

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };

    utterance.onerror = (e: any) => {
      console.warn("Speech synthesis error:", e);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
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
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
    clearTranscript,
  };
}
