import React, { useState } from 'react';
import { Volume2, VolumeX, X, Bell, Sparkles, Send, Play } from 'lucide-react';
import { sound } from '../utils/sound';
import { SoundSettings } from '../types';

interface SoundSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange?: (settings: SoundSettings) => void;
}

export const SoundSettingsDialog: React.FC<SoundSettingsDialogProps> = ({ isOpen, onClose, onSettingsChange }) => {
  const [settings, setSettings] = useState<SoundSettings>(() => sound.getSettings());

  if (!isOpen) return null;

  const update = (partial: Partial<SoundSettings>) => {
    const next = { ...settings, ...partial };
    setSettings(next);
    sound.saveSettings(next);
    onSettingsChange?.(next);
  };

  const testClickSound = () => {
    sound.playClick();
  };

  const testSendSound = () => {
    sound.playSend();
  };

  const testCompleteSound = () => {
    sound.playComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md liquid-glass rounded-3xl p-6 shadow-2xl border border-white/15 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Sound Effects</h2>
              <p className="text-xs text-slate-400">Custom synthesized liquid glass acoustics</p>
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

        {/* Body */}
        <div className="mt-5 space-y-5">
          {/* Master Enable Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              {settings.soundEnabled ? (
                <Volume2 className="w-5 h-5 text-cyan-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-500" />
              )}
              <div>
                <p className="text-sm font-semibold text-white">Enable Interface Audio</p>
                <p className="text-xs text-slate-400">Plays subtle glass chimes on interaction</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => {
                  update({ soundEnabled: e.target.checked });
                  if (e.target.checked) sound.playClick();
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:to-blue-600"></div>
            </label>
          </div>

          {/* Master Volume Slider */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-slate-300">Master Volume</span>
              <span className="font-mono text-cyan-400 font-semibold">{Math.round(settings.masterVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              disabled={!settings.soundEnabled}
              value={settings.masterVolume}
              onChange={(e) => {
                update({ masterVolume: parseFloat(e.target.value) });
              }}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 disabled:opacity-40"
            />
          </div>

          {/* Individual sound toggles */}
          <div className="space-y-2.5">
            {/* Interface Sounds */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-colors">
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-medium text-slate-200">Interface & Tap Sounds</span>
              </div>
              <input
                type="checkbox"
                disabled={!settings.soundEnabled}
                checked={settings.interfaceSounds}
                onChange={(e) => update({ interfaceSounds: e.target.checked })}
                className="w-4 h-4 accent-cyan-400 rounded cursor-pointer disabled:opacity-40"
              />
            </div>

            {/* Response Sounds */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-colors">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-medium text-slate-200">AI Response Completed Chime</span>
              </div>
              <input
                type="checkbox"
                disabled={!settings.soundEnabled}
                checked={settings.responseSounds}
                onChange={(e) => update({ responseSounds: e.target.checked })}
                className="w-4 h-4 accent-cyan-400 rounded cursor-pointer disabled:opacity-40"
              />
            </div>
          </div>

          {/* Sound Testing Area */}
          <div className="pt-2">
            <p className="text-xs font-medium text-slate-400 mb-2">Preview Audio Effects:</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={testClickSound}
                disabled={!settings.soundEnabled}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-slate-200 transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
              >
                <Play className="w-3 h-3 text-cyan-400" />
                <span>Tap</span>
              </button>
              <button
                onClick={testSendSound}
                disabled={!settings.soundEnabled}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-slate-200 transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
              >
                <Send className="w-3 h-3 text-blue-400" />
                <span>Whoosh</span>
              </button>
              <button
                onClick={testCompleteSound}
                disabled={!settings.soundEnabled}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-slate-200 transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>Harmonic</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium text-xs shadow-lg shadow-cyan-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
