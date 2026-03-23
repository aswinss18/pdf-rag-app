"use client";

import { create } from "zustand";

import { clearDocuments, getDocuments, uploadDocument as uploadDocumentRequest } from "@/lib/api";
import type { DocumentRecord } from "@/lib/types";

interface DocumentStore {
  documents: DocumentRecord[];
  uploadProgress: number;
  isUploading: boolean;
  isLoading: boolean;
  error?: string;
  loadDocuments: () => Promise<void>;
  uploadDocument: (file: File) => Promise<void>;
  clearAllDocuments: () => Promise<void>;
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  documents: [],
  uploadProgress: 0,
  isUploading: false,
  isLoading: false,
  error: undefined,
  async loadDocuments() {
    set({ isLoading: true, error: undefined });
    try {
      const documents = await getDocuments();
      set({ documents, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to load documents.",
      });
    }
  },
  async uploadDocument(file) {
    set({ isUploading: true, uploadProgress: 12, error: undefined });
    try {
      set({ uploadProgress: 48 });
      await uploadDocumentRequest(file);
      set({ uploadProgress: 100 });
      await get().loadDocuments();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Upload failed.",
      });
      throw error;
    } finally {
      window.setTimeout(() => {
        set({ isUploading: false, uploadProgress: 0 });
      }, 500);
    }
  },
  async clearAllDocuments() {
    set({ isLoading: true, error: undefined });
    try {
      await clearDocuments();
      set({ documents: [], isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Unable to clear documents.",
      });
      throw error;
    }
  },
}));
