import React from 'react';

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
  | 'timesheetProjects'
  | 'projectCategories'
  | 'serviceLineEntries'
  | 'applicationEntries'
  | 'queueEntries'
  | 'resourceEntries';

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
