import React from 'react';
import { Globe, Image, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound';

interface ToolSelectorProps {
  webSearch: boolean;
  onToggleWebSearch: () => void;
  onOpenImageGen: () => void;
}

export const ToolSelector: React.FC<ToolSelectorProps> = ({
  webSearch,
  onToggleWebSearch,
  onOpenImageGen,
}) => {
  return (
    <div className="flex items-center gap-1.5">
      {/* Web Search Grounding Button */}
      <button
        onClick={() => {
          sound.playToolSelect();
          onToggleWebSearch();
        }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 cursor-pointer ${
          webSearch
            ? 'bg-blue-500/25 border border-blue-400/50 text-blue-300 shadow-sm shadow-blue-500/20'
            : 'liquid-glass-pill text-slate-300 hover:text-white hover:border-white/20'
        }`}
        title={webSearch ? 'Web search enabled (live factual grounding)' : 'Enable web search'}
        aria-pressed={webSearch}
      >
        <Globe className={`w-3.5 h-3.5 ${webSearch ? 'text-blue-400 animate-pulse' : 'text-slate-400'}`} />
        <span>Search {webSearch ? 'ON' : ''}</span>
      </button>

      {/* Image Gen Studio Trigger */}
      <button
        onClick={() => {
          sound.playClick();
          onOpenImageGen();
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full liquid-glass-pill text-xs font-medium text-slate-300 hover:text-white hover:border-white/20 transition-all active:scale-95 cursor-pointer"
        title="Open Liquid Image Studio"
      >
        <Image className="w-3.5 h-3.5 text-purple-400" />
        <span className="hidden sm:inline">Images</span>
      </button>
    </div>
  );
};
