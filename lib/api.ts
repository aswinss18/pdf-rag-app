import "client-only";

import type {
  AssistantMode,
  ChatMessage,
  Citation,
  DocumentRecord,
  MemoryStats,
  ReasoningStep,
  StreamUpdate,
  SystemStatus,
  ToolCall,
} from "@/lib/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
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
      pickString(
        record.document_name,
        record.document,
        record.filename,
        record.source,
      ) || `Source ${index + 1}`,
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
          : null,
  };
}

function normalizeToolCall(call: unknown, index: number): ToolCall {
  const record = asRecord(call);
  return {
    id: pickString(record.id, record.call_id) || `tool-${index}`,
    name: pickString(record.name, record.tool, record.tool_name) || "Tool call",
    status: pickString(record.status, record.state),
    input: pickString(record.input, record.arguments, record.args),
    output: pickString(record.output, record.result),
  };
}

function normalizeReasoning(step: unknown, index: number): ReasoningStep {
  const record = asRecord(step);
  return {
    id: pickString(record.id) || `reasoning-${index}`,
    label: pickString(record.label, record.title, record.step) || `Step ${index + 1}`,
    detail: pickString(record.detail, record.content, record.message),
    status: pickString(record.status),
  };
}

function normalizeDocuments(payload: unknown): DocumentRecord[] {
  const root = asRecord(payload);
  const items = Array.isArray(payload)
    ? payload
    : asArray(root.documents || root.items || root.data);

  return items.map((item, index) => {
    const record = asRecord(item);
    return {
      id: pickString(record.id, record.document_id, record.name) || `doc-${index}`,
      name: pickString(record.name, record.filename, record.title) || `Document ${index + 1}`,
      chunks: pickNumber(record.chunks, record.chunk_count, record.num_chunks),
      pages: pickNumber(record.pages, record.page_count),
      sizeBytes: pickNumber(record.size_bytes, record.size, record.file_size),
      status: pickString(record.status) || "ready",
      uploadedAt: pickString(record.uploaded_at, record.created_at),
    };
  });
}

function normalizeStatus(payload: unknown): SystemStatus {
  const record = asRecord(payload);
  return {
    healthy:
      Boolean(record.healthy) ||
      pickString(record.status, record.health).toLowerCase() === "healthy",
    model: pickString(record.model, record.llm_model),
    embeddingModel: pickString(record.embedding_model, record.embed_model),
    persistence: pickString(record.persistence, record.persistence_status),
    documentCount: pickNumber(
      record.document_count,
      record.documents_loaded,
      record.loaded_documents,
    ),
    chunkCount: pickNumber(record.chunk_count, record.total_chunks),
    memoryEnabled:
      typeof record.memory_enabled === "boolean" ? record.memory_enabled : undefined,
    raw: record,
  };
}

function normalizeMemoryStats(payload: unknown): MemoryStats {
  const record = asRecord(payload);
  return {
    totalMemories: pickNumber(record.total_memories, record.total, record.memory_count),
    chatMessages: pickNumber(record.chat_messages, record.chat_history_count),
    vectorEntries: pickNumber(record.vector_entries, record.vector_count, record.embeddings),
    lastCleanup: pickString(record.last_cleanup, record.last_cleanup_at),
    usageLabel:
      pickString(record.usage, record.usage_label, record.memory_usage) || undefined,
    raw: record,
  };
}

function normalizeAnswer(
  payload: unknown,
  fallbackRole: ChatMessage["role"] = "assistant",
): Partial<ChatMessage> {
  const record = asRecord(payload);
  return {
    role: fallbackRole,
    content:
      pickString(record.answer, record.response, record.content, record.message) ||
      "No response received.",
    citations: asArray(record.sources || record.citations).map(normalizeCitation),
    toolCalls: asArray(record.tool_calls || record.tools).map(normalizeToolCall),
    reasoning: asArray(record.reasoning || record.steps).map(normalizeReasoning),
  };
}

export const apiConfig = {
  baseUrl: API_BASE_URL,
};

export async function getHealth() {
  return request<Record<string, unknown>>("/health");
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
      text:
        trimmed === "[DONE]" || trimmed === "DONE" || trimmed === "done"
          ? ""
          : payload,
      done: trimmed === "[DONE]" || trimmed === "DONE" || trimmed === "done",
    };
  }

  const record = asRecord(payload);
  const type = pickString(record.type, record.event).toLowerCase();

  return {
    text: pickString(record.delta, record.token, record.content, record.answer, record.text),
    citations: asArray(record.sources || record.citations).map(normalizeCitation),
    toolCalls: asArray(record.tool_calls || record.tools).map(normalizeToolCall),
    reasoning: asArray(record.reasoning || record.steps).map(normalizeReasoning),
    done:
      Boolean(record.done) ||
      type === "done" ||
      type === "complete" ||
      type === "final",
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

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify(body),
    signal,
    cache: "no-store",
  });

  if (!response.ok || !response.body) {
    throw new Error(`Streaming request failed with status ${response.status}`);
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
