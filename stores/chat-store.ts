"use client";

import { create } from "zustand";

import { askAgent, askQuestion } from "@/lib/api";
import type {
  AssistantMode,
  ChatMessage,
  Citation,
  ReasoningStep,
  ToolCall,
} from "@/lib/types";
import { uid } from "@/lib/utils";

interface ChatStore {
  messages: ChatMessage[];
  isStreaming: boolean;
  currentMode: AssistantMode;
  error?: string;
  setMode: (mode: AssistantMode) => void;
  addUserMessage: (content: string) => string;
  createAssistantMessage: () => string;
  updateAssistantMessage: (
    id: string,
    patch: Partial<
      Pick<
        ChatMessage,
        "content" | "status" | "citations" | "toolCalls" | "reasoning"
      >
    >,
  ) => void;
  setStreaming: (value: boolean) => void;
  sendMessage: (query: string) => Promise<void>;
  clearChat: () => void;
  setError: (value?: string) => void;
  reset: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isStreaming: false,
  currentMode: "rag",
  error: undefined,
  setMode(mode) {
    set({ currentMode: mode });
  },
  addUserMessage(content) {
    const id = uid("user");
    const message: ChatMessage = {
      id,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
      status: "idle",
    };

    set((state) => ({ messages: [...state.messages, message], error: undefined }));
    return id;
  },
  createAssistantMessage() {
    const id = uid("assistant");
    const message: ChatMessage = {
      id,
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
      status: "streaming",
      citations: [],
      toolCalls: [],
      reasoning: [],
    };

    set((state) => ({ messages: [...state.messages, message] }));
    return id;
  },
  updateAssistantMessage(id, patch) {
    set((state) => ({
      messages: state.messages.map((message) =>
        message.id === id ? { ...message, ...patch } : message,
      ),
    }));
  },
  setStreaming(value) {
    set({ isStreaming: value });
  },
  async sendMessage(query) {
    const {
      currentMode,
      addUserMessage,
      createAssistantMessage,
      updateAssistantMessage,
      messages,
    } = get();
    addUserMessage(query);
    const assistantId = createAssistantMessage();
    set({ isStreaming: true, error: undefined });

    try {
      const history = messages.filter((message) => message.role !== "system");
      const response =
        currentMode === "agent"
          ? await askAgent(query, history)
          : await askQuestion(query);

      updateAssistantMessage(assistantId, {
        content: response.content || "",
        citations: response.citations as Citation[] | undefined,
        toolCalls: response.toolCalls as ToolCall[] | undefined,
        reasoning: response.reasoning as ReasoningStep[] | undefined,
        status: "idle",
      });
    } catch (error) {
      updateAssistantMessage(assistantId, {
        content:
          error instanceof Error
            ? error.message
            : "Something went wrong while generating a response.",
        status: "error",
      });
      set({
        error:
          error instanceof Error ? error.message : "Failed to send the message.",
      });
      throw error;
    } finally {
      set({ isStreaming: false });
    }
  },
  clearChat() {
    set({ messages: [], error: undefined, isStreaming: false });
  },
  reset() {
    set({
      messages: [],
      isStreaming: false,
      currentMode: "rag",
      error: undefined,
    });
  },
  setError(value) {
    set({ error: value });
  },
}));
