import React, { useRef } from 'react';
import { Paperclip, Image as ImageIcon, FileText, Code2, X } from 'lucide-react';
import { Attachment } from '../types';
import { sound } from '../utils/sound';

interface AttachmentMenuProps {
  attachments: Attachment[];
  onAddAttachment: (attachment: Attachment) => void;
  onRemoveAttachment: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const AttachmentMenu: React.FC<AttachmentMenuProps> = ({
  attachments,
  onAddAttachment,
  onRemoveAttachment,
  isOpen,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isImageOnly: boolean) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    sound.playClick();
    Array.from(files).forEach((file) => {
      // Limit file size to 10MB
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} exceeds 10MB limit.`);
        return;
      }

      const reader = new FileReader();
      const isImg = file.type.startsWith('image/');

      reader.onload = () => {
        const dataUrl = reader.result as string;
        onAddAttachment({
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          mimeType: file.type || 'text/plain',
          size: file.size,
          data: dataUrl,
          isImage: isImg,
        });
      };

      if (isImg) {
        reader.readAsDataURL(file);
      } else {
        // Read text/code/document as text or base64 data url
        reader.readAsDataURL(file);
      }
    });

    e.target.value = '';
    onClose();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".txt,.md,.json,.js,.ts,.tsx,.jsx,.html,.css,.py,.csv"
        className="hidden"
        onChange={(e) => handleFileChange(e, false)}
      />
      <input
        ref={imageInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => handleFileChange(e, true)}
      />

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-3 w-56 liquid-glass rounded-2xl p-2 shadow-2xl border border-white/15 z-50 backdrop-blur-2xl animate-fade-in">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-1.5 border-b border-white/10">
            Attach Context
          </div>
          <div className="space-y-1 mt-1">
            <button
              onClick={() => {
                imageInputRef.current?.click();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-white/10 transition-all text-left cursor-pointer"
            >
              <div className="p-1 rounded-lg bg-cyan-500/15 text-cyan-400">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-slate-100">Upload Image</p>
                <p className="text-[10px] text-slate-400">Visual QA & reasoning</p>
              </div>
            </button>

            <button
              onClick={() => {
                fileInputRef.current?.click();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-white/10 transition-all text-left cursor-pointer"
            >
              <div className="p-1 rounded-lg bg-blue-500/15 text-blue-400">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-slate-100">Document / Text</p>
                <p className="text-[10px] text-slate-400">MD, TXT, CSV, JSON</p>
              </div>
            </button>

            <button
              onClick={() => {
                fileInputRef.current?.click();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-white/10 transition-all text-left cursor-pointer"
            >
              <div className="p-1 rounded-lg bg-emerald-500/15 text-emerald-400">
                <Code2 className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-slate-100">Code File</p>
                <p className="text-[10px] text-slate-400">TS, JS, Python, HTML</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
