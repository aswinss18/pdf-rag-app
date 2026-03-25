"use client";

import { create } from "zustand";

import {
  clearDocuments,
  getDocuments,
  getUploadJob,
  uploadDocument as uploadDocumentRequest,
} from "@/lib/api";
import type { DocumentRecord, UploadJobStatus } from "@/lib/types";
import { useSystemStore } from "@/stores/system-store";

interface DocumentStore {
  documents: DocumentRecord[];
  uploadProgress: number;
  isUploading: boolean;
  isLoading: boolean;
  error?: string;
  uploadStatus?: string;
  activeJob?: UploadJobStatus;
  loadDocuments: () => Promise<void>;
  uploadDocument: (file: File) => Promise<void>;
  clearAllDocuments: () => Promise<void>;
  reset: () => void;
}

const JOB_POLL_INTERVAL_MS = 1500;

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function progressForStatus(status: string) {
  switch (status) {
    case "queued":
      return 38;
    case "processing":
      return 74;
    case "completed":
      return 100;
    default:
      return 12;
  }
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  documents: [],
  uploadProgress: 0,
  isUploading: false,
  isLoading: false,
  error: undefined,
  uploadStatus: undefined,
  activeJob: undefined,
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
    set({
      isUploading: true,
      uploadProgress: 12,
      error: undefined,
      uploadStatus: "Uploading file",
      activeJob: undefined,
    });

    try {
      set({ uploadProgress: 48 });
      const job = await uploadDocumentRequest(file);
      set({
        uploadProgress: progressForStatus(job.status),
        uploadStatus: job.message || "Upload queued",
      });

      let currentJob = await getUploadJob(job.jobId);
      set({
        activeJob: currentJob,
        uploadProgress: progressForStatus(currentJob.status),
        uploadStatus: currentJob.message || currentJob.status,
      });

      while (currentJob.status === "queued" || currentJob.status === "processing") {
        await wait(JOB_POLL_INTERVAL_MS);
        currentJob = await getUploadJob(job.jobId);
        set({
          activeJob: currentJob,
          uploadProgress: progressForStatus(currentJob.status),
          uploadStatus: currentJob.message || currentJob.status,
        });
      }

      if (currentJob.status === "failed") {
        throw new Error(currentJob.error || currentJob.message || "Document processing failed.");
      }

      set({
        uploadProgress: 100,
        uploadStatus: currentJob.message || "Document ready",
      });
      await get().loadDocuments();
      await useSystemStore.getState().refresh();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Upload failed.",
        uploadStatus: "Upload failed",
      });
      throw error;
    } finally {
      window.setTimeout(() => {
        set({
          isUploading: false,
          uploadProgress: 0,
          uploadStatus: undefined,
          activeJob: undefined,
        });
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
  reset() {
    set({
      documents: [],
      uploadProgress: 0,
      isUploading: false,
      isLoading: false,
      error: undefined,
      uploadStatus: undefined,
      activeJob: undefined,
    });
  },
}));
