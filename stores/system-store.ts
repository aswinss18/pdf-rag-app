"use client";

import { create } from "zustand";

import { getHealth, getStatus } from "@/lib/api";
import type { SystemStatus } from "@/lib/types";

interface SystemStore {
  status: SystemStatus | null;
  health: Record<string, unknown> | null;
  isLoading: boolean;
  error?: string;
  refresh: () => Promise<void>;
}

export const useSystemStore = create<SystemStore>((set) => ({
  status: null,
  health: null,
  isLoading: false,
  error: undefined,
  async refresh() {
    set({ isLoading: true, error: undefined });
    try {
      const [health, status] = await Promise.all([getHealth(), getStatus()]);
      set({ health, status, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Unable to reach backend service.",
      });
    }
  },
}));
