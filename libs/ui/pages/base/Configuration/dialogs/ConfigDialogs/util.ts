export // ── ConfigFormDialog ───────────────────────────────────────────────────────────
// Shared shell for every New/Edit dialog across all Configuration sections.
// Matches the Templates page dialog design: gradient banner header, rounded
// paper, clean padded content area, and standard Cancel/Submit actions.

interface ConfigFormDialogProps {
  open: boolean;
  onClose: (event?: object, reason?: string) => void;
  onSubmit: () => void;
  isEdit: boolean;
  /** Icon node rendered in the header (use sx={{ color: '#fff', fontSize: '1.1rem' }}) */
  icon: React.ReactNode;
  /** Section accent color – drives gradient and submit button */
  accent: string;
  /** Base entity noun, e.g. "Priority Level". Used to build default titles. */
  title: string;
  /** Override the "New …" heading */
  newTitle?: string;
  /** Override the "Edit …" heading */
  editTitle?: string;
  /** Banner subtitle shown when creating */
  subtitle?: string;
  /** Banner subtitle shown when editing (falls back to subtitle) */
  editSubtitle?: string;
  submitDisabled?: boolean;
  /** Override submit button label (defaults: "Save Changes" / "Add") */
  submitLabel?: string;
  /** Hide both Cancel and Submit buttons (useful for read-only or auto-save forms) */
  hideActions?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}
