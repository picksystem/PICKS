export interface PriorityLevel {
  id: string;
  name: string;
  shortDescription?: string;
  description: string;
  color: string; // text color (always #fff for dark badges)
  bgColor: string; // badge background
  sortOrder: number;
  internalNote?: string;
  enabledFor: Record<string, boolean>; // ticketType -> enabled
  accessControl?: string[];
}

export interface ImpactLevel {
  id: string;
  name: string;
  displayName: string;
  shortDescription?: string;
  description: string;
  internalNote?: string;
  bgColor: string;
  sortOrder: number;
  isActive: boolean;
  enabledFor: Record<string, boolean>;
}

export interface UrgencyLevel {
  id: string;
  name: string;
  displayName: string;
  shortDescription?: string;
  description: string;
  internalNote?: string;
  bgColor: string;
  sortOrder: number;
  isActive: boolean;
  enabledFor: Record<string, boolean>;
}

export interface MatrixCellData {
  shortDescription?: string;
  description?: string;
  internalNote?: string;
}

export type MatrixMap = Record<string, Record<string, string>>;

// Extended matrix map storing fullcell data (priorityId + additional fields) for each impact x urgency
export type ExtendedMatrixMap = Record<
  string,
  Record<
    string,
    {
      priorityId: string;
      shortDescription?: string;
      description?: string;
      internalNote?: string;
    }
  >
>;

export interface SectionProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  accentColor: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

export interface MatrixTableProps {
  priorities: PriorityLevel[];
  impacts: ImpactLevel[];
  urgencies: UrgencyLevel[];
  matrix: MatrixMap;
  editable: boolean;
  onCellChange: (impact: string, urgency: string, priorityId: string) => void;
}

export interface SimpleLevel {
  id: string;
  displayName: string;
  shortDescription?: string;
  description: string;
  bgColor: string;
  isActive: boolean;
  internalNote?: string;
  enabledFor: Record<string, boolean>;
  accessControl?: string[];
}

export interface SimpleLevelFormDialogProps {
  open: boolean;
  noun: string;
  accent: string;
  icon: React.ReactNode;
  editing: SimpleLevel | null;
  onClose: () => void;
  onSave: (data: Partial<SimpleLevel>) => void;
  ticketTypeColumns: { key: string; label: string }[];
}

export interface SimpleLevelSectionProps {
  items: SimpleLevel[];
  noun: string;
  accent: string;
  icon: React.ReactNode;
  valueLabel: string;
  defaultItems: SimpleLevel[];
  ticketTypeColumns: { key: string; label: string }[];
  onAdd: (data: Partial<SimpleLevel>) => void;
  onEdit: (id: string, data: Partial<SimpleLevel>) => void;
  onDelete: (id: string) => void;
  onReset: (defaults: SimpleLevel[]) => void;
  onToggleActive: (id: string) => void;
  onToggleEnabledFor: (id: string, ticketType: string) => void;
}

export interface MatrixRow {
  id: string;
  impactId: string;
  urgencyId: string;
  priorityId: string;
  shortDescription?: string;
  description?: string;
  internalNote?: string;
}

export interface SimplePrioritiesBucket {
  active: boolean;
  description?: string;
}

export interface TicketMatrixSectionProps {
  label: string;
  accentColor: string;
  MatrixIcon: React.ElementType;
  priorities: PriorityLevel[];
  impacts: ImpactLevel[];
  urgencies: UrgencyLevel[];
  matrices: Record<string, ExtendedMatrixMap | SimplePrioritiesBucket>;
  onMatrixChange: (impact: string, urgency: string, priorityId: string) => void;
  onMatrixReset: (ticketType: string, newMatrix: ExtendedMatrixMap) => void;
  onMatricesChange?: (next: Record<string, ExtendedMatrixMap | SimplePrioritiesBucket>) => void;
}

export interface PriorityFormDialogProps {
  open: boolean;
  editing: PriorityLevel | null;
  onClose: () => void;
  onSave: (data: Partial<PriorityLevel>) => void;
  ticketTypeColumns: { key: string; label: string }[];
}
