import React from "react";
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from "lucide-react";
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
    <div className={`flex flex-col gap-2 p-3.5 rounded-2xl glass border border-border/60 ${className}`}>
      <div className="flex items-center justify-between gap-3">
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

        <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
          {isListening
            ? "Recording speech..."
            : isSpeaking
            ? "Playing voice response..."
            : supported
            ? "Voice Assistant Ready"
            : "Text Mode"}
        </div>
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
