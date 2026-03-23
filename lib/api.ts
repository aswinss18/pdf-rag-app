import "client-only";

import type {
  AssistantMode,
  AuthResponse,
  AuthUser,
  ChatMessage,
  Citation,
  DocumentRecord,
  MemoryStats,
  ReasoningStep,
  StreamUpdate,
  SystemStatus,
  ToolCall,
} from "@/lib/types";

const API_BASE_URL = "/api";
const AUTH_TOKEN_KEY = "pdf-rag-token";

function normalizeApiBaseUrl(value?: string) {
  const normalized = value?.trim().replace(/^["']|["']$/g, "").replace(/\/+$/, "");
  return normalized || "https://pdf-rag-backend-production-67bf.up.railway.app";
}

function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

const API_TARGET_URL = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);

function getStoredToken() {
  if (typeof window === "undefined") {
    return "";
  }
  return window.localStorage.getItem(AUTH_TOKEN_KEY) || "";
}

export function setAuthToken(token: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
}

export function clearAuthToken() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

async function readError(response: Response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const payload = (await response.json()) as Record<string, unknown>;
    const detail =
      typeof payload.detail === "string"
        ? payload.detail
        : typeof payload.error === "string"
          ? payload.error
          : undefined;
    if (detail) {
      return detail;
    }
  }

  return (await response.text()) || `Request failed with status ${response.status}`;
}

async function request<T>(
  path: string,
  init?: RequestInit,
  options?: { skipAuth?: boolean },
): Promise<T> {
  const token = options?.skipAuth ? "" : getStoredToken();
  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function pickNumber(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }
  return 0;
}

function pickString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }
  return "";
}

function normalizeCitation(source: unknown, index: number): Citation {
  const record = asRecord(source);
  return {
    id: pickString(record.id, record.source_id) || `citation-${index}`,
    documentName:
      pickString(record.document_name, record.document, record.filename, record.doc, record.source) ||
      `Source ${index + 1}`,
    page:
      typeof record.page === "number"
        ? record.page
        : typeof record.page_number === "number"
          ? record.page_number
          : null,
    chunk:
      typeof record.chunk === "number"
        ? record.chunk
        : typeof record.chunk_index === "number"
          ? record.chunk_index
          : null,
    excerpt: pickString(record.excerpt, record.text, record.content),
    score:
      typeof record.score === "number"
        ? record.score
        : typeof record.similarity === "number"
          ? record.similarity
          : typeof record.hybrid_score === "number"
            ? record.hybrid_score
            : null,
  };
}

function normalizeToolCall(call: unknown, index: number): ToolCall {
  const record = asRecord(call);
  const argumentsValue = record.arguments;
  const resultValue = record.result;
  return {
    id: pickString(record.id, record.call_id) || `tool-${index}`,
    name: pickString(record.name, record.tool, record.tool_name) || "Tool call",
    status: pickString(record.status, record.state),
    input:
      typeof argumentsValue === "string"
        ? argumentsValue
        : argumentsValue
          ? JSON.stringify(argumentsValue, null, 2)
          : pickString(record.input, record.args),
    output:
      typeof resultValue === "string"
        ? resultValue
        : resultValue
          ? JSON.stringify(resultValue, null, 2)
          : pickString(record.output),
  };
}

function normalizeReasoning(step: unknown, index: number): ReasoningStep {
  const record = asRecord(step);
  return {
    id: pickString(record.id) || `reasoning-${index}`,
    label: pickString(record.label, record.title, record.step) || `Step ${index + 1}`,
    detail: pickString(record.detail, record.content, record.message, record.reasoning),
    status: pickString(record.status),
  };
}

function normalizeDocuments(payload: unknown): DocumentRecord[] {
  const root = asRecord(payload);
  const documentMap =
    !Array.isArray(payload) && root.documents && typeof root.documents === "object"
      ? asRecord(root.documents)
      : null;

  const items = Array.isArray(payload)
    ? payload
    : documentMap
      ? Object.entries(documentMap).map(([name, details]) => ({
          name,
          ...asRecord(details),
        }))
      : asArray(root.documents || root.items || root.data);

  return items.map((item, index) => {
    const record = asRecord(item);
    const pagesValue = record.pages;
    const pageCount = Array.isArray(pagesValue)
      ? pagesValue.length
      : pickNumber(record.pages, record.page_count, record.total_pages);

    return {
      id: pickString(record.id, record.document_id, record.name) || `doc-${index}`,
      name: pickString(record.name, record.filename, record.title) || `Document ${index + 1}`,
      chunks: pickNumber(record.chunks, record.chunk_count, record.num_chunks),
      pages: pageCount,
      sizeBytes: pickNumber(record.size_bytes, record.size, record.file_size),
      status: pickString(record.status) || "ready",
      uploadedAt: pickString(record.uploaded_at, record.created_at),
    };
  });
}

function normalizeStatus(payload: unknown): SystemStatus {
  const record = asRecord(payload);
  const statusValue = pickString(record.status, record.health).toLowerCase();
  return {
    healthy:
      Boolean(record.healthy) ||
      statusValue === "healthy" ||
      statusValue === "ok" ||
      statusValue === "ready",
    model: pickString(record.model, record.llm_model),
    embeddingModel: pickString(record.embedding_model, record.embed_model),
    persistence:
      typeof record.persistence === "string"
        ? record.persistence
        : record.persistence && typeof record.persistence === "object"
          ? JSON.stringify(record.persistence)
          : pickString(record.persistence_status),
    documentCount: pickNumber(record.document_count, record.documents_loaded, record.loaded_documents),
    chunkCount: pickNumber(record.chunk_count, record.total_chunks, record.chunks_in_memory),
    memoryEnabled:
      typeof record.memory_enabled === "boolean" ? record.memory_enabled : undefined,
    raw: record,
  };
}

function normalizeMemoryStats(payload: unknown): MemoryStats {
  const record = asRecord(asRecord(payload).memory_stats ?? payload);
  return {
    totalMemories: pickNumber(record.total_memories, record.total, record.memory_count, record.stored_memories),
    chatMessages: pickNumber(record.chat_messages, record.chat_history_count, record.chat_history_length),
    vectorEntries: pickNumber(record.vector_entries, record.vector_count, record.embeddings, record.memory_index_size),
    lastCleanup: pickString(record.last_cleanup, record.last_cleanup_at),
    usageLabel: pickString(record.usage, record.usage_label, record.memory_usage) || undefined,
    raw: asRecord(payload),
  };
}

function normalizeAnswer(
  payload: unknown,
  fallbackRole: ChatMessage["role"] = "assistant",
): Partial<ChatMessage> {
  const record = asRecord(payload);
  return {
    role: fallbackRole,
    content: pickString(record.answer, record.response, record.content, record.message) || "No response received.",
    citations: asArray(record.sources || record.citations).map(normalizeCitation),
    toolCalls: asArray(record.tool_calls || record.tools).map(normalizeToolCall),
    reasoning: asArray(record.reasoning_steps || record.reasoning || record.steps).map(normalizeReasoning),
  };
}

function normalizeAuthResponse(payload: unknown): AuthResponse {
  const record = asRecord(payload);
  return {
    accessToken: pickString(record.access_token),
    tokenType: pickString(record.token_type) || "bearer",
    username: pickString(record.username),
  };
}

function normalizeAuthUser(payload: unknown): AuthUser {
  const root = asRecord(payload);
  const record = asRecord(root.user ?? payload);
  return {
    id: typeof record.id === "number" ? record.id : 0,
    username: pickString(record.username),
  };
}

export const apiConfig = {
  baseUrl: API_BASE_URL,
  targetUrl: API_TARGET_URL,
};

export async function register(username: string, password: string) {
  const result = await request(
    "/register",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    },
    { skipAuth: true },
  );
  return normalizeAuthResponse(result);
}

export async function login(username: string, password: string) {
  const result = await request(
    "/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    },
    { skipAuth: true },
  );
  return normalizeAuthResponse(result);
}

export async function getCurrentUser() {
  const result = await request("/me");
  return normalizeAuthUser(result);
}

export async function getHealth() {
  return request<Record<string, unknown>>("/health", undefined, { skipAuth: true });
}

export async function getStatus() {
  const result = await request<unknown>("/status");
  return normalizeStatus(result);
}

export async function getDocuments() {
  const result = await request<unknown>("/documents");
  return normalizeDocuments(result);
}

export async function uploadDocument(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  await request<unknown>("/upload", {
    method: "POST",
    body: formData,
    headers: {},
  });
}

export async function clearDocuments() {
  await request<void>("/documents", { method: "DELETE" });
}

export async function askQuestion(query: string) {
  const result = await request<unknown>("/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  return normalizeAnswer(result);
}

export async function askAgent(query: string, history: ChatMessage[]) {
  const result = await request<unknown>("/agent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      conversation_history: history.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    }),
  });
  return normalizeAnswer(result);
}

export async function getMemoryStats() {
  const result = await request<unknown>("/memory/stats");
  return normalizeMemoryStats(result);
}

export async function getMemoryInfo() {
  return request<Record<string, unknown>>("/memory/info");
}

export async function clearMemory(type: "chat" | "all") {
  await request<void>(type === "chat" ? "/memory/chat" : "/memory/all", {
    method: "DELETE",
  });
}

export async function cleanupMemory(days: number) {
  await request<void>(`/memory/cleanup?days=${days}`, { method: "POST" });
}

function parseMaybeJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function normalizeStreamPayload(payload: unknown): StreamUpdate {
  if (typeof payload === "string") {
    const trimmed = payload.trim();
    return {
      text: trimmed === "[DONE]" || trimmed === "DONE" || trimmed === "done" ? "" : payload,
      done: trimmed === "[DONE]" || trimmed === "DONE" || trimmed === "done",
    };
  }

  const record = asRecord(payload);
  const type = pickString(record.type, record.event).toLowerCase();

  return {
    text: pickString(record.delta, record.token, record.content, record.answer, record.text),
    citations: asArray(record.sources || record.citations).map(normalizeCitation),
    toolCalls: asArray(record.tool_calls || record.tools).map(normalizeToolCall),
    reasoning: asArray(record.reasoning_steps || record.reasoning || record.steps).map(normalizeReasoning),
    done: Boolean(record.done) || type === "done" || type === "complete" || type === "final",
    error: pickString(record.error),
  };
}

export async function streamResponse(
  mode: AssistantMode,
  query: string,
  history: ChatMessage[],
  onUpdate: (update: StreamUpdate) => void,
  signal?: AbortSignal,
) {
  const path = mode === "agent" ? "/agent-stream" : "/ask-stream";
  const body =
    mode === "agent"
      ? {
          query,
          conversation_history: history.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }
      : { query };

  const token = getStoredToken();
  const response = await fetch(buildApiUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    signal,
    cache: "no-store",
  });

  if (!response.ok || !response.body) {
    throw new Error(await readError(response));
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() || "";

    for (const chunk of chunks) {
      const data = chunk
        .split("\n")
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.replace(/^data:\s?/, ""))
        .join("\n");

      if (!data) {
        continue;
      }

      onUpdate(normalizeStreamPayload(parseMaybeJson(data)));
    }
  }

  if (buffer.trim()) {
    const lines = buffer
      .split("\n")
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.replace(/^data:\s?/, ""))
      .join("\n");

    if (lines) {
      onUpdate(normalizeStreamPayload(parseMaybeJson(lines)));
    }
  }
}
