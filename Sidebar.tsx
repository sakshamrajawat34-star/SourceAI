import React, { useState } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  Sparkles,
  Image as ImageIcon,
  BookOpen,
  PenTool,
  Code2,
  Mic,
  Settings,
  Volume2,
  Info,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import { ChatSession, AIMode } from '../types';
import { sound } from '../utils/sound';

interface SidebarProps {
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
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onSelectModeShortcut: (mode: AIMode) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
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
  isCollapsed,
  onToggleCollapse,
  onSelectModeShortcut,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startRename = (s: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    setEditingId(s.id);
    setEditTitle(s.title);
  };

  const saveRename = (id: string, e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    sound.playClick();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <aside
      className={`relative h-full flex flex-col liquid-glass border-r border-white/10 transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-16' : 'w-64 sm:w-72'
      }`}
    >
      {/* Top Header: Logo + Collapse Button */}
      <div className="flex items-center justify-between p-3.5 border-b border-white/10">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-500 p-[1px] shadow-sm shadow-cyan-500/30 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-300" />
              </div>
            </div>
            <div className="min-w-0">
              <span className="font-bold text-sm tracking-tight text-white block truncate">SOURCE AI</span>
              <span className="text-[10px] text-cyan-400 font-medium block truncate">Source Lab</span>
            </div>
          </div>
        )}

        <button
          onClick={() => {
            sound.playClick();
            onToggleCollapse();
          }}
          className={`p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer ${
            isCollapsed ? 'mx-auto' : ''
          }`}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={() => {
            sound.playClick();
            onNewChat();
          }}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-400/30 text-cyan-200 text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer ${
            isCollapsed ? 'px-2' : 'px-4'
          }`}
          title="Start new conversation"
        >
          <Plus className="w-4 h-4 text-cyan-300" />
          {!isCollapsed && <span>New Chat</span>}
        </button>
      </div>

      {/* Quick Intelligence Modes Shortcuts */}
      {!isCollapsed && (
        <div className="px-3 py-1 space-y-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 py-1">
            Studio Tools
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => {
                sound.playToolSelect();
                onOpenImageGen();
              }}
              className="flex items-center gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 hover:text-white border border-white/5 transition-all text-left cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="truncate text-[11px] font-medium">Images</span>
            </button>
            <button
              onClick={() => {
                sound.playToolSelect();
                onSelectModeShortcut('coding');
              }}
              className="flex items-center gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 hover:text-white border border-white/5 transition-all text-left cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate text-[11px] font-medium">Coding</span>
            </button>
            <button
              onClick={() => {
                sound.playToolSelect();
                onSelectModeShortcut('study');
              }}
              className="flex items-center gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 hover:text-white border border-white/5 transition-all text-left cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate text-[11px] font-medium">Study</span>
            </button>
            <button
              onClick={() => {
                sound.playToolSelect();
                onSelectModeShortcut('writing');
              }}
              className="flex items-center gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 hover:text-white border border-white/5 transition-all text-left cursor-pointer"
            >
              <PenTool className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="truncate text-[11px] font-medium">Writing</span>
            </button>
          </div>
        </div>
      )}

      {/* Search Input (When Expanded) */}
      {!isCollapsed && (
        <div className="px-3 pt-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400/50"
            />
          </div>
        </div>
      )}

      {/* Recent Conversations List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 mt-1 scrollbar-thin">
        {!isCollapsed && (
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-1">
            Recent Chats
          </div>
        )}

        {filteredSessions.length === 0 ? (
          !isCollapsed && (
            <p className="text-[11px] text-slate-500 text-center py-6 px-4">
              {searchQuery ? 'No matching conversations' : 'No previous chats yet.'}
            </p>
          )
        ) : (
          filteredSessions.map((session) => {
            const isActive = session.id === activeSessionId;
            const isEditing = editingId === session.id;

            return (
              <div
                key={session.id}
                onClick={() => {
                  sound.playClick();
                  onSelectSession(session.id);
                }}
                className={`group relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-white font-medium border border-cyan-400/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
                title={session.title}
              >
                <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />

                {!isCollapsed && (
                  <>
                    {isEditing ? (
                      <div className="flex-1 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveRename(session.id, e);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          autoFocus
                          className="w-full bg-black/60 border border-cyan-400 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none"
                        />
                        <button
                          onClick={(e) => saveRename(session.id, e)}
                          className="p-1 text-cyan-400 hover:text-cyan-300"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(null);
                          }}
                          className="p-1 text-slate-400 hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="flex-1 truncate text-left">{session.title}</span>
                        {/* Hover Actions: Rename & Delete */}
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                          <button
                            onClick={(e) => startRename(session, e)}
                            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-cyan-300"
                            title="Rename"
                            aria-label="Rename conversation"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              sound.playClick();
                              onDeleteSession(session.id);
                            }}
                            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-rose-400"
                            title="Delete"
                            aria-label="Delete conversation"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Menu: Sound, Settings, About */}
      <div className="p-2 border-t border-white/10 space-y-1">
        {/* Sound Settings Trigger */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenSoundSettings();
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="Sound Settings"
        >
          <Volume2 className="w-4 h-4 text-cyan-400 shrink-0" />
          {!isCollapsed && <span>Acoustic Audio</span>}
        </button>

        {/* Preferences / User Settings */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenSettings();
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="Preferences"
        >
          <Settings className="w-4 h-4 text-slate-400 shrink-0" />
          {!isCollapsed && <span>Preferences</span>}
        </button>

        {/* About SOURCE AI Dialog */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenAbout();
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="About SOURCE AI"
        >
          <Info className="w-4 h-4 text-blue-400 shrink-0" />
          {!isCollapsed && <span>About SOURCE AI</span>}
        </button>

        {/* Developer Credit in Sidebar Footer */}
        {!isCollapsed && (
          <div className="pt-2 px-2 text-[10px] text-slate-500 border-t border-white/5 text-center">
            Developed by <span className="text-slate-300 font-medium">Saksham Rajawat</span>
          </div>
        )}
      </div>
    </aside>
  );
};
