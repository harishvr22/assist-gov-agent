import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, VolumeX, Sparkles, X, Globe, Send, RefreshCw, Zap } from "lucide-react";
import { useVoice, SUPPORTED_INDIC_LANGUAGES } from "../hooks/useVoice";
import { useAuth } from "../hooks/useAuth";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

export function InteractiveVoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "Namaste! I am your AI Voice Assistant. Speak your query or question about government schemes in your preferred language.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    isListening,
    isSpeaking,
    transcript,
    selectedLanguage,
    setSelectedLanguage,
    handsFreeMode,
    setHandsFreeMode,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
    clearTranscript,
    languages,
  } = useVoice();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, transcript]);

  // Handle sending query to Flask RAG backend (/api/chat)
  const handleSendQuery = async (queryText: string) => {
    if (!queryText || !queryText.trim()) return;
    const cleanQuery = queryText.trim();
    
    // Stop mic while processing query
    stopListening();
    clearTranscript();
    setInputText("");

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: cleanQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: cleanQuery,
          username: user?.email || "anonymous",
          language: selectedLanguage,
          profile: user || {},
        }),
      });

      const data = await response.json();
      const replyText =
        data.llm_full_response ||
        data.reply ||
        (data.schemes && data.schemes.length > 0
          ? `Found ${data.schemes.length} schemes matching your profile.`
          : "I searched the policy database for your query.");

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsProcessing(false);

      // Read reply aloud via TTS
      speakText(replyText, () => {
        // Continuous hands-free loop: resume listening automatically if handsFreeMode is enabled!
        if (handsFreeMode) {
          setTimeout(() => {
            startListening((finalTranscript) => {
              if (finalTranscript.length > 3) {
                handleSendQuery(finalTranscript);
              }
            });
          }, 400);
        }
      });
    } catch (err) {
      console.error("Chat API error:", err);
      setIsProcessing(false);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: "Could not connect to the eligibility intelligence server. Please check your network.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  // Toggle mic for voice chat input
  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      if (isSpeaking) stopSpeaking();
      startListening((liveTranscript) => {
        setInputText(liveTranscript);
      });
    }
  };

  // Auto-submit when user stops speaking after receiving final transcript
  useEffect(() => {
    if (!isListening && transcript && transcript.trim().length > 2 && !isProcessing) {
      handleSendQuery(transcript);
    }
  }, [isListening, transcript]);

  return (
    <>
      {/* Floating Interactive Voice Assistant Launcher Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[var(--navy)] to-[var(--electric)] text-white shadow-[var(--shadow-glow)] cursor-pointer"
        aria-label="Open Interactive Voice Assistant"
      >
        <div className="relative flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-[var(--cyan)]" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
        </div>
        <span className="text-xs font-mono tracking-wider font-semibold">Voice Assistant</span>
      </motion.button>

      {/* Interactive Voice Assistant Drawer Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-[var(--navy)]/50 backdrop-blur-sm"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-x-4 top-10 bottom-10 md:inset-auto md:right-6 md:bottom-6 md:top-20 md:w-[460px] z-50 flex flex-col bg-background rounded-3xl border border-border shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 bg-[var(--navy)] text-white flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[var(--cyan)]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Indic Voice Assistant</h3>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--cyan)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Continuous RAG Conversational Loop
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    stopListening();
                    stopSpeaking();
                    setIsOpen(false);
                  }}
                  className="p-1.5 rounded-xl hover:bg-white/10 transition text-white/70 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Language & Control Toolbar */}
              <div className="px-4 py-2.5 bg-secondary/50 border-b border-border flex items-center justify-between gap-2 text-xs">
                {/* Indic Language Picker */}
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="px-2 py-1 rounded-lg text-xs bg-white border border-border text-[var(--navy)] font-mono outline-none"
                  >
                    {languages.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.flag} {l.name} ({l.nativeName})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Hands-free mode toggle */}
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-mono text-[var(--navy)]">
                  <input
                    type="checkbox"
                    checked={handsFreeMode}
                    onChange={(e) => setHandsFreeMode(e.target.checked)}
                    className="rounded border-border text-[var(--electric)] focus:ring-0"
                  />
                  <span>Hands-Free Loop</span>
                </label>
              </div>

              {/* Audio Wave Visualizer Area */}
              <div className="p-4 bg-gradient-to-b from-[var(--navy)]/5 to-transparent flex flex-col items-center justify-center border-b border-border/40">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  {/* Listening animation rings */}
                  {isListening && (
                    <>
                      <span className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
                      <span className="absolute -inset-2 rounded-full bg-red-500/10 animate-pulse" />
                    </>
                  )}
                  {/* Speaking animation rings */}
                  {isSpeaking && (
                    <>
                      <span className="absolute inset-0 rounded-full bg-[var(--electric)]/30 animate-ping" />
                      <span className="absolute -inset-2 rounded-full bg-[var(--cyan)]/20 animate-pulse" />
                    </>
                  )}
                  {/* Processing spinner */}
                  {isProcessing && (
                    <span className="absolute inset-0 rounded-full border-2 border-dashed border-[var(--electric)] animate-spin" />
                  )}

                  <button
                    onClick={handleMicToggle}
                    className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center transition shadow-lg ${
                      isListening
                        ? "bg-red-500 text-white"
                        : isSpeaking
                        ? "bg-[var(--electric)] text-white"
                        : "bg-[var(--navy)] text-white hover:bg-[var(--navy)]/90"
                    }`}
                  >
                    {isListening ? (
                      <MicOff className="w-7 h-7" />
                    ) : isSpeaking ? (
                      <VolumeX className="w-7 h-7 animate-bounce" />
                    ) : (
                      <Mic className="w-7 h-7" />
                    )}
                  </button>
                </div>

                <div className="mt-2 text-[11px] font-mono text-muted-foreground uppercase tracking-widest text-center">
                  {isListening
                    ? "Listening for your voice input..."
                    : isSpeaking
                    ? "Speaking response..."
                    : isProcessing
                    ? "Querying Multi-Agent RAG..."
                    : "Tap mic or speak to ask"}
                </div>

                {isListening && transcript && (
                  <div className="mt-2 px-3 py-1.5 rounded-xl bg-white/80 border border-[var(--electric)]/30 text-xs text-[var(--navy)] italic max-w-full truncate">
                    "{transcript}"
                  </div>
                )}
              </div>

              {/* Chat Message Trajectory List */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-background">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      m.sender === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                        m.sender === "user"
                          ? "bg-[var(--navy)] text-white rounded-br-none"
                          : "bg-white border border-border text-[var(--navy)] shadow-sm rounded-bl-none"
                      }`}
                    >
                      <p className="whitespace-pre-line">{m.text}</p>
                    </div>

                    <div className="mt-1 flex items-center gap-2 px-1 text-[10px] text-muted-foreground font-mono">
                      <span>{m.timestamp}</span>
                      {m.sender === "assistant" && (
                        <button
                          onClick={() => speakText(m.text)}
                          className="hover:text-[var(--electric)] flex items-center gap-1"
                          title="Replay Audio"
                        >
                          <Volume2 className="w-3 h-3" /> Replay
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Text Input & Submit Footer */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (inputText) handleSendQuery(inputText);
                }}
                className="p-3 bg-secondary/30 border-t border-border flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Or type your scheme query here..."
                  className="flex-1 py-2.5 px-3.5 bg-white border border-border rounded-xl text-xs outline-none focus:border-[var(--electric)] transition"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isProcessing}
                  className="p-2.5 rounded-xl bg-[var(--electric)] text-white disabled:opacity-40 transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
