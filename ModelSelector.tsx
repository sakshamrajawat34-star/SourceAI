import React, { useState, useRef, useEffect, memo } from 'react';
import { Sparkles, Brain, Code, BookOpen, PenTool, Palette, ChevronDown, Check, Zap, Cpu } from 'lucide-react';
import { AIMode, PreferredModel } from '../types';
import { sound } from '../utils/sound';

interface ModelSelectorProps {
  currentMode: AIMode;
  onSelectMode: (mode: AIMode) => void;
  preferredModel?: PreferredModel;
  onSelectModel?: (model: PreferredModel) => void;
}

export const MODES: Array<{
  id: AIMode;
  name: string;
  badge: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = [
  {
    id: 'general',
    name: 'General Assistant',
    badge: 'Standard',
    desc: 'Everyday inquiries, brainstorming, quick explanations & synthesis',
    icon: Sparkles,
    color: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
  },
  {
    id: 'reasoning',
    name: 'Advanced Reasoning',
    badge: 'Reasoning',
    desc: 'Mathematics, physics, logic proofs & step-by-step problem solving',
    icon: Brain,
    color: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
  },
  {
    id: 'coding',
    name: 'Coding & Architecture',
    badge: 'Code Engine',
    desc: 'Code generation, debugging, refactoring, systems & algorithms',
    icon: Code,
    color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
  },
  {
    id: 'writing',
    name: 'Writing & Editorial',
    badge: 'Prose',
    desc: 'Essays, professional letters, document review, and polished captions',
    icon: PenTool,
    color: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
  },
  {
    id: 'study',
    name: 'Study & Tutoring',
    badge: 'Academy',
    desc: 'Step-by-step subject explanations, flashcards, concept breakdowns',
    icon: BookOpen,
    color: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
  },
  {
    id: 'creative',
    name: 'Creative Studio',
    badge: 'Creative',
    desc: 'Stories, screenplays, imagery prompts, worldbuilding, and lyrics',
    icon: Palette,
    color: 'text-rose-400 bg-rose-500/15 border-rose-500/30',
  },
];

export const ModelSelector: React.FC<ModelSelectorProps> = memo(({
  currentMode,
  onSelectMode,
  preferredModel = 'auto',
  onSelectModel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeMode = MODES.find((m) => m.id === currentMode) || MODES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          sound.playClick();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full liquid-glass-pill text-xs font-medium text-slate-200 hover:text-white hover:border-cyan-400/40 transition-all cursor-pointer shadow-sm active:scale-95"
        aria-label="Select intelligence mode and model"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            preferredModel === 'gemini-3.1-flash-lite'
              ? 'bg-amber-400'
              : activeMode.color.includes('purple')
              ? 'bg-purple-400'
              : activeMode.color.includes('emerald')
              ? 'bg-emerald-400'
              : 'bg-cyan-400'
          }`}
        />
        <span className="font-semibold text-slate-100">{activeMode.name}</span>
        {preferredModel === 'gemini-3.1-flash-lite' && (
          <span className="text-[10px] text-amber-300 font-mono flex items-center gap-0.5">
            <Zap className="w-2.5 h-2.5 inline" />Lite
          </span>
        )}
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 sm:w-84 liquid-glass rounded-3xl p-2.5 shadow-2xl border border-white/15 z-50 backdrop-blur-xl animate-fade-in">
          {/* Model Engine Speed Selection Header */}
          {onSelectModel && (
            <div className="mb-2 p-2 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-1 flex items-center justify-between">
                <span>Speed & Model Routing</span>
                <span className="text-cyan-400 font-mono">Gemini</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => {
                    sound.playClick();
                    onSelectModel('auto');
                  }}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-medium transition-all text-center cursor-pointer ${
                    preferredModel === 'auto'
                      ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/40'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                  title="Smart routing: chooses fastest model based on task"
                >
                  ✦ Auto
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    onSelectModel('gemini-3.1-flash-lite');
                  }}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-medium transition-all text-center cursor-pointer ${
                    preferredModel === 'gemini-3.1-flash-lite'
                      ? 'bg-amber-500/30 text-amber-200 border border-amber-400/40'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                  title="Flash Lite: Ultra fast sub-second TTFT"
                >
                  ⚡ Lite (Fast)
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    onSelectModel('gemini-3.8-flash');
                  }}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-medium transition-all text-center cursor-pointer ${
                    preferredModel === 'gemini-3.8-flash'
                      ? 'bg-blue-500/30 text-blue-200 border border-blue-400/40'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                  title="Flash 3.8: Flagship balanced"
                >
                  💎 Flash 3.8
                </button>
              </div>
            </div>
          )}

          <div className="px-3 py-1.5 border-b border-white/10 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Intelligence Persona & Mode
          </div>
          <div className="mt-1 space-y-1">
            {MODES.map((mode) => {
              const ModeIcon = mode.icon;
              const isSelected = mode.id === currentMode;

              return (
                <button
                  key={mode.id}
                  onClick={() => {
                    sound.playToolSelect();
                    onSelectMode(mode.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-2xl transition-all flex items-start gap-2.5 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className={`p-1.5 rounded-xl border ${mode.color} shrink-0 mt-0.5`}>
                    <ModeIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">{mode.name}</span>
                      {isSelected && <Check className="w-3 h-3 text-cyan-400 shrink-0 ml-1" />}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{mode.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});

ModelSelector.displayName = 'ModelSelector';
