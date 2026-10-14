import React from 'react';
import { X } from 'lucide-react';
import { ChatSession, AIMode } from '../types';
import { Sidebar } from './Sidebar';
import { sound } from '../utils/sound';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: (mode?: AIMode) => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onOpenSettings: () => void;
  onOpenSoundSettings: () => void;
  onOpenAbout: () => void;
  onOpenImageGen: () => void;
  onSelectModeShortcut: (mode: AIMode) => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  onOpenSettings,
  onOpenSoundSettings,
  onOpenAbout,
  onOpenImageGen,
  onSelectModeShortcut,
}) => {
  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={() => {
          sound.playClick();
          onClose();
        }}
      />

      {/* Drawer Panel */}
      <div className="relative w-80 max-w-[85vw] h-full bg-[#050b14]/95 backdrop-blur-2xl border-r border-white/15 z-10 flex flex-col shadow-2xl animate-slide-right">
        {/* Close Button at top corner */}
        <div className="absolute top-3.5 right-3.5 z-20">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-full bg-white/10 text-slate-300 hover:text-white cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <Sidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={(id) => {
            onSelectSession(id);
            onClose();
          }}
          onNewChat={(mode) => {
            onNewChat(mode);
            onClose();
          }}
          onDeleteSession={onDeleteSession}
          onRenameSession={onRenameSession}
          onOpenSettings={() => {
            onOpenSettings();
            onClose();
          }}
          onOpenSoundSettings={() => {
            onOpenSoundSettings();
            onClose();
          }}
          onOpenAbout={() => {
            onOpenAbout();
            onClose();
          }}
          onOpenImageGen={() => {
            onOpenImageGen();
            onClose();
          }}
          isCollapsed={false}
          onToggleCollapse={onClose}
          onSelectModeShortcut={(mode) => {
            onSelectModeShortcut(mode);
            onClose();
          }}
        />
      </div>
    </div>
  );
};
