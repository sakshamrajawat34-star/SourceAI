import React from 'react';
import { X, Sparkles, Cpu, ShieldCheck, Code, Globe, User, Heart } from 'lucide-react';
import { sound } from '../utils/sound';

interface AboutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutDialog: React.FC<AboutDialogProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg liquid-glass rounded-3xl p-6 md:p-8 shadow-2xl border border-white/15 text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header with Close */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1.5px] shadow-lg shadow-cyan-500/25">
              <div className="w-full h-full bg-slate-950/80 rounded-2xl flex items-center justify-center backdrop-blur-xl">
                <Sparkles className="w-6 h-6 text-cyan-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">SOURCE AI</h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/30">
                  v2.5
                </span>
              </div>
              <p className="text-xs text-cyan-400 font-medium tracking-wide">Intelligence, Without Limits.</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-6 space-y-6 text-sm text-slate-300">
          {/* Developer Credit Callout - Highlighted clearly */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-purple-500/10 border border-cyan-500/20 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-300 border border-cyan-500/30">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-cyan-400 font-semibold">Studio & Creator</p>
                <p className="text-base font-bold text-white tracking-tight">Developed by Saksham Rajawat</p>
                <p className="text-xs text-slate-400">Created by <span className="text-slate-200 font-medium">Source Lab</span></p>
              </div>
            </div>
          </div>

          {/* Mission & Overview */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">About The Project</h3>
            <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">
              SOURCE AI is an intelligent conversational AI platform inspired by the clean, ergonomic elegance of Apple's Liquid Glass interface. Powered by Google’s Gemini multimodal models, it provides rapid reasoning, clean coding assistance, study guidance, creative generation, voice integration, and web search grounding.
            </p>
          </div>

          {/* Key Capabilities */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Architectural Highlights</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
                <Cpu className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Gemini 3.8 Intelligence</h4>
                  <p className="text-[11px] text-slate-400">Streaming SSE responses with zero-latency token delivery.</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
                <Globe className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Google Search Grounding</h4>
                  <p className="text-[11px] text-slate-400">Live factual search grounding with verified web citations.</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
                <Code className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Full-Stack Security</h4>
                  <p className="text-[11px] text-slate-400">Server-side API proxying with strict key isolation.</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Local-First Privacy</h4>
                  <p className="text-[11px] text-slate-400">All chat histories remain stored directly on your device.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy & Transparency */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5 text-xs text-slate-400">
            <h4 className="font-semibold text-slate-200">Data & Privacy Transparency</h4>
            <p>
              Your conversations are stored in your browser’s local storage. No conversations are retained in a permanent remote database. Voice input requires one-time microphone permission and is transcribed locally or via standard browser speech APIs.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>by <strong className="text-slate-300">Saksham Rajawat</strong> at Source Lab</span>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-all active:scale-95 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
