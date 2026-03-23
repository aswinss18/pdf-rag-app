"use client";

import { Database, LogOut, Moon, Sun, UserRound, Wifi } from "lucide-react";

import { useTheme } from "@/components/providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiConfig } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useSystemStore } from "@/stores/system-store";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const status = useSystemStore((state) => state.status);
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[var(--app-chrome)]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.85),_rgba(249,115,22,0.85)_42%,_rgba(15,23,42,0.95)_100%)] text-white shadow-[0_12px_35px_rgba(249,115,22,0.35)]">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">
              PDF RAG Console
            </p>
            <h1 className="font-display text-2xl font-semibold text-[var(--text-primary)]">
              Retrieval workspace for documents, memory, and agents
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Badge tone={status?.healthy ? "success" : "warning"}>
            <Wifi className="mr-2 h-3.5 w-3.5" />
            {status?.healthy ? "Backend online" : "Waiting for backend"}
          </Badge>
          <Badge>{apiConfig.baseUrl}</Badge>
          {isAuthenticated && user ? (
            <Badge>
              <UserRound className="mr-2 h-3.5 w-3.5" />
              {user.username}
            </Badge>
          ) : (
            <Badge tone="warning">Auth required</Badge>
          )}
          {isAuthenticated ? (
            <Button variant="secondary" className="h-10 px-3" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          ) : null}
          <Button
            variant="secondary"
            className="h-10 px-3"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
