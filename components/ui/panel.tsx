import { cn } from "@/lib/utils";

export function Panel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-[28px] border border-[var(--border-soft)] bg-[var(--surface)]/90 shadow-[var(--panel-shadow)] backdrop-blur-sm",
        className,
      )}
    >
      {children}
    </section>
  );
}
