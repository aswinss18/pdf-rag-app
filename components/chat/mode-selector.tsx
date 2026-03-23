"use client";

import { Bot, SearchCode } from "lucide-react";

import { useChatStore } from "@/stores/chat-store";

const modes = [
  {
    id: "rag",
    label: "RAG mode",
    description: "Direct answers grounded in uploaded PDFs.",
    icon: SearchCode,
  },
  {
    id: "agent",
    label: "Agent mode",
    description: "ReAct-style reasoning with tool calls and memory.",
    icon: Bot,
  },
] as const;

export function ModeSelector() {
  const currentMode = useChatStore((state) => state.currentMode);
  const setMode = useChatStore((state) => state.setMode);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {modes.map((mode) => {
        const active = currentMode === mode.id;
        const Icon = mode.icon;

        return (
          <button
            key={mode.id}
            type="button"
            onClick={() => setMode(mode.id)}
            className={`rounded-[24px] border p-4 text-left transition ${
              active
                ? "border-[var(--accent)] bg-[linear-gradient(145deg,_rgba(249,115,22,0.22),_rgba(15,23,42,0.9))]"
                : "border-[var(--border-soft)] bg-[var(--surface-soft)] hover:border-[var(--border-strong)]"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-black/20 p-2 text-[var(--accent)]">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-[var(--text-primary)]">{mode.label}</p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  {mode.description}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
