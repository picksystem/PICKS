import { FlatQueueEXRow } from '@serviceops/pages/base/Configuration/sections/Categorization/components/shared';
export type { FlatQueueEXRow };

export interface QueueExpenseSectionProps {
  data?: FlatQueueEXRow[];
  onDataChange?: (data: FlatQueueEXRow[]) => void;
}
