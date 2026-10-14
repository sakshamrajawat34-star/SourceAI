import React, { useState, memo } from 'react';
import { Copy, Check, Terminal, ExternalLink } from 'lucide-react';
import { sound } from '../utils/sound';

interface FormattedContentProps {
  content: string;
}

export const FormattedContent: React.FC<FormattedContentProps> = memo(({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = (code: string, idx: number) => {
    sound.playClick();
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!content) return null;

  // Split by code blocks ```lang ... ```
  const codeBlockRegex = /```([a-zA-Z0-9_\-\+]*)\n([\s\S]*?)```/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let codeBlockCounter = 0;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const textBefore = content.substring(lastIndex, match.index);
    if (textBefore) {
      parts.push(renderFormattedText(textBefore, `text-${lastIndex}`));
    }

    const language = match[1] || 'code';
    const codeContent = match[2];
    const currentIndex = codeBlockCounter++;

    parts.push(
      <div
        key={`code-${match.index}`}
        className="my-3.5 rounded-2xl overflow-hidden border border-white/10 bg-[#090d16]/95 shadow-xl backdrop-blur-md"
      >
        <div className="flex items-center justify-between px-3.5 py-2 bg-white/5 border-b border-white/10 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold uppercase tracking-wider text-cyan-300/90 text-[11px]">{language}</span>
          </div>
          <button
            onClick={() => handleCopyCode(codeContent, currentIndex)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all active:scale-95 text-xs cursor-pointer"
            title="Copy code"
            aria-label="Copy code block"
          >
            {copiedIndex === currentIndex ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        <div className="p-3.5 overflow-x-auto text-[13px] font-mono leading-relaxed text-slate-200 selection:bg-cyan-500/30">
          <pre>
            <code>{codeContent}</code>
          </pre>
        </div>
      </div>
    );

    lastIndex = match.index + match[0].length;
  }

  const textAfter = content.substring(lastIndex);
  if (textAfter) {
    parts.push(renderFormattedText(textAfter, `text-end-${lastIndex}`));
  }

  return <div className="space-y-2 leading-relaxed text-[15px]">{parts}</div>;
});

FormattedContent.displayName = 'FormattedContent';

// Fast paragraph parser
function renderFormattedText(text: string, keyPrefix: string): React.ReactNode {
  const paragraphs = text.split('\n\n');

  return (
    <div key={keyPrefix} className="space-y-2.5">
      {paragraphs.map((para, pIdx) => {
        const trimmed = para.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={`${keyPrefix}-h3-${pIdx}`} className="text-sm font-semibold text-cyan-300 mt-3 mb-1 tracking-wide">
              {parseInline(trimmed.replace(/^###\s+/, ''))}
            </h4>
          );
        }

        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={`${keyPrefix}-h2-${pIdx}`} className="text-base font-bold text-white mt-4 mb-2 tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-3.5 rounded-full bg-cyan-400"></span>
              {parseInline(trimmed.replace(/^##\s+/, ''))}
            </h3>
          );
        }

        if (trimmed.startsWith('# ')) {
          return (
            <h2 key={`${keyPrefix}-h1-${pIdx}`} className="text-lg font-bold text-white mt-4 mb-2 tracking-tight">
              {parseInline(trimmed.replace(/^#\s+/, ''))}
            </h2>
          );
        }

        const lines = para.split('\n');
        const isList = lines.every((line) => line.trim().startsWith('- ') || line.trim().startsWith('* ') || /^\d+\.\s/.test(line.trim()));

        if (isList) {
          return (
            <ul key={`${keyPrefix}-ul-${pIdx}`} className="space-y-1 pl-5 list-disc marker:text-cyan-400 text-slate-200">
              {lines.map((line, lIdx) => {
                const cleanLine = line.trim().replace(/^[-*]\s+|\d+\.\s+/, '');
                return <li key={lIdx}>{parseInline(cleanLine)}</li>;
              })}
            </ul>
          );
        }

        return (
          <p key={`${keyPrefix}-p-${pIdx}`} className="text-slate-200 leading-relaxed">
            {lines.map((line, lineIdx) => (
              <React.Fragment key={lineIdx}>
                {lineIdx > 0 && <br />}
                {parseInline(line)}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

function parseInline(text: string): React.ReactNode[] {
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);

  return tokens.map((token, idx) => {
    if (token.startsWith('`') && token.endsWith('`')) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-white/10 text-cyan-300 font-mono text-[12px] border border-white/10"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith('**') && token.endsWith('**')) {
      return (
        <strong key={idx} className="font-semibold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    }
    const linkMatch = token.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      return (
        <a
          key={idx}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-cyan-400 hover:text-cyan-300 underline underline-offset-4 font-medium"
        >
          {linkMatch[1]}
          <ExternalLink className="w-3 h-3 inline" />
        </a>
      );
    }
    return token;
  });
}
