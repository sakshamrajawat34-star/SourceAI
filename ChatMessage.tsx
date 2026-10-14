import React, { useState, memo } from 'react';
import { Sparkles, Copy, Check, RotateCw, ThumbsUp, ThumbsDown, Share2, Globe, ExternalLink, AlertCircle, Zap } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../types';
import { FormattedContent } from './FormattedContent';
import { VoiceOutput } from './VoiceOutput';
import { sound } from '../utils/sound';

interface ChatMessageProps {
  message: ChatMessageType;
  onRegenerate?: () => void;
  onSelectSuggestion?: (prompt: string) => void;
  ttsVoice?: string;
  isLastAssistant?: boolean;
  showPerformanceStats?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = memo(({
  message,
  onRegenerate,
  onSelectSuggestion,
  ttsVoice = 'Kore',
  isLastAssistant = false,
  showPerformanceStats = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(message.feedback || null);
  const [shared, setShared] = useState(false);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    sound.playClick();
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    sound.playClick();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SOURCE AI Response',
          text: message.content,
        });
        return;
      } catch {}
    }
    navigator.clipboard.writeText(message.content);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const handleFeedback = (type: 'like' | 'dislike') => {
    sound.playClick();
    setFeedback(feedback === type ? null : type);
  };

  return (
    <div className={`w-full py-3 sm:py-4 flex flex-col msg-contain ${isUser ? 'items-end' : 'items-start'}`}>
      <div className={`flex gap-3 max-w-full sm:max-w-4xl w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
        {/* Assistant Avatar */}
        {!isUser && (
          <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1px] shadow-sm shadow-cyan-500/20 hidden sm:flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-300" />
            </div>
          </div>
        )}

        {/* Message bubble / container */}
        <div className={`flex flex-col max-w-full sm:max-w-3xl ${isUser ? 'items-end' : 'items-start flex-1'}`}>
          {/* User Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {message.attachments.map((att) => (
                <div
                  key={att.id}
                  className="rounded-2xl overflow-hidden border border-white/15 bg-black/40 shadow-md max-w-xs"
                >
                  {att.isImage ? (
                    <img src={att.data} alt={att.name} loading="lazy" className="max-h-44 object-cover rounded-2xl" />
                  ) : (
                    <div className="p-2.5 text-xs font-mono text-slate-300 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                      <span className="truncate">{att.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Text Bubble */}
          <div
            className={`rounded-3xl px-4 sm:px-5 py-3 sm:py-3.5 shadow-md ${
              isUser
                ? 'liquid-glass-pill bg-gradient-to-r from-cyan-600/25 via-blue-600/25 to-indigo-600/25 border-cyan-400/30 text-white rounded-br-md'
                : 'liquid-glass w-full rounded-tl-md text-slate-100'
            }`}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{message.content}</p>
            ) : (
              <div className="relative">
                {/* Streaming or response content */}
                {message.content ? (
                  <FormattedContent content={message.content} />
                ) : message.isStreaming ? (
                  <div className="flex items-center gap-2 text-cyan-300 py-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                    <span className="text-xs font-medium animate-pulse">SOURCE AI is generating...</span>
                  </div>
                ) : null}

                {/* Error handling if failed */}
                {message.error && (
                  <div className="mt-3 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{message.error}</span>
                  </div>
                )}

                {/* Search Grounding Sources */}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-white/10 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-300">
                      <Globe className="w-3.5 h-3.5" />
                      <span>Verified Sources</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {message.sources.map((src, sIdx) => (
                        <a
                          key={sIdx}
                          href={src.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/15 text-[11px] text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer"
                        >
                          <span className="max-w-[180px] truncate">{src.title}</span>
                          <ExternalLink className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Bar & Performance Metrics for AI Responses */}
          {!isUser && message.content && !message.isStreaming && (
            <div className="flex items-center justify-between flex-wrap gap-2 w-full mt-1.5 text-xs text-slate-400 pl-1">
              <div className="flex items-center gap-1">
                {/* Copy */}
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-all flex items-center gap-1 cursor-pointer"
                  title="Copy response"
                  aria-label="Copy response"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="text-[11px] font-medium hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                </button>

                {/* Read Aloud TTS */}
                <VoiceOutput text={message.content} voiceName={ttsVoice} />

                {/* Regenerate if last */}
                {isLastAssistant && onRegenerate && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onRegenerate();
                    }}
                    className="p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-all flex items-center gap-1 cursor-pointer"
                    title="Regenerate response"
                    aria-label="Regenerate response"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-medium hidden sm:inline">Regenerate</span>
                  </button>
                )}

                {/* Share */}
                <button
                  onClick={handleShare}
                  className="p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-all flex items-center gap-1 cursor-pointer"
                  title="Share response"
                  aria-label="Share response"
                >
                  {shared ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span className="text-[11px] font-medium hidden sm:inline">{shared ? 'Link Copied' : 'Share'}</span>
                </button>

                {/* Feedback Like / Dislike */}
                <div className="flex items-center gap-0.5 ml-1">
                  <button
                    onClick={() => handleFeedback('like')}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      feedback === 'like' ? 'text-cyan-400 bg-cyan-500/15' : 'hover:text-white hover:bg-white/10'
                    }`}
                    title="Helpful"
                    aria-label="Helpful"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleFeedback('dislike')}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      feedback === 'dislike' ? 'text-rose-400 bg-rose-500/15' : 'hover:text-white hover:bg-white/10'
                    }`}
                    title="Unhelpful"
                    aria-label="Unhelpful"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Real-time Measured Performance Stats Badge */}
              {showPerformanceStats && message.metrics && (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-cyan-300 font-mono">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>{message.metrics.ttftMs}ms TTFT</span>
                  <span className="text-slate-500">•</span>
                  <span>{(message.metrics.totalMs / 1000).toFixed(2)}s</span>
                  <span className="text-slate-500 hidden sm:inline">•</span>
                  <span className="text-slate-400 hidden sm:inline truncate max-w-[120px]">
                    {message.metrics.modelUsed.replace('gemini-', '')}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Smart Follow-Up Suggestions */}
          {!isUser && message.suggestedQuestions && message.suggestedQuestions.length > 0 && !message.isStreaming && (
            <div className="mt-2.5 flex flex-wrap gap-2">
              {message.suggestedQuestions.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    sound.playClick();
                    onSelectSuggestion?.(sug);
                  }}
                  className="px-3 py-1 rounded-full liquid-glass-pill hover:border-cyan-400/50 hover:text-cyan-300 text-xs text-slate-300 transition-all active:scale-95 text-left cursor-pointer shadow-sm"
                >
                  <span className="text-cyan-400 mr-1.5">✦</span>
                  {sug}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';
