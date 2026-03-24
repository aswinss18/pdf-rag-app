import { FileStack, Layers3, ScrollText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { DocumentRecord } from "@/lib/types";
import { formatBytes, formatNumber } from "@/lib/utils";

export function DocumentCard({ document }: { document: DocumentRecord }) {
  return (
    <div className="rounded-[22px] border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4 sm:rounded-[24px]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="rounded-2xl bg-black/15 p-3 text-[var(--accent)]">
            <FileStack className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-[var(--text-primary)]">{document.name}</p>
            <p className="text-sm text-[var(--text-secondary)]">
              {formatBytes(document.sizeBytes)}
            </p>
          </div>
        </div>
        <div className="sm:self-start">
          <Badge tone="success">{document.status}</Badge>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <MiniStat icon={ScrollText} label="Pages" value={formatNumber(document.pages)} />
        <MiniStat icon={Layers3} label="Chunks" value={formatNumber(document.chunks)} />
      </div>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-black/10 p-3 text-sm text-[var(--text-secondary)]">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-[var(--accent)]" />
        <span>{label}</span>
      </div>
      <p className="mt-2 break-words text-base font-semibold text-[var(--text-primary)]">{value}</p>
    </div>
  );
}
