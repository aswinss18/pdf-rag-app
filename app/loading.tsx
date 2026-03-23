export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)]">
      <div className="rounded-[32px] border border-[var(--border-soft)] bg-[var(--surface)] px-6 py-5 text-sm text-[var(--text-secondary)] shadow-[var(--panel-shadow)]">
        Loading PDF RAG workspace...
      </div>
    </div>
  );
}
