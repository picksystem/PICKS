import { IConfigApproval } from '@serviceops/interfaces';

export interface FlatAppApRow extends Omit<IConfigApproval, 'applicationId'> {
  applicationId: string;
  applicationName: string;
}

export interface AppApprovalsSectionProps {
  data: FlatAppApRow[];
  onDataChange?: (data: FlatAppApRow[]) => void;
  /** Hide the panel's own icon+title banner — use when it's already shown
   * by an outer dialog wrapper. */
  hideHeader?: boolean;
  /**
   * Pre-fills the "Filter by application" field when the dialog opens —
   * e.g. when it was opened from the pencil/row-action on a specific
   * application, so the table starts scoped to just that application. The
   * user can clear it (via the filter field's Clear icon) to see every
   * application.
   */
  initialApplicationFilter?: string;
}
