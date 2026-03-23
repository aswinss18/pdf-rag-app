import { Wrench } from "lucide-react";

import type { ToolCall } from "@/lib/types";

export function AgentToolCalls({ toolCalls }: { toolCalls?: ToolCall[] }) {
  if (!toolCalls?.length) {
    return null;
  }

  return (
    <div className="mt-4 space-y-2 rounded-[24px] border border-[var(--border-soft)] bg-black/10 p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">
        Tool Calls
      </p>
      {toolCalls.map((tool) => (
        <div
          key={tool.id}
          className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] p-3"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
            <Wrench className="h-4 w-4 text-[var(--accent)]" />
            {tool.name}
          </div>
          {tool.status ? (
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
              {tool.status}
            </p>
          ) : null}
          {tool.output ? (
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{tool.output}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
