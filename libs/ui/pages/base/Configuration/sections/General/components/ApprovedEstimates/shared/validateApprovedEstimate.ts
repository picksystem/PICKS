import type { IConfigApprovedEstimateRow } from '@serviceops/interfaces';

const norm = (v: unknown): string => {
  if (v === undefined || v === null) return '';
  return String(v).trim().toLowerCase();
};

// TicketType is the only required scope field, but it can arrive in two
// shapes: a string id (e.g. "incident") from TicketTypeSearchField, or a
// numeric id on persisted rows. Normalize to a comparable string.
const toTicketTypeKey = (v: unknown): string => {
  if (v === undefined || v === null) return '';
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : '';
  const raw = String(v).trim();
  if (!raw) return '';
  // If it's a numeric string, use the numeric form so 1 and "1" match.
  const asNum = Number(raw);
  if (Number.isFinite(asNum) && /^\d+(\.\d+)?$/.test(raw)) return String(asNum);
  return raw.toLowerCase();
};

/**
 * Returns an error string when the in-progress Approved Estimate row shares
 * its (ticketType, serviceLine, application, queue) tuple with an existing
 * row. Hours is intentionally NOT part of the key. The row being edited is
 * excluded from the check.
 */
export const validateApprovedEstimateDuplicate = (
  form: Record<string, unknown>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editingRow: any | null,
): string | null => {
  const rows = data as IConfigApprovedEstimateRow[];
  const editing = editingRow as IConfigApprovedEstimateRow | null;

  const ticketTypeKey = toTicketTypeKey(form.ticketTypeId);
  if (!ticketTypeKey) return null;

  const key = {
    ticketType: ticketTypeKey,
    serviceLine: norm(form.serviceLine),
    application: norm(form.application),
    queue: norm(form.queue),
  };

  const dupIndex = rows.findIndex((r) => {
    if (editing && r.id === editing.id) return false;
    return (
      toTicketTypeKey(r.ticketTypeId) === key.ticketType &&
      norm(r.serviceLine) === key.serviceLine &&
      norm(r.application) === key.application &&
      norm(r.queue) === key.queue
    );
  });

  if (dupIndex === -1) return null;
  return `DUPLICATE — not allowed. Duplicate of line ${dupIndex + 1}.`;
};
