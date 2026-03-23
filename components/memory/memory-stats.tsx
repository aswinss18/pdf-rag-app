import { Clock3, DatabaseZap, MessageSquareText } from "lucide-react";

import { formatNumber } from "@/lib/utils";
import { useMemoryStore } from "@/stores/memory-store";

export function MemoryStats() {
  const stats = useMemoryStore((state) => state.stats);

  const items = [
    {
      icon: DatabaseZap,
      label: "Total memories",
      value: formatNumber(stats?.totalMemories || 0),
    },
    {
      icon: MessageSquareText,
      label: "Chat messages",
      value: formatNumber(stats?.chatMessages || 0),
    },
    {
      icon: Clock3,
      label: "Vector entries",
      value: formatNumber(stats?.vectorEntries || 0),
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="rounded-[24px] border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4"
          >
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <Icon className="h-4 w-4 text-[var(--accent)]" />
              {item.label}
            </div>
            <p className="mt-3 text-lg font-semibold text-[var(--text-primary)]">
              {item.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
