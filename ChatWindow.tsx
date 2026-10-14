import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import { ArrowDown, AlertTriangle, RefreshCw } from 'lucide-react';
import { ChatMessage as ChatMessageType, AIMode, Attachment } from '../types';
import { ChatMessage } from './ChatMessage';
import { MessageComposer } from './MessageComposer';
import { sound } from '../utils/sound';

interface ChatWindowProps {
  messages: ChatMessageType[];
  isStreaming: boolean;
  onSendMessage: (content: string, attachments: Attachment[]) => void;
  onRegenerate: () => void;
  onCancelStream: () => void;
  currentMode: AIMode;
  webSearch: boolean;
  ttsVoice?: string;
  error?: string | null;
  onRetry?: () => void;
  showPerformanceStats?: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = memo(({
  messages,
  isStreaming,
  onSendMessage,
  onRegenerate,
  onCancelStream,
  currentMode,
  webSearch,
  ttsVoice,
  error,
  onRetry,
  showPerformanceStats = true,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const userScrolledUpRef = useRef(false);

  // Smart auto-scroll: only scrolls if the user hasn't explicitly scrolled up to inspect previous turns
  useEffect(() => {
    if (!userScrolledUpRef.current && bottomRef.current) {
      // Use requestAnimationFrame for smooth non-blocking frame sync
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }, [messages, isStreaming]);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    const isUp = distanceToBottom > 140;
    userScrolledUpRef.current = isUp;
    setShowScrollBottom(isUp);
  }, []);

  const scrollToBottom = () => {
    sound.playClick();
    userScrolledUpRef.current = false;
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollBottom(false);
  };

  // For long conversations (e.g., > 40 messages), slice efficiently
  const visibleMessages = messages.length > 50 ? messages.slice(-50) : messages;

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden">
      {/* Scrollable messages area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 sm:px-6 pt-4 pb-36 space-y-1.5 scroll-smooth will-change-scroll"
      >
        <div className="max-w-4xl mx-auto w-full">
          {messages.length > 50 && (
            <div className="text-center py-2 text-[11px] text-slate-500 font-mono">
              Displaying recent 50 messages of conversation history
            </div>
          )}

          {visibleMessages.map((msg, index) => {
            const isLastAssistant =
              msg.role === 'assistant' &&
              index === visibleMessages.map((m) => m.role).lastIndexOf('assistant');

            return (
              <ChatMessage
                key={msg.id}
                message={msg}
                onRegenerate={onRegenerate}
                onSelectSuggestion={(prompt) => onSendMessage(prompt, [])}
                ttsVoice={ttsVoice}
                isLastAssistant={isLastAssistant}
                showPerformanceStats={showPerformanceStats}
              />
            );
          })}

          {/* Top-level global error banner if API failed */}
          {error && (
            <div className="my-3 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between gap-3 animate-fade-in shadow-lg">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
                <span className="text-xs sm:text-sm">{error}</span>
              </div>
              {onRetry && (
                <button
                  onClick={() => {
                    sound.playClick();
                    onRetry();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
              )}
            </div>
          )}

          <div ref={bottomRef} className="h-4" />
        </div>
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-28 right-5 z-20 flex items-center gap-1.5 px-3 py-2 rounded-full liquid-glass text-cyan-300 hover:text-white border border-cyan-400/40 shadow-xl transition-all active:scale-90 cursor-pointer text-xs font-medium animate-fade-in"
          title="Scroll to latest message"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
          <span className="text-[11px] hidden sm:inline">Latest</span>
        </button>
      )}

      {/* Fixed Bottom Composer Container */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pb-safe pt-2 bg-gradient-to-t from-[#030712] via-[#030712]/90 to-transparent">
        <MessageComposer
          onSendMessage={onSendMessage}
          isStreaming={isStreaming}
          onCancelStream={onCancelStream}
          currentMode={currentMode}
          webSearch={webSearch}
        />
        <div className="text-center py-1.5 text-[10px] text-slate-500">
          SOURCE AI by Source Lab • Developed by Saksham Rajawat • Intelligence, Without Limits.
        </div>
      </div>
    </div>
  );
});

ChatWindow.displayName = 'ChatWindow';
