import React, { useState } from 'react';
import { X, Moon, Sun, Monitor, Mic, Sparkles, Trash2, Sliders, Zap } from 'lucide-react';
import { sound } from '../utils/sound';
import { UserSettings } from '../types';

interface UserSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
  onClearAllHistory: () => void;
}

export const UserSettingsDialog: React.FC<UserSettingsDialogProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onClearAllHistory,
}) => {
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md liquid-glass rounded-3xl p-6 shadow-2xl border border-white/15 text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Preferences</h2>
              <p className="text-xs text-slate-400">Configure SOURCE AI speed, behavior & visuals</p>
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

        {/* Settings options */}
        <div className="mt-5 space-y-4">
          {/* Theme selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Interface Theme</label>
            <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10">
              <button
                onClick={() => {
                  sound.playClick();
                  onUpdateSettings({ theme: 'dark' });
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  settings.theme === 'dark'
                    ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border border-cyan-400/40 text-cyan-300 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Midnight</span>
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  onUpdateSettings({ theme: 'light' });
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  settings.theme === 'light'
                    ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border border-cyan-400/40 text-cyan-300 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Daylight</span>
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  onUpdateSettings({ theme: 'system' });
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  settings.theme === 'system'
                    ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border border-cyan-400/40 text-cyan-300 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>System</span>
              </button>
            </div>
          </div>

          {/* Model Routing Preference */}
          <div className="space-y-1.5 p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Speed & Intelligence Engine</span>
            </div>
            <select
              value={settings.preferredModel || 'auto'}
              onChange={(e) => {
                sound.playClick();
                onUpdateSettings({ preferredModel: e.target.value as any });
              }}
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-slate-200 text-xs focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="auto" className="bg-slate-900 text-white">✦ Auto Smart Router (Speed + Accuracy)</option>
              <option value="gemini-3.1-flash-lite" className="bg-slate-900 text-white">⚡ Gemini 3.1 Flash Lite (Ultra-Fast &lt; 300ms)</option>
              <option value="gemini-3.8-flash" className="bg-slate-900 text-white">💎 Gemini 3.8 Flash (Balanced Flagship)</option>
            </select>
            <p className="text-[10px] text-slate-400">
              Auto routes simple greetings and text tasks to Flash Lite for sub-second responses.
            </p>
          </div>

          {/* Performance Stats Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
            <div>
              <p className="text-xs font-semibold text-white">Display Speed & TTFT Metrics</p>
              <p className="text-[10px] text-slate-400">Shows Time to First Token and elapsed duration</p>
            </div>
            <input
              type="checkbox"
              checked={settings.showPerformanceStats}
              onChange={(e) => {
                sound.playClick();
                onUpdateSettings({ showPerformanceStats: e.target.checked });
              }}
              className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
            />
          </div>

          {/* Opening animation toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <div>
                <p className="text-xs font-semibold text-white">Opening Glass Animation</p>
                <p className="text-[10px] text-slate-400">Display liquid orb on initial startup</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.showOpeningAnimation}
              onChange={(e) => {
                sound.playClick();
                onUpdateSettings({ showOpeningAnimation: e.target.checked });
              }}
              className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
            />
          </div>

          {/* TTS Voice Picker */}
          <div className="space-y-1.5 p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Mic className="w-4 h-4 text-cyan-400" />
              <span>Text-to-Speech Voice</span>
            </div>
            <select
              value={settings.ttsVoice}
              onChange={(e) => {
                sound.playClick();
                onUpdateSettings({ ttsVoice: e.target.value as any });
              }}
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-slate-200 text-xs focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="Kore" className="bg-slate-900 text-white">Kore (Clear, Professional, Neutral)</option>
              <option value="Puck" className="bg-slate-900 text-white">Puck (Enthusiastic, Bright)</option>
              <option value="Zephyr" className="bg-slate-900 text-white">Zephyr (Warm, Conversational)</option>
              <option value="Aoede" className="bg-slate-900 text-white">Aoede (Expressive)</option>
              <option value="Fenrir" className="bg-slate-900 text-white">Fenrir (Deep, Authoritative)</option>
            </select>
          </div>

          {/* Auto Read Aloud Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
            <div>
              <p className="text-xs font-semibold text-white">Auto-Read AI Answers</p>
              <p className="text-[10px] text-slate-400">Speak completed answers aloud automatically</p>
            </div>
            <input
              type="checkbox"
              checked={settings.autoReadResponses}
              onChange={(e) => {
                sound.playClick();
                onUpdateSettings({ autoReadResponses: e.target.checked });
              }}
              className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
            />
          </div>

          {/* Custom System Instruction */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Custom AI Persona / Instructions
            </label>
            <textarea
              rows={2}
              value={settings.systemInstruction}
              onChange={(e) => onUpdateSettings({ systemInstruction: e.target.value })}
              placeholder="e.g. Always respond concisely; provide TypeScript examples..."
              className="w-full p-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors resize-none"
            />
          </div>

          {/* Clear history */}
          <div className="pt-2 border-t border-white/10">
            {!confirmClear ? (
              <button
                onClick={() => setConfirmClear(true)}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-all active:scale-98 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Chat History</span>
              </button>
            ) : (
              <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 space-y-2">
                <p className="text-xs text-rose-300 font-medium text-center">Are you sure? This cannot be undone.</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      sound.playClick();
                      onClearAllHistory();
                      setConfirmClear(false);
                      onClose();
                    }}
                    className="flex-1 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 cursor-pointer"
                  >
                    Yes, Clear All
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="flex-1 py-1.5 rounded-xl bg-white/10 text-slate-300 text-xs hover:bg-white/20 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-white/10 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium text-xs shadow-md shadow-cyan-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
