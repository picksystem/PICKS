import { ReactNode } from 'react';

export interface TableField {
  name: string;
  label: string;
  required?: boolean;
  bold?: boolean;
  minWidth?: number;
  defaultValue?: string | number | boolean;
  type?: 'text' | 'date' | 'number' | 'toggle';
}

export interface TableConfig {
  title: string;
  subtitle: string;
  accent: string;
  icon: ReactNode;
  entity: string;
  fields: TableField[];
}