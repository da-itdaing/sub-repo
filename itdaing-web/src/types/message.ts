// 메시지 시스템 TypeScript 타입 정의

export interface AttachmentDto {
  url: string;
  mimeType?: string;
  fileKey?: string;
  originalName?: string;
  sizeBytes?: number;
}

export interface CreateInquiryRequest {
  receiverId: number;
  subject: string;
  content: string;
  attachments?: AttachmentDto[];
}

export interface CreateInquiryResponse {
  threadId: number;
  messageId: number;
}

export interface ReplyRequest {
  content: string;
  title?: string;
  attachments?: AttachmentDto[];
}

export interface ThreadParticipantSummary {
  id: number;
  name: string;
  role: string;
}

export interface ThreadSummary {
  threadId: number;
  subject: string;
  lastSnippet: string;
  updatedAt: string;
  unreadForMe: number;
  counterpart: ThreadParticipantSummary;
}

export interface ThreadListResponse {
  items: ThreadSummary[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface MessageItem {
  id: number;
  senderId: number;
  receiverId: number;
  title?: string;
  content: string;
  sentAt: string;
  readAt?: string;
  attachments?: AttachmentDto[];
}

export interface ThreadDetailResponse {
  threadId: number;
  subject: string;
  messages: MessageItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface IdResponse {
  id: number;
}

