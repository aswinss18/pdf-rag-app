"use client";

import { Activity, Database, LogOut, Moon, Sun, UserRound, Wifi } from "lucide-react";

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
  const usage = user?.usage;

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[var(--app-chrome)]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-3 py-3 sm:px-4 sm:py-4 lg:px-8">
        <div className="flex items-start justify-between gap-3 sm:items-center">
          <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.85),_rgba(249,115,22,0.85)_42%,_rgba(15,23,42,0.95)_100%)] text-white shadow-[0_12px_35px_rgba(249,115,22,0.35)] sm:h-12 sm:w-12">
            <Database className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--text-muted)] sm:text-xs sm:tracking-[0.35em]">
                PDF RAG Console
              </p>
              <h1 className="font-display text-base leading-tight text-[var(--text-primary)] sm:text-2xl sm:font-semibold">
                Retrieval workspace
              </h1>
              <p className="mt-1 text-xs text-[var(--text-secondary)] sm:text-sm">
                Documents, memory, and agent tools
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {isAuthenticated ? (
              <Button variant="secondary" className="h-10 px-3 sm:px-4" onClick={logout}>
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            ) : null}
            <Button
              variant="secondary"
              className="h-10 w-10 px-0"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="-mx-3 overflow-x-auto px-3 sm:mx-0 sm:px-0">
          <div className="flex min-w-max items-center gap-2 pb-1 sm:flex-wrap sm:gap-3">
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
            {usage ? (
              <Badge tone={usage.requestsRemaining > 0 ? "success" : "warning"}>
                <Activity className="mr-2 h-3.5 w-3.5" />
                {usage.requestsRemaining}/{usage.requestsLimit} requests left
              </Badge>
            ) : null}
            {usage ? <Badge>{usage.tokensUsed} tokens today</Badge> : null}
          </div>
        </div>
      </div>
    </header>
  );
}
