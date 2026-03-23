import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        tone === "success" &&
          "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30",
        tone === "warning" &&
          "bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/30",
        tone === "neutral" &&
          "bg-[var(--surface-soft)] text-[var(--text-secondary)] ring-1 ring-[var(--border-soft)]",
      )}
    >
      {children}
    </span>
  );
}
