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
    <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-5xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <Panel className="grid w-full overflow-hidden lg:grid-cols-[1.05fr_minmax(0,1fr)]">
        <div className="bg-[linear-gradient(160deg,_rgba(234,88,12,0.96),_rgba(249,115,22,0.78)_40%,_rgba(15,23,42,0.92)_100%)] p-8 text-white sm:p-10">
          <div className="inline-flex rounded-3xl bg-white/15 p-4 backdrop-blur">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <p className="mt-8 text-xs uppercase tracking-[0.35em] text-white/70">
            User-isolated RAG
          </p>
          <h2 className="mt-4 font-display text-4xl leading-tight">
            Every document, memory, and chat stays scoped to one user.
          </h2>
          <p className="mt-5 max-w-lg text-sm leading-7 text-white/80">
            Sign in to access your own indexed PDFs, private memory, and authenticated agent tools.
          </p>
          <div className="mt-8 rounded-[28px] border border-white/15 bg-black/15 p-5 backdrop-blur-sm">
            <p className="text-sm text-white/85">
              Backend auth is now required for uploads, document listing, RAG queries, agent calls, and memory actions.
            </p>
          </div>
        </div>

        <div className="p-8 sm:p-10">
          <div className="max-w-md">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">
              Secure access
            </p>
            <h3 className="mt-3 font-display text-3xl text-[var(--text-primary)]">
              {title}
            </h3>
            <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
              Use a username and password to get a bearer token for the app session.
            </p>

            <div className="mt-6 inline-flex rounded-2xl bg-[var(--surface-soft)] p-1">
              <button
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
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
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
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
