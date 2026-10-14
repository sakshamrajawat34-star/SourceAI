import React from 'react';
import { Sparkles, Compass, Lightbulb, Code, BookOpen, PenTool, Image as ImageIcon } from 'lucide-react';
import { AIMode, Attachment } from '../types';
import { MessageComposer } from './MessageComposer';
import { sound } from '../utils/sound';

interface HomeScreenProps {
  onSendMessage: (content: string, attachments: Attachment[]) => void;
  onSelectMode: (mode: AIMode) => void;
  onOpenImageGen: () => void;
  currentMode: AIMode;
  webSearch: boolean;
}

const SUGGESTION_CHIPS = [
  {
    title: 'Ask Anything',
    prompt: 'Explain quantum computing in simple everyday terms, including why superposition matters.',
    icon: Compass,
    mode: 'general' as AIMode,
    color: 'hover:border-cyan-400/40 text-cyan-300',
  },
  {
    title: 'Learn Something',
    prompt: 'Provide a structured 5-step breakdown of how transformer neural networks process language.',
    icon: BookOpen,
    mode: 'study' as AIMode,
    color: 'hover:border-amber-400/40 text-amber-300',
  },
  {
    title: 'Write for Me',
    prompt: 'Draft an executive pitch letter for a revolutionary clean-energy technology startup.',
    icon: PenTool,
    mode: 'writing' as AIMode,
    color: 'hover:border-blue-400/40 text-blue-300',
  },
  {
    title: 'Code with AI',
    prompt: 'Write a TypeScript algorithm for an LRU Cache with O(1) time complexity and explain each line.',
    icon: Code,
    mode: 'coding' as AIMode,
    color: 'hover:border-emerald-400/40 text-emerald-300',
  },
  {
    title: 'Understand an Image',
    prompt: 'What visual features should I upload for you to diagnose, summarize, or extract text from?',
    icon: ImageIcon,
    mode: 'general' as AIMode,
    color: 'hover:border-purple-400/40 text-purple-300',
  },
  {
    title: 'Explore an Idea',
    prompt: 'Brainstorm 5 high-impact, science-grounded inventions that could reverse ocean acidification.',
    icon: Lightbulb,
    mode: 'creative' as AIMode,
    color: 'hover:border-rose-400/40 text-rose-300',
  },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSendMessage,
  onSelectMode,
  onOpenImageGen,
  currentMode,
  webSearch,
}) => {
  const handleChipClick = (chip: typeof SUGGESTION_CHIPS[0]) => {
    sound.playClick();
    onSelectMode(chip.mode);
    onSendMessage(chip.prompt, []);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] px-4 py-8 relative overflow-hidden text-center">
      {/* Background Ambient Glowing Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[550px] h-96 sm:h-[550px] bg-gradient-to-tr from-cyan-500/15 via-blue-600/10 to-indigo-600/15 rounded-full blur-[140px] pointer-events-none animate-orb" />
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Brand & Hero Container */}
      <div className="relative z-10 w-full max-w-3xl flex flex-col items-center animate-fade-in">
        {/* Floating Brand Orb */}
        <div className="mb-6 relative group">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl p-[2px] bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 shadow-[0_0_40px_rgba(56,189,248,0.35)] transition-transform duration-500 group-hover:scale-105">
            <div className="w-full h-full bg-slate-950/80 rounded-[22px] flex items-center justify-center backdrop-blur-xl border border-white/20">
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-300 drop-shadow-[0_0_12px_rgba(56,189,248,0.7)]" />
            </div>
          </div>
        </div>

        {/* Title & Taglines */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-2">
          <span className="bg-gradient-to-r from-white via-cyan-100 to-blue-300 bg-clip-text text-transparent">
            SOURCE AI
          </span>
        </h1>
        <p className="text-sm sm:text-lg font-semibold tracking-wide text-cyan-400/90 mb-1">
          Intelligence, Without Limits.
        </p>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-8 sm:mb-10 font-normal">
          One place to think, create, explore, and discover.
        </p>

        {/* Floating AI Composer */}
        <div className="w-full mb-8">
          <MessageComposer
            onSendMessage={onSendMessage}
            isStreaming={false}
            currentMode={currentMode}
            webSearch={webSearch}
            placeholder="What would you like to explore today? Type or speak..."
          />
        </div>

        {/* Suggestion Chips */}
        <div className="w-full max-w-2xl">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {SUGGESTION_CHIPS.map((chip, idx) => {
              const Icon = chip.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleChipClick(chip)}
                  className={`p-3 sm:p-3.5 rounded-2xl liquid-glass text-left border border-white/10 hover:bg-white/10 transition-all duration-200 active:scale-95 group cursor-pointer ${chip.color}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 opacity-80 group-hover:opacity-100 transition-opacity" />
                    <span className="text-xs font-bold text-white tracking-tight">{chip.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 group-hover:text-slate-300 transition-colors">
                    {chip.prompt}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Credit Tagline */}
        <div className="mt-12 text-[11px] text-slate-500 tracking-wider">
          Source Lab • Developed by <span className="text-slate-300 font-medium">Saksham Rajawat</span>
        </div>
      </div>
    </div>
  );
};
