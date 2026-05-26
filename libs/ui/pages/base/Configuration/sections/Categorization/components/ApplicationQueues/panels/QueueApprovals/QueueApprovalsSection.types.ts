import { FlatQueueApRow } from '@serviceops/pages/base/Configuration/sections/Categorization/components/shared';
export type { FlatQueueApRow };

export interface QueueApprovalsSectionProps {
  data?: FlatQueueApRow[];
  onDataChange?: (data: FlatQueueApRow[]) => void;
}
