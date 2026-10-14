import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import { Sparkles, Volume2, Settings, Info, Sun, Moon } from 'lucide-react';
import {
  ChatSession,
  ChatMessage,
  AIMode,
  Attachment,
  UserSettings,
  PreferredModel,
  GroundingSource,
  PerformanceMetrics,
} from '../types';
import { HomeScreen } from './HomeScreen';
import { ChatWindow } from './ChatWindow';
import { Sidebar } from './Sidebar';
import { MobileNavigation } from './MobileNavigation';
import { MobileDrawer } from './MobileDrawer';
import { ModelSelector } from './ModelSelector';
import { ToolSelector } from './ToolSelector';
import { OpeningAnimation } from './OpeningAnimation';
import { sound } from '../utils/sound';

// Lazy load secondary dialogs and tools for near-instant initial page render
const SoundSettingsDialog = lazy(() =>
  import('./SoundSettingsDialog').then((m) => ({ default: m.SoundSettingsDialog }))
);
const UserSettingsDialog = lazy(() =>
  import('./UserSettingsDialog').then((m) => ({ default: m.UserSettingsDialog }))
);
const AboutDialog = lazy(() =>
  import('./AboutDialog').then((m) => ({ default: m.AboutDialog }))
);
const ImageGenModal = lazy(() =>
  import('./ImageGenModal').then((m) => ({ default: m.ImageGenModal }))
);

const STORAGE_KEY_SESSIONS = 'source_ai_chat_sessions_v2';
const STORAGE_KEY_SETTINGS = 'source_ai_user_settings_v2';
const STORAGE_KEY_ANIM_PLAYED = 'source_ai_intro_played_session';

export const AppShell: React.FC = () => {
  // User settings state
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      theme: 'dark',
      showOpeningAnimation: true,
      ttsVoice: 'Kore',
      autoReadResponses: false,
      systemInstruction: '',
      streamSpeed: 'fast',
      preferredModel: 'auto',
      showPerformanceStats: true,
    };
  });

  // Sessions state
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [currentMode, setCurrentMode] = useState<AIMode>('general');
  const [webSearch, setWebSearch] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Modals state
  const [showSoundModal, setShowSoundModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);
  const [showImageGenModal, setShowImageGenModal] = useState<boolean>(false);
  const [showOpening, setShowOpening] = useState<boolean>(() => {
    const hasPlayed = sessionStorage.getItem(STORAGE_KEY_ANIM_PLAYED);
    return !hasPlayed;
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync theme
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else if (settings.theme === 'dark') {
      root.classList.remove('light');
      root.classList.add('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
      root.classList.toggle('light', !prefersDark);
    }
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Persist sessions with debounced local storage write
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
      } catch {}
    }, 200);
    return () => clearTimeout(timer);
  }, [sessions]);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

  // New Chat handler
  const handleNewChat = useCallback(
    (mode?: AIMode) => {
      sound.playClick();
      if (isStreaming) {
        abortControllerRef.current?.abort();
        setIsStreaming(false);
      }
      const newMode = mode || currentMode;
      setCurrentMode(newMode);
      setActiveSessionId(null);
      setChatError(null);
    },
    [isStreaming, currentMode]
  );

  const handleSelectSession = useCallback(
    (id: string) => {
      if (isStreaming) {
        abortControllerRef.current?.abort();
        setIsStreaming(false);
      }
      setActiveSessionId(id);
      const s = sessions.find((sess) => sess.id === id);
      if (s) {
        setCurrentMode(s.mode);
        setWebSearch(s.webSearch);
      }
      setChatError(null);
    },
    [isStreaming, sessions]
  );

  const handleDeleteSession = useCallback(
    (id: string) => {
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (activeSessionId === id) {
        setActiveSessionId(null);
      }
    },
    [activeSessionId]
  );

  const handleRenameSession = useCallback((id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle, updatedAt: Date.now() } : s))
    );
  }, []);

  const handleClearAllHistory = useCallback(() => {
    setSessions([]);
    setActiveSessionId(null);
    try {
      localStorage.removeItem(STORAGE_KEY_SESSIONS);
    } catch {}
  }, []);

  const handleModelSelect = useCallback((model: PreferredModel) => {
    setSettings((prev) => ({ ...prev, preferredModel: model }));
  }, []);

  // Contextual smart suggestions
  const generateFollowUps = (prompt: string, answer: string, mode: AIMode): string[] => {
    if (mode === 'coding') {
      return [
        'How can we optimize this for performance?',
        'Show me unit tests for this code',
        'How to handle error edge cases here?',
      ];
    }
    if (mode === 'reasoning') {
      return [
        'Can you provide a counterexample or stress test?',
        'Walk through the formal proof step by step',
        'What are the core axioms behind this?',
      ];
    }
    if (mode === 'study') {
      return [
        'Give me a quick 3-question practice quiz',
        'Explain this using an everyday analogy',
        'What is a common misconception about this?',
      ];
    }
    if (mode === 'writing') {
      return [
        'Make this more concise and punchy',
        'Adapt this into an executive summary',
        'Rewrite this in a more conversational tone',
      ];
    }
    return [
      'Can you tell me more about this?',
      'What are the main real-world applications?',
      'Summarize the top 3 key takeaways',
    ];
  };

  // High-performance streaming with RAF batching
  const handleSendMessage = async (content: string, attachments: Attachment[]) => {
    if (!content.trim() && attachments.length === 0) return;
    if (isStreaming) return;

    setChatError(null);

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      role: 'user',
      content,
      timestamp: Date.now(),
      attachments,
      mode: currentMode,
    };

    let targetSessionId = activeSessionId;
    let currentMessages: ChatMessage[] = [];

    // Optimistic UI update: Display user message instantly
    if (!targetSessionId || !activeSession) {
      const title =
        content.slice(0, 36) || (attachments[0] ? `Image: ${attachments[0].name}` : 'New Conversation');
      const newSession: ChatSession = {
        id: `sess-${Date.now()}`,
        title,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [userMessage],
        mode: currentMode,
        webSearch,
        preferredModel: settings.preferredModel,
      };
      targetSessionId = newSession.id;
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      currentMessages = [userMessage];
    } else {
      currentMessages = [...activeSession.messages, userMessage];
      setSessions((prev) =>
        prev.map((s) =>
          s.id === targetSessionId
            ? { ...s, messages: currentMessages, updatedAt: Date.now() }
            : s
        )
      );
    }

    // Assistant placeholder
    const assistantMessageId = `msg-${Date.now() + 1}`;
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      mode: currentMode,
      isStreaming: true,
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === targetSessionId
          ? { ...s, messages: [...currentMessages, assistantMessage] }
          : s
      )
    );

    setIsStreaming(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    let accumulatedText = '';
    let sources: GroundingSource[] = [];
    let metrics: PerformanceMetrics | undefined;

    // RAF buffer to update React smoothly without thread blocking
    let pendingChunk = '';
    let rafId: number | null = null;

    const flushChunkToState = () => {
      if (pendingChunk) {
        accumulatedText += pendingChunk;
        pendingChunk = '';
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id !== targetSessionId) return s;
            return {
              ...s,
              messages: s.messages.map((m) =>
                m.id === assistantMessageId
                  ? { ...m, content: accumulatedText, isStreaming: true }
                  : m
              ),
            };
          })
        );
      }
      rafId = null;
    };

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: currentMessages,
          mode: currentMode,
          webSearch,
          systemInstruction: settings.systemInstruction,
          preferredModel: settings.preferredModel,
        }),
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.error || `HTTP error ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No readable stream available in response.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(trimmed.slice(6));
              if (parsed.text) {
                pendingChunk += parsed.text;
                if (!rafId) {
                  rafId = requestAnimationFrame(flushChunkToState);
                }
              }
              if (parsed.sources) {
                sources = parsed.sources;
              }
              if (parsed.metrics) {
                metrics = parsed.metrics;
              }
              if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (err: any) {
              if (err.message && !err.message.includes('JSON')) {
                throw err;
              }
            }
          }
        }
      }

      // Flush remaining text
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      if (pendingChunk) {
        accumulatedText += pendingChunk;
        pendingChunk = '';
      }

      // Finalize assistant message with metrics
      const suggestions = generateFollowUps(content, accumulatedText, currentMode);
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== targetSessionId) return s;
          return {
            ...s,
            messages: s.messages.map((m) =>
              m.id === assistantMessageId
                ? {
                    ...m,
                    content: accumulatedText,
                    isStreaming: false,
                    sources: sources.length > 0 ? sources : undefined,
                    suggestedQuestions: suggestions,
                    metrics,
                  }
                : m
            ),
          };
        })
      );

      sound.playComplete();

      // Auto read if enabled
      if (settings.autoReadResponses && accumulatedText) {
        const clean = accumulatedText.slice(0, 400).replace(/[*#`_\[\]()]/g, ' ');
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const ut = new SpeechSynthesisUtterance(clean);
          window.speechSynthesis.speak(ut);
        }
      }
    } catch (err: any) {
      if (rafId) cancelAnimationFrame(rafId);
      if (err.name === 'AbortError') {
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id !== targetSessionId) return s;
            return {
              ...s,
              messages: s.messages.map((m) =>
                m.id === assistantMessageId
                  ? { ...m, isStreaming: false, content: accumulatedText || 'Generation paused.' }
                  : m
              ),
            };
          })
        );
      } else {
        console.error('Chat stream error:', err);
        const errMsg = err?.message || 'Failed to complete AI response.';
        setChatError(errMsg);
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id !== targetSessionId) return s;
            return {
              ...s,
              messages: s.messages.map((m) =>
                m.id === assistantMessageId
                  ? {
                      ...m,
                      isStreaming: false,
                      error: errMsg,
                    }
                  : m
              ),
            };
          })
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancelStream = useCallback(() => {
    sound.playClick();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const handleRegenerate = useCallback(() => {
    if (!activeSession || activeSession.messages.length < 2) return;
    const msgs = [...activeSession.messages];
    let lastUserIndex = -1;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'user') {
        lastUserIndex = i;
        break;
      }
    }
    if (lastUserIndex === -1) return;

    const userMsg = msgs[lastUserIndex];
    const trimmed = msgs.slice(0, lastUserIndex);
    setSessions((prev) =>
      prev.map((s) => (s.id === activeSession.id ? { ...s, messages: trimmed } : s))
    );

    handleSendMessage(userMsg.content, userMsg.attachments || []);
  }, [activeSession]);

  const handleInsertImageToChat = useCallback((imageUrl: string, prompt: string) => {
    const att: Attachment = {
      id: `gen-img-${Date.now()}`,
      name: 'Generated Image.png',
      mimeType: 'image/png',
      size: 1024,
      data: imageUrl,
      isImage: true,
    };
    handleSendMessage(`Analyze or enhance this image I generated with prompt: "${prompt}"`, [att]);
  }, []);

  const toggleTheme = useCallback(() => {
    sound.playClick();
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#030712] text-slate-100 font-sans selection:bg-cyan-500/25">
      {/* Opening Intro Animation */}
      {showOpening && settings.showOpeningAnimation && (
        <OpeningAnimation
          enabled={true}
          onComplete={() => {
            sessionStorage.setItem(STORAGE_KEY_ANIM_PLAYED, 'true');
            setShowOpening(false);
          }}
        />
      )}

      {/* Desktop Collapsible Floating Sidebar */}
      <div className="hidden md:block shrink-0 h-full">
        <Sidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          onDeleteSession={handleDeleteSession}
          onRenameSession={handleRenameSession}
          onOpenSettings={() => setShowSettingsModal(true)}
          onOpenSoundSettings={() => setShowSoundModal(true)}
          onOpenAbout={() => setShowAboutModal(true)}
          onOpenImageGen={() => setShowImageGenModal(true)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onSelectModeShortcut={(mode) => {
            setCurrentMode(mode);
            handleNewChat(mode);
          }}
        />
      </div>

      {/* Mobile Top Navigation & Drawer */}
      <MobileNavigation
        onOpenDrawer={() => setIsMobileDrawerOpen(true)}
        onNewChat={() => handleNewChat()}
        onOpenImageGen={() => setShowImageGenModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
      />

      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenSoundSettings={() => setShowSoundModal(true)}
        onOpenAbout={() => setShowAboutModal(true)}
        onOpenImageGen={() => setShowImageGenModal(true)}
        onSelectModeShortcut={(mode) => {
          setCurrentMode(mode);
          handleNewChat(mode);
        }}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col h-full min-w-0 relative overflow-hidden pt-14 md:pt-0">
        {/* Top Floating Glass Header Bar */}
        <header className="h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between border-b border-white/10 liquid-glass-subtle shrink-0 z-10">
          {/* Mode Selector and Search Grounding */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ModelSelector
              currentMode={currentMode}
              onSelectMode={setCurrentMode}
              preferredModel={settings.preferredModel}
              onSelectModel={handleModelSelect}
            />
            <ToolSelector
              webSearch={webSearch}
              onToggleWebSearch={() => setWebSearch(!webSearch)}
              onOpenImageGen={() => setShowImageGenModal(true)}
            />
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Sound Toggle */}
            <button
              onClick={() => {
                sound.playClick();
                setShowSoundModal(true);
              }}
              className="p-2 rounded-full liquid-glass-pill text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer"
              title="Acoustic Sound Settings"
              aria-label="Sound settings"
            >
              <Volume2 className="w-4 h-4 text-cyan-400" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full liquid-glass-pill text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer"
              title={`Switch to ${settings.theme === 'dark' ? 'Light' : 'Midnight'} mode`}
              aria-label="Toggle theme"
            >
              {settings.theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-cyan-400" />
              )}
            </button>

            {/* Preferences Modal Trigger */}
            <button
              onClick={() => {
                sound.playClick();
                setShowSettingsModal(true);
              }}
              className="p-2 rounded-full liquid-glass-pill text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer"
              title="Preferences"
              aria-label="Preferences"
            >
              <Settings className="w-4 h-4 text-slate-300" />
            </button>

            {/* About SOURCE AI Trigger */}
            <button
              onClick={() => {
                sound.playClick();
                setShowAboutModal(true);
              }}
              className="p-2 rounded-full liquid-glass-pill text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer"
              title="About SOURCE AI"
              aria-label="About SOURCE AI"
            >
              <Info className="w-4 h-4 text-blue-400" />
            </button>
          </div>
        </header>

        {/* Viewport Content: HomeScreen or ChatWindow */}
        <div className="flex-1 flex flex-col h-[calc(100%-3.5rem)] sm:h-[calc(100%-4rem)] relative overflow-hidden">
          {!activeSession || activeSession.messages.length === 0 ? (
            <HomeScreen
              onSendMessage={handleSendMessage}
              onSelectMode={setCurrentMode}
              onOpenImageGen={() => setShowImageGenModal(true)}
              currentMode={currentMode}
              webSearch={webSearch}
            />
          ) : (
            <ChatWindow
              messages={activeSession.messages}
              isStreaming={isStreaming}
              onSendMessage={handleSendMessage}
              onRegenerate={handleRegenerate}
              onCancelStream={handleCancelStream}
              currentMode={currentMode}
              webSearch={webSearch}
              ttsVoice={settings.ttsVoice}
              error={chatError}
              onRetry={handleRegenerate}
              showPerformanceStats={settings.showPerformanceStats}
            />
          )}
        </div>
      </main>

      {/* Lazy-loaded Secondary Modals */}
      <Suspense fallback={null}>
        {showSoundModal && (
          <SoundSettingsDialog
            isOpen={showSoundModal}
            onClose={() => setShowSoundModal(false)}
          />
        )}
        {showSettingsModal && (
          <UserSettingsDialog
            isOpen={showSettingsModal}
            onClose={() => setShowSettingsModal(false)}
            settings={settings}
            onUpdateSettings={(partial) => setSettings((prev) => ({ ...prev, ...partial }))}
            onClearAllHistory={handleClearAllHistory}
          />
        )}
        {showAboutModal && (
          <AboutDialog
            isOpen={showAboutModal}
            onClose={() => setShowAboutModal(false)}
          />
        )}
        {showImageGenModal && (
          <ImageGenModal
            isOpen={showImageGenModal}
            onClose={() => setShowImageGenModal(false)}
            onInsertToChat={handleInsertImageToChat}
          />
        )}
      </Suspense>
    </div>
  );
};
