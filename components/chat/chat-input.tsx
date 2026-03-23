"use client";

import { CornerDownLeft, Loader2, SendHorizontal, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

const MAX_CHARS = 3000;

export function ChatInput({
  isBusy,
  onSend,
  onStop,
}: {
  isBusy: boolean;
  onSend: (value: string) => Promise<void>;
  onStop: () => void;
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 220)}px`;
  }, [value]);

  return (
    <div className="rounded-[28px] border border-[var(--border-soft)] bg-[var(--surface)]/95 p-4 shadow-[var(--panel-shadow)]">
      <textarea
        ref={textareaRef}
        value={value}
        maxLength={MAX_CHARS}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={async (event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            if (!value.trim() || isBusy) {
              return;
            }

            const nextValue = value.trim();
            setValue("");
            await onSend(nextValue);
          }
        }}
        rows={1}
        placeholder="Ask about your PDFs, request a summary, or let the agent inspect the workspace..."
        className="max-h-[220px] min-h-[110px] w-full resize-none bg-transparent text-[15px] leading-7 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
      />

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
          <p>{value.length}/{MAX_CHARS} characters</p>
          <p className="flex items-center gap-2">
            <CornerDownLeft className="h-3.5 w-3.5" />
            Enter sends, Shift+Enter adds a new line
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isBusy ? (
            <Button variant="secondary" onClick={onStop}>
              <Square className="mr-2 h-4 w-4" />
              Stop
            </Button>
          ) : null}
          <Button
            disabled={isBusy || !value.trim()}
            onClick={async () => {
              if (!value.trim()) {
                return;
              }
              const nextValue = value.trim();
              setValue("");
              await onSend(nextValue);
            }}
          >
            {isBusy ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <SendHorizontal className="mr-2 h-4 w-4" />
            )}
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
