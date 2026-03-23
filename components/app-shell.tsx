"use client";

import { useEffect } from "react";

import { ChatInterface } from "@/components/chat/chat-interface";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { useDocumentStore } from "@/stores/document-store";
import { useMemoryStore } from "@/stores/memory-store";
import { useSystemStore } from "@/stores/system-store";

export function AppShell() {
  const refreshSystem = useSystemStore((state) => state.refresh);
  const loadDocuments = useDocumentStore((state) => state.loadDocuments);
  const fetchMemory = useMemoryStore((state) => state.fetchStats);

  useEffect(() => {
    void Promise.all([refreshSystem(), loadDocuments(), fetchMemory()]);
    const interval = window.setInterval(() => {
      void Promise.all([refreshSystem(), loadDocuments(), fetchMemory()]);
    }, 30000);

    return () => window.clearInterval(interval);
  }, [fetchMemory, loadDocuments, refreshSystem]);

  return (
    <div className="min-h-screen bg-[var(--app-bg)]">
      <Header />
      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[430px_minmax(0,1fr)]">
          <Sidebar />
          <ChatInterface />
        </div>
      </main>
    </div>
  );
}
