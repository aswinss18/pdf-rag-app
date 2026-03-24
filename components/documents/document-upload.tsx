"use client";

import { UploadCloud } from "lucide-react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";

import { Panel } from "@/components/ui/panel";
import { formatBytes } from "@/lib/utils";
import { useDocumentStore } from "@/stores/document-store";

export function DocumentUpload() {
  const { isUploading, uploadDocument, uploadProgress } = useDocumentStore();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled: isUploading,
    async onDrop(acceptedFiles) {
      const [file] = acceptedFiles;
      if (!file) {
        return;
      }

      try {
        await uploadDocument(file);
        toast.success(`${file.name} uploaded successfully.`);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Unable to upload the document.",
        );
      }
    },
    onDropRejected() {
      toast.error("Only PDF files are supported.");
    },
  });

  return (
    <Panel className="overflow-hidden">
      <div
        {...getRootProps()}
        className="cursor-pointer p-3 transition hover:bg-white/5 sm:p-5"
        aria-label="Upload PDF document"
      >
        <input {...getInputProps()} />
        <div
          className={`rounded-[22px] border border-dashed p-4 transition sm:rounded-[26px] sm:p-6 ${
            isDragActive
              ? "border-[var(--accent)] bg-[var(--accent)]/10"
              : "border-[var(--border-strong)] bg-[var(--surface-soft)]"
          }`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="w-fit rounded-3xl bg-[var(--accent)]/15 p-3 text-[var(--accent)] sm:p-4">
              <UploadCloud className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-display text-lg text-[var(--text-primary)] sm:text-xl">
                Drop a PDF to ingest it
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                The assistant will chunk, index, and make it searchable in the RAG workspace.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-[var(--text-secondary)] sm:mt-6 sm:gap-3">
            <span>Drag and drop or click to browse</span>
            <span className="rounded-full bg-black/15 px-3 py-1">PDF only</span>
            <span className="rounded-full bg-black/15 px-3 py-1">{formatBytes(25 * 1024 * 1024)} suggested max</span>
          </div>

          {isUploading ? (
            <div className="mt-5 sm:mt-6">
              <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-[var(--text-muted)] sm:tracking-[0.22em]">
                <span>Uploading</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-black/15">
                <div
                  className="h-full rounded-full bg-[var(--accent)] transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </Panel>
  );
}
