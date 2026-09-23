import React from "react";
import { Mic, MicOff, Volume2, VolumeX, Globe } from "lucide-react";
import { useVoice } from "../hooks/useVoice";

interface VoiceControlsProps {
  onTranscriptReceived?: (text: string) => void;
  textToRead?: string;
  className?: string;
  compact?: boolean;
}

export function VoiceControls({
  onTranscriptReceived,
  textToRead,
  className = "",
  compact = false,
}: VoiceControlsProps) {
  const {
    isListening,
    isSpeaking,
    transcript,
    supported,
    selectedLanguage,
    setSelectedLanguage,
    languages,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
  } = useVoice();

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((text) => {
        if (onTranscriptReceived) {
          onTranscriptReceived(text);
        }
      });
    }
  };

  const handleSpeakerClick = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else if (textToRead) {
      speakText(textToRead);
    }
  };

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        {/* Language Selector */}
        <div className="relative flex items-center">
          <Globe className="w-3.5 h-3.5 text-muted-foreground absolute left-2 pointer-events-none" />
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            title="Select Speech Language"
            className="pl-6 pr-2 py-1.5 rounded-xl text-xs bg-white/80 border border-border text-[var(--navy)] outline-none cursor-pointer hover:border-[var(--electric)] transition font-mono"
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.nativeName}
              </option>
            ))}
          </select>
        </div>

        {/* Mic Button */}
        <button
          type="button"
          onClick={handleMicClick}
          title={isListening ? "Stop Listening" : "Speak Input"}
          className={`p-2 rounded-xl transition ${
            isListening
              ? "bg-red-500 text-white animate-pulse"
              : "bg-white/80 border border-border text-[var(--navy)] hover:border-[var(--electric)]"
          }`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Speaker Button */}
        {textToRead && (
          <button
            type="button"
            onClick={handleSpeakerClick}
            title={isSpeaking ? "Stop Voice Readout" : "Listen to Audio Readout"}
            className={`p-2 rounded-xl transition ${
              isSpeaking
                ? "bg-[var(--electric)] text-white animate-pulse"
                : "bg-white/80 border border-border text-[var(--navy)] hover:border-[var(--electric)]"
            }`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2.5 p-3.5 rounded-2xl glass border border-border/60 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Mic Button */}
          <button
            type="button"
            onClick={handleMicClick}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition shadow-sm ${
              isListening
                ? "bg-red-500 text-white animate-pulse"
                : "bg-[var(--navy)] text-white hover:bg-[var(--navy)]/90"
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-3.5 h-3.5" /> Listening...
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5" /> Voice Input
              </>
            )}
          </button>

          {/* Speaker Button */}
          {textToRead && (
            <button
              type="button"
              onClick={handleSpeakerClick}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition ${
                isSpeaking
                  ? "bg-[var(--electric)] text-white border-transparent animate-pulse"
                  : "bg-white/80 text-[var(--navy)] border-border hover:border-[var(--electric)]"
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" /> Stop Voice
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" /> Read Aloud
                </>
              )}
            </button>
          )}
        </div>

        {/* Indic Language Picker */}
        <div className="flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-muted-foreground" />
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-2 py-1 rounded-xl text-[11px] font-mono bg-white/80 border border-border text-[var(--navy)] outline-none cursor-pointer hover:border-[var(--electric)] transition"
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.name} ({l.nativeName})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
        <span>
          {isListening
            ? "Recording speech..."
            : isSpeaking
            ? "Playing voice response..."
            : supported
            ? "Voice Assistant Ready"
            : "Server Voice Mode"}
        </span>
        <span>Selected: {languages.find((l) => l.code === selectedLanguage)?.name}</span>
      </div>

      {/* Transcript Live Preview */}
      {isListening && transcript && (
        <div className="mt-1 px-3 py-2 rounded-xl bg-white/70 border border-[var(--electric)]/30 text-xs text-[var(--navy)] italic">
          "{transcript}"
        </div>
      )}
    </div>
  );
}
