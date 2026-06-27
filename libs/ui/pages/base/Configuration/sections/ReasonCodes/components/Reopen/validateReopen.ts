import type { IConfigReopenReasonCode } from '@serviceops/interfaces';

export interface ValidationError {
  name?: string;
  _form?: string;
}

const norm = (v: unknown): string => {
  if (v === undefined || v === null) return '';
  return String(v).trim().toLowerCase();
};

/**
 * Returns field-level errors when the in-progress Reopen Reason Code row
 * shares the same name as an existing row. The row being edited is excluded
 * from the check.
 *
 * Returns an object keyed by field name, e.g. { name: '...' } when a duplicate
 * is found. Returns null when the row is unique.
 */
export const validateReopenDuplicate = (
  form: Record<string, string | boolean | number | undefined>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editingRow: any | null,
): ValidationError | null => {
  const rows = data as IConfigReopenReasonCode[];
  const editing = editingRow as IConfigReopenReasonCode | null;

  const nameKey = norm(form.name);
  if (!nameKey) return null;

  const dupIndex = rows.findIndex((r) => {
    if (editing && r.id === editing.id) return false;
    return norm(r.name) === nameKey;
  });

  if (dupIndex === -1) return null;

  return {
    _form: `Reopen Reason Code "${form.name}" already exists. Please use a different name.`,
  };
};
