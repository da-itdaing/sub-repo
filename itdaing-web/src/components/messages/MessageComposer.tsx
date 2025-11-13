import React, { useState } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { ReplyRequest, AttachmentDto } from '../../types/message';

interface MessageComposerProps {
  onSubmit: (request: ReplyRequest) => Promise<void>;
  placeholder?: string;
  allowAttachments?: boolean;
  onAttachmentUpload?: (file: File) => Promise<AttachmentDto>;
}

export function MessageComposer({
  onSubmit,
  placeholder = '메시지를 입력하세요...',
  allowAttachments = false,
  onAttachmentUpload,
}: MessageComposerProps) {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [attachments, setAttachments] = useState<AttachmentDto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || sending) return;

    try {
      setSending(true);
      const request: ReplyRequest = {
        content: content.trim(),
        ...(title.trim() && { title: title.trim() }),
        ...(attachments.length > 0 && { attachments }),
      };
      await onSubmit(request);
      setContent('');
      setTitle('');
      setAttachments([]);
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      alert('메시지 전송에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !onAttachmentUpload) return;

    try {
      setUploading(true);
      for (const file of Array.from(files)) {
        const attachment = await onAttachmentUpload(file);
        setAttachments((prev) => [...prev, attachment]);
      }
    } catch (error) {
      console.error('파일 업로드 실패:', error);
      alert('파일 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
      <div className="space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목 (선택사항)"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
          required
        />
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-2 py-1 bg-gray-100 rounded text-xs"
              >
                <span className="text-gray-700">{attachment.originalName || '첨부파일'}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between">
          {allowAttachments && onAttachmentUpload && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
            >
              <Paperclip className="size-5" />
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="submit"
            disabled={!content.trim() || sending || uploading}
            className="ml-auto inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Send className="size-4" />
            {sending ? '전송 중...' : '전송'}
          </button>
        </div>
      </div>
    </form>
  );
}

