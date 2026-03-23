"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    toast.error(error.message);
  }, [error.message]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-[var(--app-bg)] p-6">
        <div className="max-w-lg rounded-[32px] border border-[var(--border-soft)] bg-[var(--surface)] p-8 text-center shadow-[var(--panel-shadow)]">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">
            Application error
          </p>
          <h1 className="mt-3 font-display text-3xl text-[var(--text-primary)]">
            The PDF workspace hit an unexpected error
          </h1>
          <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
            {error.message}
          </p>
          <Button className="mt-6" onClick={reset}>
            Try again
          </Button>
        </div>
      </body>
    </html>
  );
}
