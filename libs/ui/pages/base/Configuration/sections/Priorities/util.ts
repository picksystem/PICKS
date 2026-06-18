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
  /** Other priority rows. Used to detect duplicates on Short Description
   *  and Description fields. The row currently being edited is excluded
   *  from the comparison. */
  existingPriorities?: PriorityLevel[];
  onClose: () => void;
  onSave: (data: Partial<PriorityLevel>) => void;
  ticketTypeColumns: { key: string; label: string }[];
}

/**
 * Strip rich-text markers (`**bold**`, `*italic*`, `__underline__`) and
 * compare case-insensitively on plain text. Mirrors the helper used in
 * TicketTypeFormDialog.
 */
const plainText = (v: string): string =>
  String(v ?? '')
    .replace(/\*\*/g, '')
    .replace(/__/g, '')
    .replace(/\*/g, '')
    .trim()
    .toLowerCase();

/**
 * Returns a `{ _form: '...' }` error when the in-progress priority row
 * shares its Short Description or Description with an existing row. The
 * row being edited is excluded. The `_form` key is intentionally a
 * non-field key — it drives the top-of-dialog Alert but does NOT put a
 * red border on any individual input.
 *
 * Per the spec for the Priority section:
 *   - Priority (name):    Allowed  — skip
 *   - Short Description:  Not allowed
 *   - Description:        Not allowed
 *   - Colour (bgColor):   Allowed  — skip
 *   - Internal note:      Allowed  — skip
 */
export const validatePriorityDuplicate = (
  form: Record<string, unknown>,
  data: PriorityLevel[],
  editingRow: PriorityLevel | null,
): { _form: string } | null => {
  const myId = editingRow?.id;
  const others = data.filter((p) => p.id !== myId);

  const conflicts: string[] = [];

  const shortVal = plainText(String(form.shortDescription ?? ''));
  if (shortVal && others.some((p) => plainText(String(p.shortDescription ?? '')) === shortVal)) {
    conflicts.push('Short Description');
  }

  const descVal = plainText(String(form.description ?? ''));
  if (descVal && others.some((p) => plainText(String(p.description ?? '')) === descVal)) {
    conflicts.push('Description');
  }

  if (conflicts.length === 0) return null;
  if (conflicts.length === 1) {
    return {
      _form: `${conflicts[0]} already exists. Please use a different value.`,
    };
  }
  return {
    _form: `${conflicts.join(' and ')} already exist. Please use different values.`,
  };
};

/**
 * Returns a `{ _form: '...' }` error when the in-progress SimpleLevel row
 * (used for both Impact and Urgency) shares its Short Description or
 * Description with an existing row. The row being edited is excluded.
 * The `_form` key is intentionally a non-field key — it drives the
 * top-of-dialog Alert but does NOT put a red border on any individual input.
 *
 * Per the spec for the Impact / Urgency sections:
 *   - Display name:        Allowed  — skip
 *   - Short Description:   Not allowed
 *   - Description:         Not allowed
 *   - Internal note:       Allowed  — skip
 */
export const validateSimpleLevelDuplicate = (
  form: Record<string, unknown>,
  data: SimpleLevel[],
  editingRow: SimpleLevel | null,
): { _form: string } | null => {
  const myId = editingRow?.id;
  const others = data.filter((p) => p.id !== myId);

  const conflicts: string[] = [];

  const shortVal = plainText(String(form.shortDescription ?? ''));
  if (shortVal && others.some((p) => plainText(String(p.shortDescription ?? '')) === shortVal)) {
    conflicts.push('Short Description');
  }

  const descVal = plainText(String(form.description ?? ''));
  if (descVal && others.some((p) => plainText(String(p.description ?? '')) === descVal)) {
    conflicts.push('Description');
  }

  if (conflicts.length === 0) return null;
  if (conflicts.length === 1) {
    return {
      _form: `${conflicts[0]} already exists. Please use a different value.`,
    };
  }
  return {
    _form: `${conflicts.join(' and ')} already exist. Please use different values.`,
  };
};

/**
 * Returns a `{ _form: '...' }` error when the in-progress Matrix row
 * (an Impact × Urgency combination cell) shares its Short Description or
 * Description with another existing cell row in the same ticket-type
 * matrix. The row currently being edited is excluded by id.
 * The `_form` key is intentionally a non-field key — it drives the
 * top-of-dialog Alert but does NOT put a red border on any individual input.
 *
 * Per the spec for the Matrix section:
 *   - Impact:                       Allowed  — skip
 *   - Urgency:                      Allowed  — skip
 *   - Priority:                     Allowed  — skip
 *   - Short Description:            Not allowed
 *   - Description:                  Not allowed
 *   - Activate simple priorities:   Allowed  — skip
 *   - Internal note:                Allowed  — skip
 */
export const validateMatrixRowDuplicate = (
  form: Record<string, unknown>,
  data: MatrixRow[],
  editingRowId: string | null,
): { _form: string } | null => {
  const others = data.filter((r) => r.id !== editingRowId);

  const conflicts: string[] = [];

  const shortVal = plainText(String(form.shortDescription ?? ''));
  if (shortVal && others.some((r) => plainText(String(r.shortDescription ?? '')) === shortVal)) {
    conflicts.push('Short Description');
  }

  const descVal = plainText(String(form.description ?? ''));
  if (descVal && others.some((r) => plainText(String(r.description ?? '')) === descVal)) {
    conflicts.push('Description');
  }

  if (conflicts.length === 0) return null;
  if (conflicts.length === 1) {
    return {
      _form: `${conflicts[0]} already exists. Please use a different value.`,
    };
  }
  return {
    _form: `${conflicts.join(' and ')} already exist. Please use different values.`,
  };
};
