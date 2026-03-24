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
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-[1600px] items-center justify-center px-4 py-6 sm:min-h-[calc(100vh-6rem)] sm:px-6 lg:px-8">
          <div className="rounded-[24px] border border-[var(--border-strong)] bg-[var(--surface)] px-5 py-4 text-sm text-[var(--text-secondary)] shadow-[var(--panel-shadow)] sm:rounded-[28px] sm:px-6 sm:py-5">
            Restoring session...
          </div>
        </div>
      ) : isAuthenticated ? (
        <main className="mx-auto max-w-[1600px] px-3 py-4 sm:px-4 sm:py-6 lg:px-8">
          <div className="grid gap-4 xl:grid-cols-[390px_minmax(0,1fr)] xl:gap-6 2xl:grid-cols-[430px_minmax(0,1fr)]">
            <div className="order-2 xl:order-1">
              <Sidebar />
            </div>
            <div className="order-1 xl:order-2">
              <ChatInterface />
            </div>
          </div>
        </main>
      ) : (
        <AuthPanel />
      )}
    </div>
  );
}
