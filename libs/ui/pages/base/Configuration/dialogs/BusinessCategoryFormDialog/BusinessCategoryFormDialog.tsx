import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, Box, Typography, TextField, Paper } from '@serviceops/component';
import {
  alpha,
  CircularProgress,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import { AccountTree, Clear as ClearIcon, Search as SearchIcon } from '@mui/icons-material';
import { useFieldError, useNotification } from '@serviceops/hooks';
import { IConfigBusinessCategory } from '@serviceops/interfaces';
import { ConfigFormDialog } from '@serviceops/configdialogs';
import { parseRichText, serializeRichText, RichTextEditor } from '../../shared/RichTextEditor';

const BC_ACCENT = '#0369a1';

// Alpha-numeric pattern used as a soft guard (matches the spec wording
// "Alpha-numeric"). Spaces, dashes and underscores are allowed so values
// like "HR Operations" or "Finance-1" pass; characters outside this set
// are stripped from the plain-text view at validation time.
const ALNUM_PATTERN = /[^A-Za-z0-9 _-]/g;

const stripAlphaNumeric = (v: string): string => String(v ?? '').replace(ALNUM_PATTERN, '');

interface BusinessCategoryFormDialogProps {
  open: boolean;
  editing: IConfigBusinessCategory | null;
  /** Other business-category rows for duplicate detection. */
  existingCategories?: IConfigBusinessCategory[];
  onClose: () => void;
  onSave: (data: Partial<IConfigBusinessCategory>) => void;
  /**
   * Drop-down options for the "Business Category Head" field. Typically
   * derived from `useConfiguration().consultantProfiles.profiles` and
   * mapped to `{ value, label }` shape. The optional `subtitle` is shown
   * as the secondary line under each option (e.g. the consultant's role
   * or email) — mirrors the Name + role columns from the User Management
   * page so the popover reads like a user list.
   */
  headOptions?: { value: string; label: string; subtitle?: string }[];
  subtitle?: string;
}

const BusinessCategoryFormDialog = ({
  open,
  editing,
  existingCategories = [],
  onClose,
  onSave,
  headOptions = [],
  subtitle,
}: BusinessCategoryFormDialogProps) => {
  const { success } = useNotification();
  const reqError = useFieldError();
  const [form, setForm] = useState<Partial<IConfigBusinessCategory>>({});
  // Mirror of `form` that updates synchronously inside onChange handlers.
  // The RichTextEditor only fires onChange on blur, so a state update from
  // there lands AFTER the user has already clicked Submit. By the time
  // handleSubmit runs, `form` is still the previous render's value and
  // duplicate checks would miss values typed into the editor. We read this
  // ref in handleSubmit / computeDuplicateMessage to get the live value.
  const formRef = useRef<Partial<IConfigBusinessCategory>>({});
  const [duplicateAlert, setDuplicateAlert] = useState<string | null>(null);
  // Per-field required-validation state. Touched flips true on blur (or
  // immediately on Submit) and `requiredErrors` carries the field-level
  // message produced by validateRequired. Mirrors the formik
  // touched/errors shape that useFieldError expects.
  const [touched, setTouched] = useState<{
    name?: boolean;
    shortDescription?: boolean;
    description?: boolean;
    head?: boolean;
    internalNote?: boolean;
  }>({});
  const [requiredErrors, setRequiredErrors] = useState<{
    name?: string;
    shortDescription?: string;
    description?: string;
    head?: string;
    internalNote?: string;
  }>({});

  // Updates both the ref and the state in one go. Use this everywhere a
  // field changes so handleSubmit always sees the latest values.
  const updateForm = useCallback(
    (
      patch:
        | Partial<IConfigBusinessCategory>
        | ((f: Partial<IConfigBusinessCategory>) => Partial<IConfigBusinessCategory>),
    ) => {
      formRef.current =
        typeof patch === 'function' ? patch(formRef.current) : { ...formRef.current, ...patch };
      setForm(formRef.current);
    },
    [],
  );

  // Normalize stored rich-text into plain alpha-numeric text for required
  // and duplicate checks. Strips formatting markers (`**`, `__`, `*`) used
  // by the RichTextEditor serializer, then drops anything outside the
  // alpha-numeric + space/dash/underscore set so the alpha-numeric spec
  // is enforced even though the editor allows inline styling.
  const plainText = (v: string): string =>
    stripAlphaNumeric(
      String(v ?? '')
        .replace(/\*\*/g, '')
        .replace(/__/g, '')
        .replace(/\*/g, ''),
    )
      .trim()
      .toLowerCase();

  /**
   * Required-field validation per the spec:
   *   Business Category Name (name)  — Yes
   *   Short Description              — Yes
   *   Description                    — No
   *   Business Category Head (head)  — Yes
   *   Internal note                  — No
   *
   * `name` is no longer a free-form input — the dialog uses the rich-text
   * editor for it via the same plumbing as Short Description, so we check
   * its plain text here as well. (If you switch name back to a TextField,
   * `plainText` still works on a plain string.)
   */
  const validateRequired = (f: Partial<IConfigBusinessCategory>): typeof requiredErrors => {
    const errs: typeof requiredErrors = {};
    if (!String(f.name ?? '').trim()) errs.name = 'required';
    if (!plainText(f.shortDescription ?? '')) errs.shortDescription = 'required';
    if (!String(f.head ?? '').trim()) errs.head = 'required';
    return errs;
  };

  /**
   * Returns a single consolidated duplicate message, or null when the form
   * passes the duplicate check.
   *
   * Per the spec for the Business Category section:
   *   - Business Category Name:     Not allowed
   *   - Short Description:          Not allowed
   *   - Description:                Allowed  — skip
   *   - Business Category Head:     Allowed  — skip
   *   - Internal note:              Allowed  — skip
   */
  const computeDuplicateMessage = (f: Partial<IConfigBusinessCategory>): string | null => {
    const myId = editing?.id;
    const others = existingCategories.filter((c) => c.id !== myId);

    const conflicts: string[] = [];

    const nameVal = plainText(f.name ?? '');
    if (nameVal && others.some((c) => plainText(c.name ?? '') === nameVal)) {
      conflicts.push('Business Category Name');
    }

    const shortVal = plainText(f.shortDescription ?? '');
    if (shortVal && others.some((c) => plainText(c.shortDescription ?? '') === shortVal)) {
      conflicts.push('Short Description');
    }

    if (conflicts.length === 0) return null;
    if (conflicts.length === 1) {
      return `${conflicts[0]} already exists. Please use a different value.`;
    }
    return `${conflicts.join(' and ')} already exist. Please use different values.`;
  };

  // Live-recompute the duplicate alert so the user sees it as they type,
  // not only after clicking Submit.
  useEffect(() => {
    if (!open) {
      setDuplicateAlert(null);
      return;
    }
    setDuplicateAlert(computeDuplicateMessage(formRef.current));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, open, editing, existingCategories]);

  useEffect(() => {
    if (!open) return;
    // Reset required-validation state each time the dialog opens so
    // errors from a previous Add/Edit don't carry over.
    setTouched({});
    setRequiredErrors({});
    const initial: Partial<IConfigBusinessCategory> = editing
      ? {
          name: editing.name,
          shortDescription: editing.shortDescription ?? '',
          description: editing.description,
          head: editing.head,
          internalNote: editing.internalNote ?? '',
        }
      : {
          name: '',
          shortDescription: '',
          description: '',
          head: '',
          internalNote: '',
        };
    formRef.current = initial;
    setForm(initial);
  }, [open, editing]);

  const handleSubmit = () => {
    // Run required-field validation first so the user sees a per-field red
    // border / helper text on Name, Short Description, and Head when any
    // of them is blank. Mark all required fields as touched so the errors
    // render even if the user hasn't blurred them yet.
    const reqErrs = validateRequired(formRef.current);
    setRequiredErrors(reqErrs);
    setTouched({ name: true, shortDescription: true, head: true });
    if (Object.keys(reqErrs).length > 0) {
      return;
    }

    const message = computeDuplicateMessage(formRef.current);
    if (message) {
      setDuplicateAlert(message);
      return;
    }
    setDuplicateAlert(null);
    onSave(formRef.current);
    success(
      editing ? 'Business category updated successfully' : 'Business category added successfully',
    );
  };

  const nameError = reqError(touched.name, requiredErrors.name);
  const shortError = reqError(touched.shortDescription, requiredErrors.shortDescription);
  const headError = reqError(touched.head, requiredErrors.head);

  // ── Business Category Head — search-style autocomplete ──────────────────
  // Mirrors the TicketTypeSearchField pattern used by Add Approved Estimate:
  //   - TextField with a search/clear end adornment
  //   - Floating Paper + List of matching consultant options
  //   - Stored value is the consultant name (string id used by the form)
  // `headInput` mirrors `form.head` while typing; it stays in sync when the
  // stored value changes (e.g. when editing opens with a pre-filled head).
  const [headInput, setHeadInput] = useState<string>('');
  const [headOptionsOpen, setHeadOptionsOpen] = useState(false);
  const [headLoading, setHeadLoading] = useState(false);
  const headDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stored = String(form.head ?? '');
    // `form.head` holds the user's full name (passed in via
    // headOptions[*].value), so the stored value IS the display text. We
    // only mirror it into `headInput` when it actually differs, to avoid
    // overwriting the user's in-progress typing.
    if (stored !== headInput) {
      setHeadInput(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.head]);

  const headSearch = useCallback(
    (query: string) => {
      const q = query.trim().toLowerCase();
      if (!q) return headOptions;
      return headOptions.filter((o) =>
        String(o.label ?? '')
          .toLowerCase()
          .includes(q),
      );
    },
    [headOptions],
  );

  const [headFiltered, setHeadFiltered] = useState<
    { value: string; label: string; subtitle?: string }[]
  >([]);

  const handleHeadInputChange = useCallback(
    (value: string) => {
      setHeadInput(value);
      if (headDebounceRef.current) clearTimeout(headDebounceRef.current);
      headDebounceRef.current = setTimeout(() => {
        setHeadLoading(true);
        const next = headSearch(value);
        setHeadFiltered(next);
        setHeadOptionsOpen(next.length > 0);
        setHeadLoading(false);
      }, 200);
    },
    [headSearch],
  );

  const handleHeadSelect = useCallback(
    (opt: { value: string; label: string; subtitle?: string }) => {
      setHeadInput(opt.label);
      setHeadOptionsOpen(false);
      setHeadFiltered([]);
      setTouched((t) => ({ ...t, head: true }));
      updateForm((f) => ({ ...f, head: opt.value }));
    },
    [updateForm],
  );

  const handleHeadClear = useCallback(() => {
    setHeadInput('');
    setHeadFiltered([]);
    setHeadOptionsOpen(false);
    updateForm((f) => ({ ...f, head: '' }));
  }, [updateForm]);

  // Reset the search field's transient state whenever the dialog opens so a
  // previously-typed query (and any open popover) doesn't bleed into a new
  // Add/Edit cycle.
  useEffect(() => {
    if (open) {
      setHeadOptionsOpen(false);
      setHeadFiltered([]);
      setHeadLoading(false);
    }
  }, [open]);

  return (
    <ConfigFormDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      isEdit={!!editing}
      icon={<AccountTree sx={{ color: '#fff', fontSize: '1.1rem' }} />}
      accent={BC_ACCENT}
      title='Business Category'
      subtitle={subtitle}
      submitDisabled={false}
      submitLabel={editing ? 'Save' : 'Submit'}
      maxWidth='md'
    >
      {/* Duplicate Alert — single dialog-level message. Per spec, only
          Business Category Name and Short Description must be unique.
          The Alert is the only signal; no per-field red borders for
          duplicates. */}
      {duplicateAlert && (
        <Alert severity='error' variant='outlined' sx={{ mb: 1 }}>
          {duplicateAlert}
        </Alert>
      )}

      {/* Business Category Name — required */}
      <TextField
        label='Business Category Name'
        size='small'
        value={form.name ?? ''}
        onChange={(e) => updateForm((f) => ({ ...f, name: e.target.value }))}
        onBlur={() => setTouched((t) => ({ ...t, name: true }))}
        placeholder='e.g. Finance, IT Operations'
        inputProps={{ style: { fontFamily: 'monospace', fontWeight: 700 } }}
        error={Boolean(nameError)}
        helperText={nameError || ' '}
        required
      />

      {/* Short Description — required */}
      <Box>
        <Box
          onBlur={() => setTouched((t) => ({ ...t, shortDescription: true }))}
          sx={{ borderRadius: 1 }}
        >
          <RichTextEditor
            value={parseRichText(form.shortDescription ?? '')}
            onChange={(value) =>
              updateForm((f) => ({
                ...f,
                shortDescription: serializeRichText(value.segments),
              }))
            }
            showFooterActions={false}
            title='Short Description'
            required
            error={Boolean(shortError)}
          />
          <Typography
            variant='caption'
            sx={{
              color: shortError ? '#d32f2f' : 'text.secondary',
              fontSize: '0.7rem',
              mt: 0.5,
              display: 'block',
            }}
          >
            {shortError || ' '}
          </Typography>
        </Box>
      </Box>

      {/* Description — optional */}
      <Box>
        <Box
          onBlur={() => setTouched((t) => ({ ...t, description: true }))}
          sx={{ borderRadius: 1 }}
        >
          <RichTextEditor
            value={parseRichText(form.description ?? '')}
            onChange={(value) =>
              updateForm((f) => ({
                ...f,
                description: serializeRichText(value.segments),
              }))
            }
            showFooterActions={false}
            title='Description'
          />
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ fontSize: '0.7rem', mt: 0.5, display: 'block' }}
          >
            {' '}
          </Typography>
        </Box>
      </Box>

      {/* Business Category Head — required search field (mirrors the
          TicketTypeSearchField pattern used by Add Approved Estimate).
          The popover is anchored to a position-relative wrapper around the
          input element only (not the TextField as a whole), so the list
          sits flush against the input's bottom border instead of dropping
          below the helperText row. The helperText is rendered separately
          below the popover anchor so it doesn't create the visible gap
          the user reported. */}
      <Box>
        <Box sx={{ position: 'relative' }}>
          <TextField
            label='Business Category Head'
            placeholder='Search users...'
            value={headInput}
            onChange={(e) => handleHeadInputChange(e.target.value)}
            onFocus={() => {
              const next = headSearch(headInput);
              setHeadFiltered(next);
              if (next.length > 0) setHeadOptionsOpen(true);
            }}
            onBlur={() => {
              setTouched((t) => ({ ...t, head: true }));
              setTimeout(() => setHeadOptionsOpen(false), 200);
            }}
            fullWidth
            size='small'
            required
            error={Boolean(headError)}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position='end'>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {headLoading ? (
                        <CircularProgress size={16} />
                      ) : headInput ? (
                        <ClearIcon
                          onClick={handleHeadClear}
                          sx={{
                            fontSize: 18,
                            color: 'text.primary',
                            cursor: 'pointer',
                            '&:hover': { color: 'text.primary' },
                          }}
                        />
                      ) : (
                        <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      )}
                    </Box>
                  </InputAdornment>
                ),
              },
            }}
          />
          {headOptionsOpen && headFiltered.length > 0 && (
            <Paper
              elevation={4}
              sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 1000,
                mt: 0,
                maxHeight: 280,
                overflow: 'auto',
              }}
            >
              <List dense disablePadding>
                {headFiltered.map((opt) => (
                  <ListItem key={opt.value} disablePadding>
                    <ListItemButton
                      onClick={() => handleHeadSelect(opt)}
                      sx={{
                        py: 1,
                        px: 1.5,
                        '&:hover': { bgcolor: alpha(BC_ACCENT, 0.08) },
                      }}
                    >
                      <ListItemText
                        primary={opt.label}
                        primaryTypographyProps={{ fontSize: '0.84rem', noWrap: true }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Box>
        {/* Render the helperText outside the relative wrapper so the popover
            can anchor to the input itself. The wrapping Box keeps the
            helperText vertically positioned where MUI would have placed it
            (~0.5rem below the input), reserving a stable row so the dialog
            layout doesn't shift between error / no-error states. */}
        <Typography
          variant='caption'
          sx={{
            color: headError ? '#d32f2f' : 'transparent',
            fontSize: '0.75rem',
            mt: 0.5,
            ml: 1.75,
            display: 'block',
            minHeight: '1em',
            lineHeight: 1.66,
          }}
        >
          {headError || ' '}
        </Typography>
      </Box>

      {/* Internal note — optional */}
      <Box>
        <Box
          onBlur={() => setTouched((t) => ({ ...t, internalNote: true }))}
          sx={{ borderRadius: 1 }}
        >
          <RichTextEditor
            value={parseRichText(form.internalNote ?? '')}
            onChange={(value) =>
              updateForm((f) => ({
                ...f,
                internalNote: serializeRichText(value.segments),
              }))
            }
            showFooterActions={false}
            title='Internal note'
          />
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ fontSize: '0.7rem', mt: 0.5, display: 'block' }}
          >
            {' '}
          </Typography>
        </Box>
      </Box>
    </ConfigFormDialog>
  );
};

export default BusinessCategoryFormDialog;
