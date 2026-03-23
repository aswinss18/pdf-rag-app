import { CheckCircle2, CircleDashed } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function StatusIndicator({ healthy }: { healthy: boolean }) {
  return healthy ? (
    <Badge tone="success">
      <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
      Healthy
    </Badge>
  ) : (
    <Badge tone="warning">
      <CircleDashed className="mr-2 h-3.5 w-3.5" />
      Degraded
    </Badge>
  );
}
