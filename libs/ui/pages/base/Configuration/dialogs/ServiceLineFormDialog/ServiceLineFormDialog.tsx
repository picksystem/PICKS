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
import { LinearScale, Clear as ClearIcon, Search as SearchIcon } from '@mui/icons-material';
import { useFieldError, useNotification } from '@serviceops/hooks';
import { IConfigServiceLine } from '@serviceops/interfaces';
import { ConfigFormDialog } from '@serviceops/configdialogs';
import { parseRichText, serializeRichText, RichTextEditor } from '../../shared/RichTextEditor';
import { CATEG_ACCENT } from '../../sections/Categorization/components/shared/types';

const SL_ACCENT = CATEG_ACCENT;

// Alpha-numeric pattern used as a soft guard (matches the spec wording
// "Alpha-numeric"). Spaces, dashes and underscores are allowed so values
// like "HR Operations" or "Finance-1" pass; characters outside this set
// are stripped from the plain-text view at validation time.
const ALNUM_PATTERN = /[^A-Za-z0-9 _-]/g;

const stripAlphaNumeric = (v: string): string => String(v ?? '').replace(ALNUM_PATTERN, '');

interface ServiceLineFormDialogProps {
  open: boolean;
  editing: IConfigServiceLine | null;
  /** Other service-line rows for duplicate detection. */
  existingServiceLines?: IConfigServiceLine[];
  /** Drop-down options for the "Business Category" field. */
  businessCategoryOptions: { value: string; label: string }[];
  /**
   * Drop-down options for the "Service line manager" field. Sourced from
   * `useSharedUsers().options` mapped to `{ value: name, label: name }`.
   * The optional `subtitle` is the user's email and shows as the secondary
   * line in the popover (matches the User Management popover).
   */
  managerOptions: { value: string; label: string; subtitle?: string }[];
  onClose: () => void;
  onSave: (data: Partial<IConfigServiceLine>) => void;
  subtitle?: string;
}

const ServiceLineFormDialog = ({
  open,
  editing,
  existingServiceLines = [],
  businessCategoryOptions = [],
  managerOptions = [],
  onClose,
  onSave,
  subtitle,
}: ServiceLineFormDialogProps) => {
  const { success } = useNotification();
  const reqError = useFieldError();
  const [form, setForm] = useState<Partial<IConfigServiceLine>>({});
  // Mirror of `form` that updates synchronously inside onChange handlers.
  // The RichTextEditor only fires onChange on blur, so a state update from
  // there lands AFTER the user has already clicked Submit. By the time
  // handleSubmit runs, `form` is still the previous render's value and
  // duplicate checks would miss values typed into the editor. We read this
  // ref in handleSubmit / computeDuplicateMessage to get the live value.
  const formRef = useRef<Partial<IConfigServiceLine>>({});
  const [duplicateAlert, setDuplicateAlert] = useState<string | null>(null);
  // Per-field required-validation state. Touched flips true on blur (or
  // immediately on Submit) and `requiredErrors` carries the field-level
  // message produced by validateRequired. Mirrors the formik
  // touched/errors shape that useFieldError expects.
  const [touched, setTouched] = useState<{
    businessCategoryName?: boolean;
    name?: boolean;
    shortDescription?: boolean;
    manager?: boolean;
  }>({});
  const [requiredErrors, setRequiredErrors] = useState<{
    businessCategoryName?: string;
    name?: string;
    shortDescription?: string;
    manager?: string;
  }>({});

  // Updates both the ref and the state in one go. Use this everywhere a
  // field changes so handleSubmit always sees the latest values.
  const updateForm = useCallback(
    (
      patch:
        | Partial<IConfigServiceLine>
        | ((f: Partial<IConfigServiceLine>) => Partial<IConfigServiceLine>),
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
   *   Business Category (businessCategoryName) — Yes
   *   Service Line Name (name)                 — Yes
   *   Short Description                       — Yes
   *   Description                             — No
   *   Service line manager (manager)          — Yes
   *   Internal note                           — No
   */
  const validateRequired = (f: Partial<IConfigServiceLine>): typeof requiredErrors => {
    const errs: typeof requiredErrors = {};
    if (!String(f.businessCategoryName ?? '').trim()) errs.businessCategoryName = 'required';
    if (!String(f.name ?? '').trim()) errs.name = 'required';
    if (!plainText(f.shortDescription ?? '')) errs.shortDescription = 'required';
    if (!String(f.manager ?? '').trim()) errs.manager = 'required';
    return errs;
  };

  /**
   * Returns a single consolidated duplicate message, or null when the form
   * passes the duplicate check.
   *
   * Per the spec for the Service Line section:
   *   - Business Category:      Allowed  — skip
   *   - Service Line Name:      Not allowed
   *   - Short Description:      Not allowed
   *   - Description:            Allowed  — skip
   *   - Service line manager:   Allowed  — skip
   *   - Internal note:          Allowed  — skip
   *
   * NOTE: Service Line Name is the unique key per the spec ("Editable at
   * the time of creation, not allowed to edit the field once it is saved").
   * Even though the Name field is disabled when editing, we still include
   * the name in the duplicate check so the user gets feedback if the
   * (locked) value collides with another row.
   */
  const computeDuplicateMessage = (f: Partial<IConfigServiceLine>): string | null => {
    const myId = editing?.id;
    const others = existingServiceLines.filter((sl) => sl.id !== myId);

    const conflicts: string[] = [];

    const nameVal = plainText(f.name ?? '');
    if (nameVal && others.some((sl) => plainText(sl.name ?? '') === nameVal)) {
      conflicts.push('Service Line Name');
    }

    const shortVal = plainText(f.shortDescription ?? '');
    if (shortVal && others.some((sl) => plainText(sl.shortDescription ?? '') === shortVal)) {
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
  }, [form, open, editing, existingServiceLines]);

  useEffect(() => {
    if (!open) return;
    // Reset required-validation state each time the dialog opens so
    // errors from a previous Add/Edit don't carry over.
    setTouched({});
    setRequiredErrors({});
    const initial: Partial<IConfigServiceLine> = editing
      ? {
          businessCategoryName: editing.businessCategoryName ?? '',
          name: editing.name ?? '',
          shortDescription: editing.shortDescription ?? '',
          description: editing.description ?? '',
          manager: editing.manager ?? '',
          internalNote: editing.internalNote ?? '',
        }
      : {
          businessCategoryName: '',
          name: '',
          shortDescription: '',
          description: '',
          manager: '',
          internalNote: '',
        };
    formRef.current = initial;
    setForm(initial);
  }, [open, editing]);

  const handleSubmit = () => {
    // Run required-field validation first so the user sees a per-field red
    // border / helper text on Business Category, Service Line Name, Short
    // Description, and Manager when any of them is blank. Mark all
    // required fields as touched so the errors render even if the user
    // hasn't blurred them yet.
    const reqErrs = validateRequired(formRef.current);
    setRequiredErrors(reqErrs);
    setTouched({
      businessCategoryName: true,
      name: true,
      shortDescription: true,
      manager: true,
    });
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
      editing ? 'Service line updated successfully' : 'Service line added successfully',
    );
  };

  const bcError = reqError(touched.businessCategoryName, requiredErrors.businessCategoryName);
  const nameError = reqError(touched.name, requiredErrors.name);
  const shortError = reqError(touched.shortDescription, requiredErrors.shortDescription);
  const managerError = reqError(touched.manager, requiredErrors.manager);

  // ── Business Category — search-style autocomplete ───────────────────────
  // Mirrors the head pattern used by the Business Category dialog:
  //   - TextField with a search/clear end adornment
  //   - Floating Paper + List of matching business-category options
  //   - Stored value is the business-category name
  // `bcInput` mirrors `form.businessCategoryName` while typing; it stays in
  // sync when the stored value changes (e.g. when editing opens with a
  // pre-filled business category).
  const [bcInput, setBcInput] = useState<string>('');
  const [bcOptionsOpen, setBcOptionsOpen] = useState(false);
  const [bcLoading, setBcLoading] = useState(false);
  const bcDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stored = String(form.businessCategoryName ?? '');
    if (stored !== bcInput) {
      setBcInput(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.businessCategoryName]);

  const bcSearch = useCallback(
    (query: string) => {
      const q = query.trim().toLowerCase();
      if (!q) return businessCategoryOptions;
      return businessCategoryOptions.filter((o) =>
        String(o.label ?? '')
          .toLowerCase()
          .includes(q),
      );
    },
    [businessCategoryOptions],
  );

  const [bcFiltered, setBcFiltered] = useState<{ value: string; label: string }[]>([]);

  const handleBcInputChange = useCallback(
    (value: string) => {
      setBcInput(value);
      if (bcDebounceRef.current) clearTimeout(bcDebounceRef.current);
      bcDebounceRef.current = setTimeout(() => {
        setBcLoading(true);
        const next = bcSearch(value);
        setBcFiltered(next);
        setBcOptionsOpen(next.length > 0);
        setBcLoading(false);
      }, 200);
    },
    [bcSearch],
  );

  const handleBcSelect = useCallback(
    (opt: { value: string; label: string }) => {
      setBcInput(opt.label);
      setBcOptionsOpen(false);
      setBcFiltered([]);
      setTouched((t) => ({ ...t, businessCategoryName: true }));
      updateForm((f) => ({ ...f, businessCategoryName: opt.value }));
    },
    [updateForm],
  );

  const handleBcClear = useCallback(() => {
    setBcInput('');
    setBcFiltered([]);
    setBcOptionsOpen(false);
    updateForm((f) => ({ ...f, businessCategoryName: '' }));
  }, [updateForm]);

  // ── Service line manager — search-style autocomplete ────────────────────
  // Same pattern as the Business Category Head field. Stored value is the
  // user's full name (firstName + " " + lastName) so the table can render
  // the name directly via the default `mkCell` renderer.
  const [managerInput, setManagerInput] = useState<string>('');
  const [managerOptionsOpen, setManagerOptionsOpen] = useState(false);
  const [managerLoading, setManagerLoading] = useState(false);
  const managerDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stored = String(form.manager ?? '');
    if (stored !== managerInput) {
      setManagerInput(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.manager]);

  const managerSearch = useCallback(
    (query: string) => {
      const q = query.trim().toLowerCase();
      if (!q) return managerOptions;
      return managerOptions.filter((o) =>
        String(o.label ?? '')
          .toLowerCase()
          .includes(q),
      );
    },
    [managerOptions],
  );

  const [managerFiltered, setManagerFiltered] = useState<
    { value: string; label: string; subtitle?: string }[]
  >([]);

  const handleManagerInputChange = useCallback(
    (value: string) => {
      setManagerInput(value);
      if (managerDebounceRef.current) clearTimeout(managerDebounceRef.current);
      managerDebounceRef.current = setTimeout(() => {
        setManagerLoading(true);
        const next = managerSearch(value);
        setManagerFiltered(next);
        setManagerOptionsOpen(next.length > 0);
        setManagerLoading(false);
      }, 200);
    },
    [managerSearch],
  );

  const handleManagerSelect = useCallback(
    (opt: { value: string; label: string; subtitle?: string }) => {
      setManagerInput(opt.label);
      setManagerOptionsOpen(false);
      setManagerFiltered([]);
      setTouched((t) => ({ ...t, manager: true }));
      updateForm((f) => ({ ...f, manager: opt.value }));
    },
    [updateForm],
  );

  const handleManagerClear = useCallback(() => {
    setManagerInput('');
    setManagerFiltered([]);
    setManagerOptionsOpen(false);
    updateForm((f) => ({ ...f, manager: '' }));
  }, [updateForm]);

  // Reset the search fields' transient state whenever the dialog opens so
  // a previously-typed query (and any open popover) doesn't bleed into a
  // new Add/Edit cycle.
  useEffect(() => {
    if (open) {
      setBcOptionsOpen(false);
      setBcFiltered([]);
      setBcLoading(false);
      setManagerOptionsOpen(false);
      setManagerFiltered([]);
      setManagerLoading(false);
    }
  }, [open]);

  return (
    <ConfigFormDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      isEdit={!!editing}
      icon={<LinearScale sx={{ color: '#fff', fontSize: '1.1rem' }} />}
      accent={SL_ACCENT}
      title='Service Line'
      subtitle={subtitle}
      submitDisabled={false}
      submitLabel={editing ? 'Save' : 'Submit'}
      maxWidth='md'
    >
      {/* Duplicate Alert — single dialog-level message. Per spec, only
          Service Line Name and Short Description must be unique. The Alert
          is the only signal; no per-field red borders for duplicates. */}
      {duplicateAlert && (
        <Alert severity='error' variant='outlined' sx={{ mb: 1 }}>
          {duplicateAlert}
        </Alert>
      )}

      {/* Business Category — required search field. Popover anchored to
          the input only so the list sits flush against its bottom border;
          helper text is rendered separately below to avoid the visible
          gap the user reported. */}
      <Box>
        <Box sx={{ position: 'relative' }}>
          <TextField
            label='Business Category'
            placeholder='Search business categories...'
            value={bcInput}
            onChange={(e) => handleBcInputChange(e.target.value)}
            onFocus={() => {
              const next = bcSearch(bcInput);
              setBcFiltered(next);
              if (next.length > 0) setBcOptionsOpen(true);
            }}
            onBlur={() => {
              setTouched((t) => ({ ...t, businessCategoryName: true }));
              setTimeout(() => setBcOptionsOpen(false), 200);
            }}
            fullWidth
            size='small'
            required
            error={Boolean(bcError)}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position='end'>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {bcLoading ? (
                        <CircularProgress size={16} />
                      ) : bcInput ? (
                        <ClearIcon
                          onClick={handleBcClear}
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
          {bcOptionsOpen && bcFiltered.length > 0 && (
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
                {bcFiltered.map((opt) => (
                  <ListItem key={opt.value} disablePadding>
                    <ListItemButton
                      onClick={() => handleBcSelect(opt)}
                      sx={{
                        py: 1,
                        px: 1.5,
                        '&:hover': { bgcolor: alpha(SL_ACCENT, 0.08) },
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
        <Typography
          variant='caption'
          sx={{
            color: bcError ? '#d32f2f' : 'transparent',
            fontSize: '0.75rem',
            mt: 0.5,
            ml: 1.75,
            display: 'block',
            minHeight: '1em',
            lineHeight: 1.66,
          }}
        >
          {bcError || ' '}
        </Typography>
      </Box>

      {/* Service Line Name — required, alpha-numeric, locked after save.
          The spec says "Editable at the time of creation, not allowed to
          edit the field once it is saved" — so we disable the input when
          editing. The plain TextField is also used here (not the rich
          text editor) per the spec. */}
      <Box>
        <TextField
          label='Service Line Name'
          size='small'
          value={form.name ?? ''}
          onChange={(e) => updateForm((f) => ({ ...f, name: e.target.value }))}
          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          placeholder='e.g. HR Operations'
          inputProps={{ style: { fontFamily: 'monospace', fontWeight: 700 } }}
          disabled={!!editing}
          error={Boolean(nameError)}
          helperText={
            nameError || (editing ? 'Name cannot be changed after creation' : ' ')
          }
          required
        />
      </Box>

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

      {/* Service line manager — required search field. Sourced from User
          Management → All Users. Stored value is the user's full name. */}
      <Box>
        <Box sx={{ position: 'relative' }}>
          <TextField
            label='Service line manager'
            placeholder='Search users...'
            value={managerInput}
            onChange={(e) => handleManagerInputChange(e.target.value)}
            onFocus={() => {
              const next = managerSearch(managerInput);
              setManagerFiltered(next);
              if (next.length > 0) setManagerOptionsOpen(true);
            }}
            onBlur={() => {
              setTouched((t) => ({ ...t, manager: true }));
              setTimeout(() => setManagerOptionsOpen(false), 200);
            }}
            fullWidth
            size='small'
            required
            error={Boolean(managerError)}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position='end'>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {managerLoading ? (
                        <CircularProgress size={16} />
                      ) : managerInput ? (
                        <ClearIcon
                          onClick={handleManagerClear}
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
          {managerOptionsOpen && managerFiltered.length > 0 && (
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
                {managerFiltered.map((opt) => (
                  <ListItem key={opt.value} disablePadding>
                    <ListItemButton
                      onClick={() => handleManagerSelect(opt)}
                      sx={{
                        py: 1,
                        px: 1.5,
                        '&:hover': { bgcolor: alpha(SL_ACCENT, 0.08) },
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
        <Typography
          variant='caption'
          sx={{
            color: managerError ? '#d32f2f' : 'transparent',
            fontSize: '0.75rem',
            mt: 0.5,
            ml: 1.75,
            display: 'block',
            minHeight: '1em',
            lineHeight: 1.66,
          }}
        >
          {managerError || ' '}
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

export default ServiceLineFormDialog;
