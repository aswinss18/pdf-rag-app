import { Sparkles } from "lucide-react";

import type { ReasoningStep } from "@/lib/types";

export function ReasoningSteps({ reasoning }: { reasoning?: ReasoningStep[] }) {
  if (!reasoning?.length) {
    return null;
  }

  return (
    <div className="mt-4 space-y-2 rounded-[24px] border border-[var(--border-soft)] bg-black/10 p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">
        Reasoning Steps
      </p>
      {reasoning.map((step, index) => (
        <div key={step.id} className="flex gap-3 rounded-2xl bg-[var(--surface-soft)] p-3">
          <div className="mt-0.5 rounded-full bg-[var(--accent)]/20 p-2 text-[var(--accent)]">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {index + 1}. {step.label}
            </p>
            {step.detail ? (
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{step.detail}</p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
