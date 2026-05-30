import { FlatQueueEXRow } from '@serviceops/configcatorshared';
export type { FlatQueueEXRow };

export interface QueueExpenseSectionProps {
  data?: FlatQueueEXRow[];
  onDataChange?: (data: FlatQueueEXRow[]) => void;
}
