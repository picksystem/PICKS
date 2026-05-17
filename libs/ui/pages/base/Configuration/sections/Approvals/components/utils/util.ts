// ── Types ──────────────────────────────────────────────────────────────────────
export interface FormField {
  name: string;
  label: string;
  type?: 'text' | 'time' | 'multiline';
  required?: boolean;
  disabled?: boolean;
  defaultValue?: string;
}

export interface PanelConfig {
  accent: string;
  icon: React.ReactNode;
  title: string;
  tableName: TableName;
}

export type TableName =
  | 'approvalRecords'
  | 'assocUserProfiles'
  | 'consultantRoles'
  | 'workingTimes';

export interface ConfigPanelProps<T extends { id: string }> {
  config: PanelConfig;
  data: T[];
  selectedId: string | null | undefined;
  onSave: (next: T[]) => void;
  onSelectId: (id: string | null) => void;
  fields: FormField[];
  deleteEntityName: string;
  deleteItemNameField?: keyof T;
}

export interface TableColumn {
  id: string;
  label: string;
  minWidth: number;
  bold?: boolean;
  truncate?: boolean;
}

export interface TableConfig {
  name: string;
  displayName: string;
  buttonName?: string;
  columns: TableColumn[];
  fields: FormField[];
  deleteEntityName: string;
  deleteItemNameField?: string;
  searchFields: string[];
}

export interface SharedDataTableProps {
  tableName: TableName;
  data: any[];
  selectedId?: string | null;
  onRowClick?: (row: any) => void;
  initialRowsPerPage?: number;
  searchable?: boolean;
}
