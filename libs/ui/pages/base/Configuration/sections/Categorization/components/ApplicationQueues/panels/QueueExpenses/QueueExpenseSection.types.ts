import { FlatQueueEXRow } from '@serviceops/configcatorshared';
export type { FlatQueueEXRow };

export interface QueueExpenseSectionProps {
  data?: FlatQueueEXRow[];
  onDataChange?: (data: FlatQueueEXRow[]) => void;
  /** Hide the panel's own icon+title banner — use when it's already shown
   * by an outer dialog wrapper. */
  hideHeader?: boolean;
  /**
   * Pre-fills the "Filter by queue" field when the dialog opens — e.g.
   * when it was opened from the pencil/row-action on a specific queue, so
   * the table starts scoped to just that queue. The user can clear it (via
   * the filter field's Clear icon) to see every queue.
   */
  initialQueueFilter?: string;
}
