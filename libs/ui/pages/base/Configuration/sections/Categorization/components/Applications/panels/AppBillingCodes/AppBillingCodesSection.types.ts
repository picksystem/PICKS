import { IConfigBillingCode } from '@serviceops/interfaces';

export interface FlatAppBCRow extends Omit<IConfigBillingCode, 'id' | 'applicationId'> {
  id: string;
  applicationId: string;
  applicationName: string;
  /**
   * `APP_BILLING_CODES_CONFIG` drives its add/edit form and table columns
   * off `billingCode`/`billingCodeName` fields that aren't declared on
   * `IConfigBillingCode` (that only has `code`/`description`) — a
   * pre-existing mismatch. Declared here so code that reads the fields
   * GenericPanel actually reads/writes type-checks.
   */
  billingCode?: string;
  billingCodeName?: string;
}

export interface AppBillingCodesSectionProps {
  data: FlatAppBCRow[];
  onDataChange?: (data: FlatAppBCRow[]) => void;
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
