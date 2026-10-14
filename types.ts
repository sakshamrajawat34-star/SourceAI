export type AIMode = 'general' | 'reasoning' | 'coding' | 'writing' | 'study' | 'creative';

export type PreferredModel = 'auto' | 'gemini-3.1-flash-lite' | 'gemini-3.8-flash';

export interface PerformanceMetrics {
  ttftMs: number;
  totalMs: number;
  modelUsed: string;
  charCount?: number;
  chunks?: number;
}

export interface Attachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  data: string; // base64 data url
  isImage?: boolean;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  attachments?: Attachment[];
  mode?: AIMode;
  sources?: GroundingSource[];
  feedback?: 'like' | 'dislike' | null;
  isStreaming?: boolean;
  error?: string;
  suggestedQuestions?: string[];
  metrics?: PerformanceMetrics;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  mode: AIMode;
  webSearch: boolean;
  preferredModel?: PreferredModel;
}

export interface SoundSettings {
  soundEnabled: boolean;
  masterVolume: number;
  interfaceSounds: boolean;
  responseSounds: boolean;
}

export interface UserSettings {
  theme: 'dark' | 'light' | 'system';
  showOpeningAnimation: boolean;
  ttsVoice: 'Kore' | 'Puck' | 'Zephyr' | 'Aoede' | 'Fenrir';
  autoReadResponses: boolean;
  systemInstruction: string;
  streamSpeed: 'fast' | 'normal';
  preferredModel: PreferredModel;
  showPerformanceStats: boolean;
}
