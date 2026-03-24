"use client";

import { FolderOpen, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { DocumentCard } from "@/components/documents/document-card";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { useDocumentStore } from "@/stores/document-store";

export function DocumentList() {
  const { clearAllDocuments, documents, isLoading } = useDocumentStore();

  return (
    <Panel className="p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)] sm:tracking-[0.28em]">
            Documents
          </p>
          <h2 className="mt-2 font-display text-lg text-[var(--text-primary)] sm:text-xl">
            Indexed library
          </h2>
        </div>
        <Button
          variant="danger"
          className="h-10 w-full px-3 sm:w-auto"
          disabled={!documents.length || isLoading}
          onClick={async () => {
            try {
              await clearAllDocuments();
              toast.success("All documents cleared.");
            } catch (error) {
              toast.error(
                error instanceof Error ? error.message : "Unable to clear documents.",
              );
            }
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Clear all
        </Button>
      </div>

      {documents.length ? (
        <div className="space-y-3">
          {documents.map((document) => (
            <DocumentCard key={document.id} document={document} />
          ))}
        </div>
      ) : (
        <div className="rounded-[22px] border border-dashed border-[var(--border-strong)] bg-[var(--surface-soft)] p-5 text-center sm:rounded-[24px] sm:p-6">
          <FolderOpen className="mx-auto h-8 w-8 text-[var(--accent)]" />
          <p className="mt-4 text-base font-medium text-[var(--text-primary)] sm:text-lg">
            No PDFs indexed yet
          </p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Upload a document to start retrieval, citations, and agent-assisted analysis.
          </p>
        </div>
      )}
    </Panel>
  );
}
