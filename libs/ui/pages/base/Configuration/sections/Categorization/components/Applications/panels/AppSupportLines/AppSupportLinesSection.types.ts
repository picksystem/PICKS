import { IConfigSupportLine } from '@serviceops/interfaces';

export interface FlatAppSlRow extends Omit<IConfigSupportLine, 'id'> {
  id: string;
  applicationId: string;
  applicationName: string;
  /**
   * `APP_SUPPORT_LINES_CONFIG` drives its add/edit form and table columns
   * off a `queueName` field that isn't declared on `IConfigSupportLine`
   * (that only has `name`) — a pre-existing mismatch. Declared here so
   * code that reads the field GenericPanel actually reads/writes type-checks.
   */
  queueName?: string;
}

export interface AppSupportLinesSectionProps {
  data: FlatAppSlRow[];
  onDataChange?: (data: FlatAppSlRow[]) => void;
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
