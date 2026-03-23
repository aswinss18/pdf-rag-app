"use client";

import { create } from "zustand";

import {
  cleanupMemory as cleanupMemoryRequest,
  clearMemory as clearMemoryRequest,
  getMemoryInfo,
  getMemoryStats,
} from "@/lib/api";
import type { MemoryStats } from "@/lib/types";

interface MemoryStore {
  stats: MemoryStats | null;
  details: Record<string, unknown> | null;
  isLoading: boolean;
  error?: string;
  fetchStats: () => Promise<void>;
  clearMemory: (type: "chat" | "all") => Promise<void>;
  cleanupMemory: (days: number) => Promise<void>;
}

export const useMemoryStore = create<MemoryStore>((set, get) => ({
  stats: null,
  details: null,
  isLoading: false,
  error: undefined,
  async fetchStats() {
    set({ isLoading: true, error: undefined });
    try {
      const [stats, details] = await Promise.all([getMemoryStats(), getMemoryInfo()]);
      set({ stats, details, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Unable to load memory stats.",
      });
    }
  },
  async clearMemory(type) {
    set({ isLoading: true, error: undefined });
    try {
      await clearMemoryRequest(type);
      await get().fetchStats();
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Unable to clear memory.",
      });
      throw error;
    }
  },
  async cleanupMemory(days) {
    set({ isLoading: true, error: undefined });
    try {
      await cleanupMemoryRequest(days);
      await get().fetchStats();
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Unable to clean up memory.",
      });
      throw error;
    }
  },
}));
