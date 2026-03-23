"use client";

import { Copy, FileSearch2 } from "lucide-react";
import toast from "react-hot-toast";

import { AgentToolCalls } from "@/components/chat/agent-tool-calls";
import { ReasoningSteps } from "@/components/chat/reasoning-steps";
import { Badge } from "@/components/ui/badge";
import type { ChatMessage } from "@/lib/types";
import { copyText, formatTimestamp } from "@/lib/utils";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <article
      className={`rounded-[28px] border p-4 sm:p-5 ${
        isUser
          ? "ml-auto max-w-[85%] border-[var(--accent)]/40 bg-[linear-gradient(145deg,_rgba(249,115,22,0.2),_rgba(251,146,60,0.1))]"
          : "max-w-[92%] border-[var(--border-soft)] bg-[var(--surface-soft)]"
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge tone={isUser ? "warning" : "neutral"}>
            {isUser ? "You" : "Assistant"}
          </Badge>
          <span className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
            {formatTimestamp(message.createdAt)}
          </span>
        </div>

        <button
          type="button"
          className="rounded-full p-2 text-[var(--text-secondary)] transition hover:bg-black/10 hover:text-[var(--text-primary)]"
          aria-label="Copy message"
          onClick={async () => {
            await copyText(message.content);
            toast.success("Message copied.");
          }}
        >
          <Copy className="h-4 w-4" />
        </button>
      </div>

      <div className="whitespace-pre-wrap text-sm leading-7 text-[var(--text-primary)] sm:text-[15px]">
        {message.content || (message.status === "streaming" ? "Thinking..." : "")}
      </div>

      {message.citations?.length ? (
        <div className="mt-4 space-y-2 rounded-[24px] border border-[var(--border-soft)] bg-black/10 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">
            Sources
          </p>
          {message.citations.map((citation) => (
            <div
              key={citation.id}
              className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] p-3"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                <FileSearch2 className="h-4 w-4 text-[var(--accent)]" />
                {citation.documentName}
              </div>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                {citation.page ? `Page ${citation.page}` : "Document source"}
              </p>
              {citation.excerpt ? (
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  {citation.excerpt}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      <ReasoningSteps reasoning={message.reasoning} />
      <AgentToolCalls toolCalls={message.toolCalls} />
    </article>
  );
}
