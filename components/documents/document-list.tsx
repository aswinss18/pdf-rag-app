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
    <Panel className="p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">
            Documents
          </p>
          <h2 className="mt-2 font-display text-xl text-[var(--text-primary)]">
            Indexed library
          </h2>
        </div>
        <Button
          variant="danger"
          className="h-10 px-3"
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
        <div className="rounded-[24px] border border-dashed border-[var(--border-strong)] bg-[var(--surface-soft)] p-6 text-center">
          <FolderOpen className="mx-auto h-8 w-8 text-[var(--accent)]" />
          <p className="mt-4 text-lg font-medium text-[var(--text-primary)]">
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
