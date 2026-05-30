import { FlatQueueTSRow } from '@serviceops/configcatorshared';
export type { FlatQueueTSRow };

export interface QueueTimesheetSectionProps {
  data?: FlatQueueTSRow[];
  onDataChange?: (data: FlatQueueTSRow[]) => void;
}
