import React from 'react';
import { Menu, Plus, Sparkles, Image, Settings, Volume2, Info, X } from 'lucide-react';
import { sound } from '../utils/sound';
import { AIMode } from '../types';

interface MobileNavigationProps {
  onOpenDrawer: () => void;
  onNewChat: () => void;
  onOpenImageGen: () => void;
  onOpenSettings: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  onOpenDrawer,
  onNewChat,
  onOpenImageGen,
  onOpenSettings,
}) => {
  return (
    <div className="md:hidden fixed top-3 left-3 right-3 z-30 flex items-center justify-between px-3.5 py-2.5 liquid-glass rounded-2xl border border-white/15 shadow-xl">
      {/* Left: Drawer button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            sound.playMenuOpen();
            onOpenDrawer();
          }}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer"
          aria-label="Open conversation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-500 p-[1px] flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            </div>
          </div>
          <span className="font-bold text-sm tracking-tight text-white">SOURCE AI</span>
        </div>
      </div>

      {/* Right Quick Actions */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => {
            sound.playClick();
            onOpenImageGen();
          }}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer"
          aria-label="Liquid Image Studio"
          title="Images"
        >
          <Image className="w-4 h-4 text-purple-400" />
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onNewChat();
          }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-semibold active:scale-95 transition-all cursor-pointer"
          aria-label="New chat"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New</span>
        </button>
      </div>
    </div>
  );
};
