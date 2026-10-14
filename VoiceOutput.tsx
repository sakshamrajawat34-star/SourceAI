import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { sound } from '../utils/sound';

interface VoiceOutputProps {
  text: string;
  voiceName?: string;
}

export const VoiceOutput: React.FC<VoiceOutputProps> = ({ text, voiceName = 'Kore' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleTogglePlay = async () => {
    sound.playClick();

    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      return;
    }

    setLoading(true);

    try {
      // First attempt Gemini 3.8 Flash Lite TTS endpoint
      const res = await fetch('/api/audio/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.slice(0, 1000), // optimal clip
          voice: voiceName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioUrl) {
          const audio = new Audio(data.audioUrl);
          audioRef.current = audio;
          audio.onended = () => {
            setIsPlaying(false);
            setLoading(false);
          };
          audio.onerror = () => {
            fallbackSpeechSynth();
          };
          await audio.play();
          setIsPlaying(true);
          setLoading(false);
          return;
        }
      }
      // If server TTS not available, fall back to browser Web Speech API
      fallbackSpeechSynth();
    } catch {
      fallbackSpeechSynth();
    }
  };

  const fallbackSpeechSynth = () => {
    if (!('speechSynthesis' in window)) {
      setLoading(false);
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#`_\[\]()]/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsPlaying(true);
      setLoading(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setLoading(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      onClick={handleTogglePlay}
      disabled={loading}
      className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer ${
        isPlaying
          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
          : 'text-slate-400 hover:text-white hover:bg-white/10'
      }`}
      title={isPlaying ? 'Stop reading' : 'Read answer aloud'}
      aria-label={isPlaying ? 'Stop reading' : 'Read answer aloud'}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
      ) : isPlaying ? (
        <VolumeX className="w-3.5 h-3.5 text-cyan-400" />
      ) : (
        <Volume2 className="w-3.5 h-3.5" />
      )}
      <span className="text-[11px] font-medium hidden sm:inline">
        {isPlaying ? 'Pause' : 'Listen'}
      </span>
    </button>
  );
};
