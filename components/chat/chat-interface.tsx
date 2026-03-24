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
import { useAuthStore } from "@/stores/auth-store";
import { useChatStore } from "@/stores/chat-store";

export function ChatInterface() {
  const endRef = useRef<HTMLDivElement | null>(null);
  const { messages, isStreaming, clearChat, currentMode, error } = useChatStore();
  const usage = useAuthStore((state) => state.user?.usage);
  const { sendStreamingMessage, stopStreaming } = useStreaming();
  const isAgentLimitReached = currentMode === "agent" && (usage?.requestsRemaining ?? 0) <= 0;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  useEffect(() => {
    if (!error) {
      return;
    }

    if (error === "Daily limit reached") {
      toast.error("Limit reached. Try tomorrow.");
      return;
    }

    toast.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-7rem)] flex-col gap-3 sm:min-h-[calc(100vh-8rem)] sm:gap-4">
      <Panel className="p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)] sm:tracking-[0.28em]">
              Conversational Workspace
            </p>
            <h2 className="mt-2 font-display text-xl text-[var(--text-primary)] sm:text-2xl">
              {currentMode === "rag"
                ? "Ground answers in the indexed document set"
                : "Reason across the workspace with agent tools"}
            </h2>
          </div>
          <Button variant="ghost" className="w-full sm:w-auto" onClick={clearChat}>
            Clear chat
          </Button>
        </div>

        <ModeSelector />
      </Panel>

      <Panel className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-3 overflow-y-auto p-3 sm:space-y-4 sm:p-5">
          {messages.length ? (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          ) : (
            <div className="flex h-full min-h-[260px] flex-col items-center justify-center rounded-[24px] border border-dashed border-[var(--border-strong)] bg-[linear-gradient(180deg,_rgba(255,255,255,0.02),_transparent)] p-6 text-center sm:min-h-[360px] sm:rounded-[28px] sm:p-8">
              <p className="font-display text-2xl text-[var(--text-primary)] sm:text-3xl">
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
        isLimited={isAgentLimitReached}
        remainingRequests={usage?.requestsRemaining ?? 0}
        requestLimit={usage?.requestsLimit ?? 0}
        tokensUsed={usage?.tokensUsed ?? 0}
        onStop={stopStreaming}
        onSend={async (value) => {
          try {
            await sendStreamingMessage(value);
          } catch (error) {
            if (error instanceof Error && error.message === "Daily limit reached") {
              toast.error("Limit reached. Try tomorrow.");
              return;
            }
            toast.error("The stream ended unexpectedly.");
          }
        }}
      />
    </div>
  );
}
