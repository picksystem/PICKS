import { FlatQueueTSRow } from '@serviceops/pages/base/Configuration/sections/Categorization/components/shared';
export type { FlatQueueTSRow };

export interface QueueTimesheetSectionProps {
  data?: FlatQueueTSRow[];
  onDataChange?: (data: FlatQueueTSRow[]) => void;
}
