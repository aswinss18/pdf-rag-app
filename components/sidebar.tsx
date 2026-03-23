import { DocumentList } from "@/components/documents/document-list";
import { DocumentUpload } from "@/components/documents/document-upload";
import { MemoryDashboard } from "@/components/memory/memory-dashboard";
import { SystemHealth } from "@/components/system/system-health";

export function Sidebar() {
  return (
    <aside className="space-y-4 xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto">
      <SystemHealth />
      <DocumentUpload />
      <DocumentList />
      <MemoryDashboard />
    </aside>
  );
}
