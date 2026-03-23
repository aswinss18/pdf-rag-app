import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--accent)] text-[var(--accent-foreground)] shadow-[0_12px_30px_rgba(15,23,42,0.18)] hover:brightness-110",
  secondary:
    "bg-[var(--surface-raised)] text-[var(--text-primary)] ring-1 ring-[var(--border-strong)] hover:bg-[var(--surface-soft)]",
  ghost:
    "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-soft)] hover:text-[var(--text-primary)]",
  danger:
    "bg-[var(--danger)] text-white shadow-[0_10px_25px_rgba(239,68,68,0.28)] hover:brightness-110",
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-2xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
