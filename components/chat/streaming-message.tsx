export function StreamingMessage() {
  return (
    <div className="flex items-center gap-2 px-2 py-3 text-sm text-[var(--text-secondary)]">
      <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent)]" />
      <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent)] [animation-delay:120ms]" />
      <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent)] [animation-delay:240ms]" />
      <span className="ml-2">Streaming response...</span>
    </div>
  );
}
