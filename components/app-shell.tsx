"use client";

import { useEffect } from "react";

import { AuthPanel } from "@/components/auth/auth-panel";
import { ChatInterface } from "@/components/chat/chat-interface";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { useAuthStore } from "@/stores/auth-store";
import { useDocumentStore } from "@/stores/document-store";
import { useMemoryStore } from "@/stores/memory-store";
import { useSystemStore } from "@/stores/system-store";

export function AppShell() {
  const refreshSystem = useSystemStore((state) => state.refresh);
  const loadDocuments = useDocumentStore((state) => state.loadDocuments);
  const fetchMemory = useMemoryStore((state) => state.fetchStats);
  const { hydrate, isAuthenticated, isHydrated } = useAuthStore();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    void Promise.all([refreshSystem(), loadDocuments(), fetchMemory()]);
    const interval = window.setInterval(() => {
      void Promise.all([refreshSystem(), loadDocuments(), fetchMemory()]);
    }, 30000);

    return () => window.clearInterval(interval);
  }, [fetchMemory, isAuthenticated, loadDocuments, refreshSystem]);

  return (
    <div className="min-h-screen bg-[var(--app-bg)]">
      <Header />
      {!isHydrated ? (
        <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-[1600px] items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-[var(--border-strong)] bg-[var(--surface)] px-6 py-5 text-sm text-[var(--text-secondary)] shadow-[var(--panel-shadow)]">
            Restoring session...
          </div>
        </div>
      ) : isAuthenticated ? (
        <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid gap-6 xl:grid-cols-[430px_minmax(0,1fr)]">
            <Sidebar />
            <ChatInterface />
          </div>
        </main>
      ) : (
        <AuthPanel />
      )}
    </div>
  );
}
