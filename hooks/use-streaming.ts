"use client";

import { useRef } from "react";

import { streamResponse } from "@/lib/api";
import { mergeStreamingText } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useChatStore } from "@/stores/chat-store";

export function useStreaming() {
  const abortRef = useRef<AbortController | null>(null);
  const {
    addUserMessage,
    createAssistantMessage,
    messages,
    setError,
    setStreaming,
    updateAssistantMessage,
  } = useChatStore();

  async function sendStreamingMessage(query: string) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    addUserMessage(query);
    const assistantId = createAssistantMessage();
    setStreaming(true);
    setError(undefined);

    try {
      const history = messages.filter((message) => message.role !== "system");
      await streamResponse(
        query,
        history,
        (update) => {
          const current = useChatStore
            .getState()
            .messages.find((message) => message.id === assistantId);

          if (update.usage) {
            useAuthStore.getState().setUsage(update.usage);
          }

          updateAssistantMessage(assistantId, {
            content: mergeStreamingText(current?.content || "", update.text || ""),
            citations: update.citations?.length ? update.citations : current?.citations,
            toolCalls: update.toolCalls?.length ? update.toolCalls : current?.toolCalls,
            reasoning: update.reasoning?.length ? update.reasoning : current?.reasoning,
            status: update.error ? "error" : update.done ? "idle" : "streaming",
          });

          if (update.error) {
            setError(update.error);
          }
        },
        controller.signal,
      );

      updateAssistantMessage(assistantId, { status: "idle" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Streaming request failed.";
      updateAssistantMessage(assistantId, {
        content: message,
        status: "error",
      });
      setError(message);
      throw error;
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  return {
    sendStreamingMessage,
    stopStreaming() {
      abortRef.current?.abort();
      abortRef.current = null;
      setStreaming(false);
    },
  };
}
