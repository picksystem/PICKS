// Strip serializeRichText markers (**bold**, *italic*, __underline__, • bullets)
// so the table cell shows plain readable text instead of raw markup.
export const stripRichText = (raw: string): string =>
  String(raw ?? '')
    .split('\n')
    .map((line) =>
      line
        .trim()
        .replace(/^•\s*/, '')
        .replace(/^-\s*/, '')
        .replace(/^\d+\.\s*/, '')
        .replace(/^\*\*(.+)\*\*$/, '$1')
        .replace(/^\*(.+)\*$/, '$1')
        .replace(/^__(.+)__$/, '$1'),
    )
    .filter(Boolean)
    .join(' · ');

// Strip rich-text markers (**bold**, *italic*, __underline__) so duplicate
// detection compares the underlying text rather than the markup. Lowercased
// and trimmed for case-insensitive comparison.
export const plainText = (v: unknown): string =>
  String(v ?? '')
    .replace(/\*\*/g, '')
    .replace(/__/g, '')
    .replace(/\*/g, '')
    .trim()
    .toLowerCase();

/**
 * Shared duplicate validator for the Response / Acknowledgement SLA and
 * Resolution SLA sections. Per spec:
 *   - SLAs (ticket type):  Not allowed
 *   - Activation:          N/A
 *   - Short Description:   Not allowed
 *   - Internal note:       Allowed  — skip
 *   - P1, P2, etc:         Allowed  — skip
 *
 * Returns a single composite message for the top-of-dialog Alert, or null
 * when the form passes. The Alert is the only signal — no per-field red
 * borders for duplicates. Matches the pattern used in TicketTypeFormDialog,
 * StatusFormDialog, and the Matrix section.
 */
export const validateSlaRowDuplicate = (
  form: Record<string, unknown>,
  rows: Array<{ id: string; ticketTypeId?: number; shortDescription?: string }>,
  editingRowId: string | null,
): string | null => {
  const others = rows.filter((r) => r.id !== editingRowId);

  const conflicts: string[] = [];

  const ticketTypeVal = String(form.ticketTypeId ?? '').trim();
  if (ticketTypeVal && others.some((r) => String(r.ticketTypeId ?? '').trim() === ticketTypeVal)) {
    conflicts.push('Ticket type');
  }

  const shortVal = plainText(form.shortDescription);
  if (shortVal && others.some((r) => plainText(r.shortDescription) === shortVal)) {
    conflicts.push('Short Description');
  }

  if (conflicts.length === 0) return null;
  if (conflicts.length === 1) {
    return `${conflicts[0]} already exists. Please use a different value.`;
  }
  return `${conflicts.join(' and ')} already exist. Please use different values.`;
};

/**
 * Shared duplicate validator for the ETA Activation and Time Logs Activation
 * sections. Per spec:
 *   - SLAs (ticket type):  Not allowed
 *   - Activation:          N/A
 *   - Short Description:   Not allowed
 *   - Internal note:       Allowed  — skip
 *
 * Returns a single composite message for the top-of-dialog Alert, or null
 * when the form passes. Same Alert-only signal as validateSlaRowDuplicate.
 */
export const validateActivationRowDuplicate = (
  form: { ticketTypeId: number; shortDescription: string },
  rows: Array<{ id: string; ticketTypeId?: number; shortDescription?: string }>,
  editingRowId: string | null,
): string | null => {
  const others = rows.filter((r) => r.id !== editingRowId);

  const conflicts: string[] = [];

  const ticketTypeVal = String(form.ticketTypeId ?? '').trim();
  if (ticketTypeVal && others.some((r) => String(r.ticketTypeId ?? '').trim() === ticketTypeVal)) {
    conflicts.push('Ticket type');
  }

  const shortVal = plainText(form.shortDescription);
  if (shortVal && others.some((r) => plainText(r.shortDescription) === shortVal)) {
    conflicts.push('Short Description');
  }

  if (conflicts.length === 0) return null;
  if (conflicts.length === 1) {
    return `${conflicts[0]} already exists. Please use a different value.`;
  }
  return `${conflicts.join(' and ')} already exist. Please use different values.`;
};
