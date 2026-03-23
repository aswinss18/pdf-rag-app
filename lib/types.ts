export type AssistantMode = "rag" | "agent";

export interface AuthUser {
  id: number;
  username: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  username: string;
}

export interface Citation {
  id: string;
  documentName: string;
  page?: number | null;
  chunk?: number | null;
  excerpt?: string;
  score?: number | null;
}

export interface ToolCall {
  id: string;
  name: string;
  status?: string;
  input?: string;
  output?: string;
}

export interface ReasoningStep {
  id: string;
  label: string;
  detail?: string;
  status?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
  status?: "idle" | "streaming" | "error";
  citations?: Citation[];
  toolCalls?: ToolCall[];
  reasoning?: ReasoningStep[];
}

export interface DocumentRecord {
  id: string;
  name: string;
  chunks: number;
  pages: number;
  sizeBytes: number;
  status: string;
  uploadedAt?: string;
}

export interface SystemStatus {
  healthy: boolean;
  model?: string;
  embeddingModel?: string;
  persistence?: string;
  documentCount: number;
  chunkCount: number;
  memoryEnabled?: boolean;
  raw?: Record<string, unknown>;
}

export interface MemoryStats {
  totalMemories: number;
  chatMessages: number;
  vectorEntries: number;
  lastCleanup?: string;
  usageLabel?: string;
  raw?: Record<string, unknown>;
}

export interface StreamUpdate {
  text?: string;
  citations?: Citation[];
  toolCalls?: ToolCall[];
  reasoning?: ReasoningStep[];
  done?: boolean;
  error?: string;
}
