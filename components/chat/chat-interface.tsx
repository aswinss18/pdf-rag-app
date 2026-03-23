"use client";

import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

import { ChatInput } from "@/components/chat/chat-input";
import { MessageBubble } from "@/components/chat/message-bubble";
import { ModeSelector } from "@/components/chat/mode-selector";
import { StreamingMessage } from "@/components/chat/streaming-message";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { useStreaming } from "@/hooks/use-streaming";
import { useChatStore } from "@/stores/chat-store";

export function ChatInterface() {
  const endRef = useRef<HTMLDivElement | null>(null);
  const { messages, isStreaming, clearChat, currentMode, error } = useChatStore();
  const { sendStreamingMessage, stopStreaming } = useStreaming();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col gap-4">
      <Panel className="p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">
              Conversational Workspace
            </p>
            <h2 className="mt-2 font-display text-2xl text-[var(--text-primary)]">
              {currentMode === "rag"
                ? "Ground answers in the indexed document set"
                : "Reason across the workspace with agent tools"}
            </h2>
          </div>
          <Button variant="ghost" onClick={clearChat}>
            Clear chat
          </Button>
        </div>

        <ModeSelector />
      </Panel>

      <Panel className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
          {messages.length ? (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          ) : (
            <div className="flex h-full min-h-[360px] flex-col items-center justify-center rounded-[28px] border border-dashed border-[var(--border-strong)] bg-[linear-gradient(180deg,_rgba(255,255,255,0.02),_transparent)] p-8 text-center">
              <p className="font-display text-3xl text-[var(--text-primary)]">
                Ask the assistant what matters in your PDFs
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
                Use RAG mode for grounded retrieval or switch to agent mode for
                multi-step reasoning, tool calls, and memory-aware analysis.
              </p>
            </div>
          )}

          {isStreaming ? <StreamingMessage /> : null}
          <div ref={endRef} />
        </div>
      </Panel>

      <ChatInput
        isBusy={isStreaming}
        onStop={stopStreaming}
        onSend={async (value) => {
          try {
            await sendStreamingMessage(value);
          } catch {
            toast.error("The stream ended unexpectedly.");
          }
        }}
      />
    </div>
  );
}
