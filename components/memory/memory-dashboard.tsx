"use client";

import { RotateCcw, Sparkles, Trash } from "lucide-react";
import toast from "react-hot-toast";

import { MemoryStats } from "@/components/memory/memory-stats";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { useMemoryStore } from "@/stores/memory-store";

export function MemoryDashboard() {
  const { clearMemory, cleanupMemory, details, error, isLoading, stats } = useMemoryStore();

  return (
    <Panel className="p-4 sm:p-5">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)] sm:tracking-[0.28em]">
          Memory
        </p>
        <h2 className="mt-2 font-display text-lg text-[var(--text-primary)] sm:text-xl">
          Persistent conversation context
        </h2>
      </div>

      <MemoryStats />

      <div className="mt-5 grid gap-3">
        <Button
          variant="secondary"
          className="w-full"
          disabled={isLoading}
          onClick={async () => {
            try {
              await cleanupMemory(30);
              toast.success("Old memories cleaned up.");
            } catch (error) {
              toast.error(
                error instanceof Error ? error.message : "Cleanup failed.",
              );
            }
          }}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Cleanup items older than 30 days
        </Button>
        <Button
          variant="secondary"
          className="w-full"
          disabled={isLoading}
          onClick={async () => {
            try {
              await clearMemory("chat");
              toast.success("Chat history cleared.");
            } catch (error) {
              toast.error(
                error instanceof Error ? error.message : "Unable to clear chat history.",
              );
            }
          }}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Clear chat history
        </Button>
        <Button
          variant="danger"
          className="w-full"
          disabled={isLoading}
          onClick={async () => {
            try {
              await clearMemory("all");
              toast.success("All memory cleared.");
            } catch (error) {
              toast.error(
                error instanceof Error ? error.message : "Unable to clear memory.",
              );
            }
          }}
        >
          <Trash className="mr-2 h-4 w-4" />
          Clear all memory
        </Button>
      </div>

      <div className="mt-5 rounded-[22px] border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4 sm:rounded-[24px]">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)] sm:tracking-[0.22em]">
          Memory details
        </p>
        <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)] break-words">
          Usage: {stats?.usageLabel || "Not reported"}
        </p>
        <pre className="mt-4 max-h-48 overflow-auto rounded-2xl bg-black/20 p-3 text-[11px] text-[var(--text-secondary)] sm:text-xs">
          {JSON.stringify(details || {}, null, 2)}
        </pre>
      </div>

      {error ? (
        <p className="mt-4 rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200 break-words">
          {error}
        </p>
      ) : null}
    </Panel>
  );
}
