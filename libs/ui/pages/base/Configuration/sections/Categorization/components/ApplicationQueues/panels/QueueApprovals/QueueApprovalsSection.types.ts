import { FlatQueueApRow } from '@serviceops/configcatorshared';
export type { FlatQueueApRow };

export interface QueueApprovalsSectionProps {
  data?: FlatQueueApRow[];
  onDataChange?: (data: FlatQueueApRow[]) => void;
}
