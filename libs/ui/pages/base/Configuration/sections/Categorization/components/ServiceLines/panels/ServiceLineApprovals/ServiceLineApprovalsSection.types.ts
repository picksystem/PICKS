import { IConfigApproval } from '@serviceops/interfaces';

export interface FlatServiceLineApRow extends Omit<IConfigApproval, 'serviceLineId'> {
  serviceLineId: string;
  serviceLineName: string;
}

export interface ServiceLineApprovalsSectionProps {
  data: FlatServiceLineApRow[];
  onDataChange?: (data: FlatServiceLineApRow[]) => void;
  /** Hide the panel's own icon+title banner — use when it's already shown
   * by an outer dialog wrapper. */
  hideHeader?: boolean;
  /**
   * Pre-fills the "Filter by service line" field when the dialog opens —
   * e.g. when it was opened from the pencil/row-action on a specific
   * service line, so the table starts scoped to just that line. The user
   * can clear it (via the filter field's Clear icon) to see every line.
   */
  initialServiceLineFilter?: string;
}
