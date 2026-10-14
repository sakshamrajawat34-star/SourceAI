import React, { useState } from 'react';
import { X, Image as ImageIcon, Sparkles, Download, Loader2, ArrowRight } from 'lucide-react';
import { sound } from '../utils/sound';

interface ImageGenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertToChat?: (imageUrl: string, prompt: string) => void;
}

export const ImageGenModal: React.FC<ImageGenModalProps> = ({ isOpen, onClose, onInsertToChat }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3' | '3:4'>('1:1');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    sound.playSend();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, aspectRatio }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      setGeneratedImage(data.imageUrl);
      sound.playComplete();
    } catch (err: any) {
      setError(err?.message || 'Failed to generate image. Please check API configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    sound.playClick();
    const a = document.createElement('a');
    a.href = generatedImage;
    a.download = `source-ai-generation-${Date.now()}.png`;
    a.click();
  };

  const handleInsert = () => {
    if (!generatedImage) return;
    sound.playClick();
    onInsertToChat?.(generatedImage, prompt);
    onClose();
  };

  const samplePrompts = [
    'A futuristic liquid glass sphere floating over a dark cybernetic Tokyo skyline, neon reflection, 8k render',
    'Minimalist Apple-style transparent AI core device glowing with electric blue and purple photon light',
    'Hyper-detailed iridescent crystalline hummingbird suspended in zero gravity with refraction optics',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl liquid-glass rounded-3xl p-6 md:p-7 shadow-2xl border border-white/15 text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Liquid Image Studio</h2>
              <p className="text-xs text-slate-400">Generate visual assets powered by Gemini AI</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-4">
          {/* Prompt input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Image Prompt</label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want SOURCE AI to generate in detail..."
              className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors resize-none"
            />
          </div>

          {/* Quick Ideas */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-slate-400">Try an inspiration:</span>
            <div className="flex flex-col gap-1.5">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    sound.playClick();
                    setPrompt(p);
                  }}
                  className="text-left text-[11px] text-cyan-300 hover:text-cyan-200 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/5 transition-all text-ellipsis overflow-hidden whitespace-nowrap cursor-pointer"
                >
                  "{p}"
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Aspect Ratio</label>
            <div className="grid grid-cols-5 gap-2">
              {(['1:1', '16:9', '9:16', '4:3', '3:4'] as const).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => {
                    sound.playClick();
                    setAspectRatio(ratio);
                  }}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    aspectRatio === ratio
                      ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || loading}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Dreaming & Rendering...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Image</span>
              </>
            )}
          </button>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Generated Image Result Display */}
          {generatedImage && (
            <div className="space-y-3 pt-3 border-t border-white/10">
              <div className="rounded-2xl overflow-hidden border border-white/15 bg-black/50 shadow-2xl relative group">
                <img
                  src={generatedImage}
                  alt={prompt}
                  className="w-full max-h-80 object-contain mx-auto"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Download Image</span>
                </button>
                {onInsertToChat && (
                  <button
                    onClick={handleInsert}
                    className="flex-1 py-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>Use in Conversation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
