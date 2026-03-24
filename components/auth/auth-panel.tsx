"use client";

import { FormEvent, useMemo, useState } from "react";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { useAuthStore } from "@/stores/auth-store";

type AuthMode = "login" | "register";

export function AuthPanel() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { login, register, isLoading, error, setError } = useAuthStore();

  const title = useMemo(
    () => (mode === "login" ? "Sign in to your workspace" : "Create your private workspace"),
    [mode],
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);

    try {
      if (mode === "login") {
        await login(username, password);
        toast.success("Signed in successfully.");
      } else {
        await register(username, password);
        toast.success("Account created successfully.");
      }
    } catch (submitError) {
      toast.error(
        submitError instanceof Error ? submitError.message : "Authentication failed.",
      );
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-5xl items-center justify-center px-3 py-4 sm:min-h-[calc(100vh-10rem)] sm:px-4 sm:py-8 lg:px-8">
      <Panel className="grid w-full overflow-hidden lg:grid-cols-[1.05fr_minmax(0,1fr)]">
        <div className="bg-[linear-gradient(160deg,_rgba(234,88,12,0.96),_rgba(249,115,22,0.78)_40%,_rgba(15,23,42,0.92)_100%)] p-6 text-white sm:p-8 lg:p-10">
          <div className="inline-flex rounded-3xl bg-white/15 p-3 sm:p-4 backdrop-blur">
            <ShieldCheck className="h-7 w-7 sm:h-8 sm:w-8" />
          </div>
          <p className="mt-6 text-[10px] uppercase tracking-[0.28em] text-white/70 sm:mt-8 sm:text-xs sm:tracking-[0.35em]">
            User-isolated RAG
          </p>
          <h2 className="mt-4 font-display text-3xl leading-tight sm:text-4xl">
            Every document, memory, and chat stays scoped to one user.
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-7 text-white/80 sm:mt-5">
            Sign in to access your own indexed PDFs, private memory, and authenticated agent tools.
          </p>
          <div className="mt-6 rounded-[24px] border border-white/15 bg-black/15 p-4 backdrop-blur-sm sm:mt-8 sm:rounded-[28px] sm:p-5">
            <p className="text-sm text-white/85">
              Backend auth is now required for uploads, document listing, RAG queries, agent calls, and memory actions.
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-8 lg:p-10">
          <div className="max-w-md">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)] sm:tracking-[0.28em]">
              Secure access
            </p>
            <h3 className="mt-3 font-display text-2xl text-[var(--text-primary)] sm:text-3xl">
              {title}
            </h3>
            <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
              Use a username and password to get a bearer token for the app session.
            </p>

            <div className="mt-6 inline-flex w-full rounded-2xl bg-[var(--surface-soft)] p-1 sm:w-auto">
              <button
                className={`flex-1 rounded-2xl px-4 py-2 text-sm font-semibold transition sm:flex-none ${
                  mode === "login"
                    ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                    : "text-[var(--text-secondary)]"
                }`}
                onClick={() => setMode("login")}
                type="button"
              >
                Login
              </button>
              <button
                className={`flex-1 rounded-2xl px-4 py-2 text-sm font-semibold transition sm:flex-none ${
                  mode === "register"
                    ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                    : "text-[var(--text-secondary)]"
                }`}
                onClick={() => setMode("register")}
                type="button"
              >
                Register
              </button>
            </div>

            <form className="mt-8 space-y-4" onSubmit={onSubmit}>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                  Username
                </span>
                <input
                  className="h-12 w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-raised)] px-4 text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="aswin"
                  autoComplete="username"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                  Password
                </span>
                <input
                  className="h-12 w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-raised)] px-4 text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 6 characters"
                  type="password"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  required
                />
              </label>

              {error ? (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              ) : null}

              <Button className="h-12 w-full" disabled={isLoading} type="submit">
                <LockKeyhole className="mr-2 h-4 w-4" />
                {isLoading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
              </Button>
            </form>
          </div>
        </div>
      </Panel>
    </div>
  );
}
