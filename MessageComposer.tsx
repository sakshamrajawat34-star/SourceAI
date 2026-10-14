import React, { useState, useRef, useEffect, memo } from 'react';
import { ArrowUp, Paperclip, Square, X, Image as ImageIcon } from 'lucide-react';
import { Attachment, AIMode } from '../types';
import { AttachmentMenu } from './AttachmentMenu';
import { VoiceInput } from './VoiceInput';
import { sound } from '../utils/sound';

interface MessageComposerProps {
  onSendMessage: (content: string, attachments: Attachment[]) => void;
  isStreaming: boolean;
  onCancelStream?: () => void;
  currentMode: AIMode;
  webSearch: boolean;
  placeholder?: string;
}

export const MessageComposer: React.FC<MessageComposerProps> = memo(({
  onSendMessage,
  isStreaming,
  onCancelStream,
  currentMode,
  webSearch,
  placeholder = 'Ask SOURCE AI anything... (or attach images & code)',
}) => {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isSubmittingRef = useRef(false);

  // Auto-resize textarea smoothly without layout thrashing
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollH = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollH, 160)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (isSubmittingRef.current) return;
    const trimmed = input.trim();
    if (!trimmed && attachments.length === 0) return;

    // Lock submission briefly to prevent double taps
    isSubmittingRef.current = true;
    sound.playSend();

    onSendMessage(trimmed, attachments);

    setInput('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setTimeout(() => {
      isSubmittingRef.current = false;
    }, 150);
  };

  const handleVoiceTranscript = (transcript: string) => {
    setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const removeAttachment = (id: string) => {
    sound.playClick();
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto px-3 sm:px-4">
      {/* Attachment previews above input */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 p-2 liquid-glass-subtle rounded-2xl border border-white/10 animate-fade-in">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl bg-white/10 text-xs text-slate-200 border border-white/10 shadow-sm"
            >
              {att.isImage ? (
                <img src={att.data} alt={att.name} className="w-5 h-5 rounded-md object-cover" />
              ) : (
                <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
              )}
              <span className="max-w-[130px] truncate">{att.name}</span>
              <button
                type="button"
                onClick={() => removeAttachment(att.id)}
                className="p-1 rounded-full hover:bg-white/20 text-slate-400 hover:text-white transition-colors cursor-pointer"
                aria-label={`Remove ${att.name}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Liquid Glass Composer Pill */}
      <div className="relative liquid-glass rounded-3xl p-2 sm:p-2.5 border border-white/15 shadow-xl transition-all duration-200 focus-within:border-cyan-400/40">
        {/* Attachment menu popup */}
        <AttachmentMenu
          isOpen={showAttachMenu}
          onClose={() => setShowAttachMenu(false)}
          attachments={attachments}
          onAddAttachment={(newAtt) => setAttachments((prev) => [...prev, newAtt])}
          onRemoveAttachment={removeAttachment}
        />

        {/* Input Textarea - Stays responsive always */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          className="w-full bg-transparent px-3 py-1.5 text-slate-100 placeholder-slate-400 focus:outline-none resize-none text-[15px] leading-relaxed max-h-40 scrollbar-none"
        />

        {/* Action Controls Row */}
        <div className="flex items-center justify-between pt-1 px-1">
          {/* Left tools group */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setShowAttachMenu(!showAttachMenu);
              }}
              className={`p-2 rounded-full transition-all active:scale-95 cursor-pointer ${
                showAttachMenu
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              title="Add attachment"
              aria-label="Add attachment"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Direct Image Upload Shortcut */}
            <label
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
              title="Upload Image"
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    sound.playClick();
                    setAttachments((prev) => [
                      ...prev,
                      {
                        id: `img-${Date.now()}`,
                        name: file.name,
                        mimeType: file.type,
                        size: file.size,
                        data: reader.result as string,
                        isImage: true,
                      },
                    ]);
                  };
                  reader.readAsDataURL(file);
                  e.target.value = '';
                }}
              />
              <ImageIcon className="w-4 h-4" />
            </label>

            {/* Voice Input */}
            <VoiceInput onTranscript={handleVoiceTranscript} />

            {/* Live Web Indicator */}
            {webSearch && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                Web Grounded
              </span>
            )}
          </div>

          {/* Right send or cancel button */}
          <div className="flex items-center gap-2">
            {isStreaming && onCancelStream ? (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onCancelStream();
                }}
                className="p-2 sm:p-2.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-all active:scale-95 cursor-pointer flex items-center justify-center shadow-md"
                title="Stop generation"
                aria-label="Stop generation"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!input.trim() && attachments.length === 0}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold flex items-center justify-center shadow-md shadow-cyan-500/25 hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:hover:brightness-100 cursor-pointer"
                title="Send message"
                aria-label="Send message"
              >
                <ArrowUp className="w-5 h-5 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

MessageComposer.displayName = 'MessageComposer';
