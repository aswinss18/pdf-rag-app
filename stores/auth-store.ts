"use client";

import { create } from "zustand";

import { clearAuthToken, login as loginRequest, register as registerRequest, setAuthToken, getCurrentUser } from "@/lib/api";
import type { AuthUser } from "@/lib/types";
import { useChatStore } from "@/stores/chat-store";
import { useDocumentStore } from "@/stores/document-store";
import { useMemoryStore } from "@/stores/memory-store";
import { useSystemStore } from "@/stores/system-store";

interface AuthStore {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  isLoading: boolean;
  error?: string;
  hydrate: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setError: (value?: string) => void;
}

function resetWorkspaceState() {
  useChatStore.getState().clearChat();
  useDocumentStore.getState().reset();
  useMemoryStore.getState().reset();
  useSystemStore.getState().reset();
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isHydrated: false,
  isLoading: false,
  error: undefined,
  async hydrate() {
    set({ isLoading: true, error: undefined });
    try {
      const user = await getCurrentUser();
      set({
        user,
        isAuthenticated: true,
        isHydrated: true,
        isLoading: false,
      });
    } catch {
      clearAuthToken();
      resetWorkspaceState();
      set({
        user: null,
        isAuthenticated: false,
        isHydrated: true,
        isLoading: false,
      });
    }
  },
  async login(username, password) {
    set({ isLoading: true, error: undefined });
    try {
      const response = await loginRequest(username, password);
      setAuthToken(response.accessToken);
      const user = await getCurrentUser();
      set({
        user,
        isAuthenticated: true,
        isHydrated: true,
        isLoading: false,
        error: undefined,
      });
    } catch (error) {
      clearAuthToken();
      set({
        user: null,
        isAuthenticated: false,
        isHydrated: true,
        isLoading: false,
        error: error instanceof Error ? error.message : "Unable to log in.",
      });
      throw error;
    }
  },
  async register(username, password) {
    set({ isLoading: true, error: undefined });
    try {
      const response = await registerRequest(username, password);
      setAuthToken(response.accessToken);
      const user = await getCurrentUser();
      set({
        user,
        isAuthenticated: true,
        isHydrated: true,
        isLoading: false,
        error: undefined,
      });
    } catch (error) {
      clearAuthToken();
      set({
        user: null,
        isAuthenticated: false,
        isHydrated: true,
        isLoading: false,
        error: error instanceof Error ? error.message : "Unable to create the account.",
      });
      throw error;
    }
  },
  logout() {
    clearAuthToken();
    resetWorkspaceState();
    set({
      user: null,
      isAuthenticated: false,
      isHydrated: true,
      isLoading: false,
      error: undefined,
    });
  },
  setError(value) {
    set({ error: value });
  },
}));
