import { Brain, Database, FileText, Layers3 } from "lucide-react";

import { StatusIndicator } from "@/components/system/status-indicator";
import { Panel } from "@/components/ui/panel";
import { formatNumber } from "@/lib/utils";
import { useSystemStore } from "@/stores/system-store";

export function SystemHealth() {
  const { status, error } = useSystemStore();

  return (
    <Panel className="p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)] sm:tracking-[0.28em]">
            System Status
          </p>
          <h2 className="mt-2 font-display text-lg text-[var(--text-primary)] sm:text-xl">
            Live service telemetry
          </h2>
        </div>
        <StatusIndicator healthy={Boolean(status?.healthy)} />
      </div>

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
        <MetricCard
          icon={FileText}
          label="Documents"
          value={formatNumber(status?.documentCount || 0)}
        />
        <MetricCard
          icon={Layers3}
          label="Chunks"
          value={formatNumber(status?.chunkCount || 0)}
        />
        <MetricCard icon={Brain} label="LLM" value={status?.model || "Unknown"} />
        <MetricCard
          icon={Database}
          label="Persistence"
          value={status?.persistence || "Not reported"}
        />
      </div>

      {error ? (
        <p className="mt-4 rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200 break-words">
          {error}
        </p>
      ) : null}
    </Panel>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4">
      <div className="flex items-center gap-3 text-[var(--text-secondary)]">
        <div className="rounded-2xl bg-black/15 p-2 text-[var(--accent)]">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm">{label}</span>
      </div>
      <p className="mt-4 break-words text-base font-semibold text-[var(--text-primary)] sm:text-lg">{value}</p>
    </div>
  );
}
