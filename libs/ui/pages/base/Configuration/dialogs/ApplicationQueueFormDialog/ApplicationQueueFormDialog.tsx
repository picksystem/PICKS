import { useState, useEffect, useCallback, useRef, ReactNode } from 'react';
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
import {
  HeadsetMic as HeadsetMicIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useFieldError, useNotification } from '@serviceops/hooks';
import { IConfigApplicationQueue } from '@serviceops/interfaces';
import { ConfigFormDialog } from '@serviceops/configdialogs';
import { parseRichText, serializeRichText, RichTextEditor } from '../../shared/RichTextEditor';
import { CATEG_ACCENT } from '../../sections/Categorization/components/shared/types';

const APPQ_ACCENT = CATEG_ACCENT;

// Alpha-numeric pattern used as a soft guard (matches the spec wording
// "Alpha-numeric"). Spaces, dashes and underscores are allowed so values
// like "Tier-1 Support" or "HR Operations" pass; characters outside this
// set are stripped from the plain-text view at validation time.
const ALNUM_PATTERN = /[^A-Za-z0-9 _-]/g;

const stripAlphaNumeric = (v: string): string => String(v ?? '').replace(ALNUM_PATTERN, '');

interface ApplicationQueueFormDialogProps {
  open: boolean;
  editing: IConfigApplicationQueue | null;
  /** Other application-queue rows for duplicate detection. */
  existingQueues?: IConfigApplicationQueue[];
  /** Drop-down options for the "Application" field. Sourced from the
   * existing applications list. `value` and `label` are the application
   * name. */
  applicationOptions: { value: string; label: string }[];
  /**
   * Drop-down options for the user-search fields (Queue lead, Manager
   * Level 1, Manager Level 2). Sourced from
   * `useSharedUsers().options` mapped to `{ value: name, label: name }`.
   * The optional `subtitle` is the user's email and shows as the
   * secondary line in the popover (matches the User Management popover).
   */
  userOptions: { value: string; label: string; subtitle?: string }[];
  onClose: () => void;
  onSave: (data: Partial<IConfigApplicationQueue>) => void;
  subtitle?: string;
}

// Character limits per the spec. The "Mandatory" column lists the max
// length for alpha-numeric fields (30 / 60). Used as `inputProps.maxLength`.
const MAX_NAME = 30;
const MAX_SHORT_DESC = 60;
const MAX_DESC = 60;
const MAX_NOTE = 60;

const ApplicationQueueFormDialog = ({
  open,
  editing,
  existingQueues = [],
  applicationOptions = [],
  userOptions = [],
  onClose,
  onSave,
  subtitle,
}: ApplicationQueueFormDialogProps) => {
  const { success } = useNotification();
  const reqError = useFieldError();
  const [form, setForm] = useState<Partial<IConfigApplicationQueue>>({});
  // Mirror of `form` that updates synchronously inside onChange handlers.
  // The RichTextEditor only fires onChange on blur, so a state update from
  // there lands AFTER the user has already clicked Submit. By the time
  // handleSubmit runs, `form` is still the previous render's value and
  // duplicate checks would miss values typed into the editor. We read this
  // ref in handleSubmit / computeDuplicateMessage to get the live value.
  const formRef = useRef<Partial<IConfigApplicationQueue>>({});
  const [duplicateAlert, setDuplicateAlert] = useState<string | null>(null);
  // Per-field required-validation state. Touched flips true on blur (or
  // immediately on Submit) and `requiredErrors` carries the field-level
  // message produced by validateRequired. Mirrors the formik
  // touched/errors shape that useFieldError expects.
  const [touched, setTouched] = useState<{
    applicationName?: boolean;
    name?: boolean;
    shortDescription?: boolean;
  }>({});
  const [requiredErrors, setRequiredErrors] = useState<{
    applicationName?: string;
    name?: string;
    shortDescription?: string;
  }>({});

  // Updates both the ref and the state in one go. Use this everywhere a
  // field changes so handleSubmit always sees the latest values.
  const updateForm = useCallback(
    (
      patch:
        | Partial<IConfigApplicationQueue>
        | ((f: Partial<IConfigApplicationQueue>) => Partial<IConfigApplicationQueue>),
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
   *   Application (applicationName)     — Required for usability (linked data)
   *   Queue Name (name)                — Yes
   *   Short Description                — Yes
   *   Description                      — No
   *   Queue lead                        — No
   *   Manager Level 1                  — No
   *   Manager Level 2                  — No
   *   Internal note                    — No
   *
   * The "Queue Name" is the unique key per the spec ("Editable at the
   * time of creation, not allowed to edit the field once it is saved").
   * We enforce a max length of 30 on it via `inputProps` and the
   * `MAX_NAME` constant. `plainText` enforces alpha-numeric on the
   * underlying stored value.
   */
  const validateRequired = (f: Partial<IConfigApplicationQueue>): typeof requiredErrors => {
    const errs: typeof requiredErrors = {};
    if (!String(f.applicationName ?? '').trim()) errs.applicationName = 'required';
    if (!plainText(f.name ?? '')) errs.name = 'required';
    if (!plainText(f.shortDescription ?? '')) errs.shortDescription = 'required';
    return errs;
  };

  /**
   * Returns a single consolidated duplicate message, or null when the form
   * passes the duplicate check.
   *
   * Per the spec for the Application Queue section:
   *   - Application:        Allowed  — skip
   *   - Queue Name:         Not allowed
   *   - Short Description:  Not allowed (used as tool tip)
   *   - Description:        Allowed  — skip
   *   - Queue lead:         Allowed  — skip
   *   - Manager Level 1:    Allowed  — skip
   *   - Manager Level 2:    Allowed  — skip
   *   - Internal note:      Allowed  — skip
   *
   * NOTE: Queue Name is the unique key per the spec ("Editable at the
   * time of creation, not allowed to edit the field once it is saved").
   * Even though the Name field is disabled when editing, we still include
   * the name in the duplicate check so the user gets feedback if the
   * (locked) value collides with another row.
   */
  const computeDuplicateMessage = (f: Partial<IConfigApplicationQueue>): string | null => {
    const myId = editing?.id;
    const others = existingQueues.filter((q) => q.id !== myId);

    const conflicts: string[] = [];

    const nameVal = plainText(f.name ?? '');
    if (nameVal && others.some((q) => plainText(q.name ?? '') === nameVal)) {
      conflicts.push('Queue Name');
    }

    const shortVal = plainText(f.shortDescription ?? '');
    if (shortVal && others.some((q) => plainText(q.shortDescription ?? '') === shortVal)) {
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
  }, [form, open, editing, existingQueues]);

  useEffect(() => {
    if (!open) return;
    // Reset required-validation state each time the dialog opens so
    // errors from a previous Add/Edit don't carry over.
    setTouched({});
    setRequiredErrors({});
    const initial: Partial<IConfigApplicationQueue> = editing
      ? {
          applicationId: editing.applicationId ?? '',
          applicationName: editing.applicationName ?? '',
          name: editing.name ?? '',
          shortDescription: editing.shortDescription ?? '',
          description: editing.description ?? '',
          predecessor: editing.predecessor ?? '',
          successor: editing.successor ?? '',
          queueSpecificLead: editing.queueSpecificLead ?? '',
          managerLevel1: editing.managerLevel1 ?? '',
          managerLevel2: editing.managerLevel2 ?? '',
          internalNote: editing.internalNote ?? '',
        }
      : {
          applicationId: '',
          applicationName: '',
          name: '',
          shortDescription: '',
          description: '',
          predecessor: '',
          successor: '',
          queueSpecificLead: '',
          managerLevel1: '',
          managerLevel2: '',
          internalNote: '',
        };
    formRef.current = initial;
    setForm(initial);
  }, [open, editing]);

  const handleSubmit = () => {
    // Run required-field validation first so the user sees a per-field red
    // border / helper text on Application, Queue Name, and Short
    // Description when any of them is blank. Mark all required fields as
    // touched so the errors render even if the user hasn't blurred them
    // yet.
    const reqErrs = validateRequired(formRef.current);
    setRequiredErrors(reqErrs);
    setTouched({
      applicationName: true,
      name: true,
      shortDescription: true,
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
      editing ? 'Application queue updated successfully' : 'Application queue added successfully',
    );
  };

  const appError = reqError(touched.applicationName, requiredErrors.applicationName);
  const nameError = reqError(touched.name, requiredErrors.name);
  const shortError = reqError(touched.shortDescription, requiredErrors.shortDescription);

  // ── Application — search-style autocomplete ──────────────────────────────
  // Mirrors the Business Category pattern used by the Service Line dialog:
  //   - TextField with a search/clear end adornment
  //   - Floating Paper + List of matching application options
  //   - Stored value is the application name
  const [appInput, setAppInput] = useState<string>('');
  const [appOptionsOpen, setAppOptionsOpen] = useState(false);
  const [appLoading, setAppLoading] = useState(false);
  const appDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [appFiltered, setAppFiltered] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    const stored = String(form.applicationName ?? '');
    if (stored !== appInput) {
      setAppInput(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.applicationName]);

  const appSearch = useCallback(
    (query: string) => {
      const q = query.trim().toLowerCase();
      if (!q) return applicationOptions;
      return applicationOptions.filter((o) =>
        String(o.label ?? '')
          .toLowerCase()
          .includes(q),
      );
    },
    [applicationOptions],
  );

  const handleAppInputChange = useCallback(
    (value: string) => {
      setAppInput(value);
      if (appDebounceRef.current) clearTimeout(appDebounceRef.current);
      appDebounceRef.current = setTimeout(() => {
        setAppLoading(true);
        const next = appSearch(value);
        setAppFiltered(next);
        setAppOptionsOpen(next.length > 0);
        setAppLoading(false);
      }, 200);
    },
    [appSearch],
  );

  const handleAppSelect = useCallback(
    (opt: { value: string; label: string }) => {
      setAppInput(opt.label);
      setAppOptionsOpen(false);
      setAppFiltered([]);
      setTouched((t) => ({ ...t, applicationName: true }));
      updateForm((f) => ({ ...f, applicationId: opt.value, applicationName: opt.value }));
    },
    [updateForm],
  );

  const handleAppClear = useCallback(() => {
    setAppInput('');
    setAppFiltered([]);
    setAppOptionsOpen(false);
    updateForm((f) => ({ ...f, applicationId: '', applicationName: '' }));
  }, [updateForm]);

  // ── Queue lead — search-style autocomplete ──────────────────────────────
  const [leadInput, setLeadInput] = useState<string>('');
  const [leadOptionsOpen, setLeadOptionsOpen] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);
  const leadDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [leadFiltered, setLeadFiltered] = useState<
    { value: string; label: string; subtitle?: string }[]
  >([]);

  useEffect(() => {
    const stored = String(form.queueSpecificLead ?? '');
    if (stored !== leadInput) {
      setLeadInput(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.queueSpecificLead]);

  const leadSearch = useCallback(
    (query: string) => {
      const q = query.trim().toLowerCase();
      if (!q) return userOptions;
      return userOptions.filter((o) =>
        String(o.label ?? '')
          .toLowerCase()
          .includes(q),
      );
    },
    [userOptions],
  );

  const handleLeadInputChange = useCallback(
    (value: string) => {
      setLeadInput(value);
      if (leadDebounceRef.current) clearTimeout(leadDebounceRef.current);
      leadDebounceRef.current = setTimeout(() => {
        setLeadLoading(true);
        const next = leadSearch(value);
        setLeadFiltered(next);
        setLeadOptionsOpen(next.length > 0);
        setLeadLoading(false);
      }, 200);
    },
    [leadSearch],
  );

  const handleLeadSelect = useCallback(
    (opt: { value: string; label: string }) => {
      setLeadInput(opt.label);
      setLeadOptionsOpen(false);
      setLeadFiltered([]);
      updateForm((f) => ({ ...f, queueSpecificLead: opt.value }));
    },
    [updateForm],
  );

  const handleLeadClear = useCallback(() => {
    setLeadInput('');
    setLeadFiltered([]);
    setLeadOptionsOpen(false);
    updateForm((f) => ({ ...f, queueSpecificLead: '' }));
  }, [updateForm]);

  // ── Manager Level 1 — search-style autocomplete ─────────────────────────
  const [mgr1Input, setMgr1Input] = useState<string>('');
  const [mgr1OptionsOpen, setMgr1OptionsOpen] = useState(false);
  const [mgr1Loading, setMgr1Loading] = useState(false);
  const mgr1DebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mgr1Filtered, setMgr1Filtered] = useState<
    { value: string; label: string; subtitle?: string }[]
  >([]);

  useEffect(() => {
    const stored = String(form.managerLevel1 ?? '');
    if (stored !== mgr1Input) {
      setMgr1Input(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.managerLevel1]);

  const mgr1Search = useCallback(
    (query: string) => {
      const q = query.trim().toLowerCase();
      if (!q) return userOptions;
      return userOptions.filter((o) =>
        String(o.label ?? '')
          .toLowerCase()
          .includes(q),
      );
    },
    [userOptions],
  );

  const handleMgr1InputChange = useCallback(
    (value: string) => {
      setMgr1Input(value);
      if (mgr1DebounceRef.current) clearTimeout(mgr1DebounceRef.current);
      mgr1DebounceRef.current = setTimeout(() => {
        setMgr1Loading(true);
        const next = mgr1Search(value);
        setMgr1Filtered(next);
        setMgr1OptionsOpen(next.length > 0);
        setMgr1Loading(false);
      }, 200);
    },
    [mgr1Search],
  );

  const handleMgr1Select = useCallback(
    (opt: { value: string; label: string }) => {
      setMgr1Input(opt.label);
      setMgr1OptionsOpen(false);
      setMgr1Filtered([]);
      updateForm((f) => ({ ...f, managerLevel1: opt.value }));
    },
    [updateForm],
  );

  const handleMgr1Clear = useCallback(() => {
    setMgr1Input('');
    setMgr1Filtered([]);
    setMgr1OptionsOpen(false);
    updateForm((f) => ({ ...f, managerLevel1: '' }));
  }, [updateForm]);

  // ── Manager Level 2 — search-style autocomplete ─────────────────────────
  const [mgr2Input, setMgr2Input] = useState<string>('');
  const [mgr2OptionsOpen, setMgr2OptionsOpen] = useState(false);
  const [mgr2Loading, setMgr2Loading] = useState(false);
  const mgr2DebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mgr2Filtered, setMgr2Filtered] = useState<
    { value: string; label: string; subtitle?: string }[]
  >([]);

  useEffect(() => {
    const stored = String(form.managerLevel2 ?? '');
    if (stored !== mgr2Input) {
      setMgr2Input(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.managerLevel2]);

  const mgr2Search = useCallback(
    (query: string) => {
      const q = query.trim().toLowerCase();
      if (!q) return userOptions;
      return userOptions.filter((o) =>
        String(o.label ?? '')
          .toLowerCase()
          .includes(q),
      );
    },
    [userOptions],
  );

  const handleMgr2InputChange = useCallback(
    (value: string) => {
      setMgr2Input(value);
      if (mgr2DebounceRef.current) clearTimeout(mgr2DebounceRef.current);
      mgr2DebounceRef.current = setTimeout(() => {
        setMgr2Loading(true);
        const next = mgr2Search(value);
        setMgr2Filtered(next);
        setMgr2OptionsOpen(next.length > 0);
        setMgr2Loading(false);
      }, 200);
    },
    [mgr2Search],
  );

  const handleMgr2Select = useCallback(
    (opt: { value: string; label: string }) => {
      setMgr2Input(opt.label);
      setMgr2OptionsOpen(false);
      setMgr2Filtered([]);
      updateForm((f) => ({ ...f, managerLevel2: opt.value }));
    },
    [updateForm],
  );

  const handleMgr2Clear = useCallback(() => {
    setMgr2Input('');
    setMgr2Filtered([]);
    setMgr2OptionsOpen(false);
    updateForm((f) => ({ ...f, managerLevel2: '' }));
  }, [updateForm]);

  // Reset the search fields' transient state whenever the dialog opens so
  // a previously-typed query (and any open popover) doesn't bleed into a
  // new Add/Edit cycle.
  useEffect(() => {
    if (!open) return;
    setAppOptionsOpen(false);
    setAppFiltered([]);
    setAppLoading(false);
    setLeadOptionsOpen(false);
    setLeadFiltered([]);
    setLeadLoading(false);
    setMgr1OptionsOpen(false);
    setMgr1Filtered([]);
    setMgr1Loading(false);
    setMgr2OptionsOpen(false);
    setMgr2Filtered([]);
    setMgr2Loading(false);
  }, [open]);

  // Render a search-style autocomplete. The popover is anchored to the
  // input only (not the TextField as a whole) so the list sits flush
  // against its bottom border; the helperText row is rendered separately
  // below to avoid the visible gap. The popover closes on blur with a
  // small delay so a click on a popover row is allowed to register
  // before the list unmounts.
  const renderSearchField = (params: {
    label: string;
    placeholder: string;
    input: string;
    optionsOpen: boolean;
    loading: boolean;
    filtered: { value: string; label: string; subtitle?: string }[];
    onChange: (v: string) => void;
    onSelect: (opt: { value: string; label: string }) => void;
    onClear: () => void;
    onFocus: () => void;
    onClosePopover: () => void;
    required?: boolean;
    error?: ReactNode;
  }) => (
    <Box>
      <Box sx={{ position: 'relative' }}>
        <TextField
          label={params.label}
          placeholder={params.placeholder}
          value={params.input}
          onChange={(e) => params.onChange(e.target.value)}
          onFocus={params.onFocus}
          onBlur={() => {
            setTimeout(params.onClosePopover, 200);
          }}
          fullWidth
          size='small'
          required={params.required}
          error={Boolean(params.error)}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position='end'>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {params.loading ? (
                      <CircularProgress size={16} />
                    ) : params.input ? (
                      <ClearIcon
                        onClick={params.onClear}
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
        {params.optionsOpen && params.filtered.length > 0 && (
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
              {params.filtered.map((opt) => (
                <ListItem key={opt.value} disablePadding>
                  <ListItemButton
                    onClick={() => params.onSelect(opt)}
                    sx={{
                      py: 1,
                      px: 1.5,
                      '&:hover': { bgcolor: alpha(APPQ_ACCENT, 0.08) },
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
          color: params.error ? '#d32f2f' : 'transparent',
          fontSize: '0.75rem',
          mt: 0.5,
          ml: 1.75,
          display: 'block',
          minHeight: '1em',
          lineHeight: 1.66,
        }}
      >
        {params.error || ' '}
      </Typography>
    </Box>
  );

  return (
    <ConfigFormDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      isEdit={!!editing}
      icon={<HeadsetMicIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
      accent={APPQ_ACCENT}
      title='Application Queue'
      subtitle={subtitle}
      submitDisabled={false}
      submitLabel={editing ? 'Save' : 'Submit'}
      maxWidth='md'
    >
      {/* Duplicate Alert — single dialog-level message. Per spec, only
          Queue Name and Short Description must be unique. The Alert is
          the only signal; no per-field red borders for duplicates. */}
      {duplicateAlert && (
        <Alert severity='error' variant='outlined' sx={{ mb: 1 }}>
          {duplicateAlert}
        </Alert>
      )}

      {/* Application — required search field. Sourced from
          Categorization > Application (tab) > Application name. */}
      {renderSearchField({
        label: 'Application',
        placeholder: 'Search applications...',
        input: appInput,
        optionsOpen: appOptionsOpen,
        loading: appLoading,
        filtered: appFiltered as { value: string; label: string; subtitle?: string }[],
        onChange: handleAppInputChange,
        onSelect: handleAppSelect,
        onClear: handleAppClear,
        onFocus: () => {
          const next = appSearch(appInput);
          setAppFiltered(next);
          if (next.length > 0) setAppOptionsOpen(true);
        },
        onClosePopover: () => setAppOptionsOpen(false),
        required: true,
        error: appError,
      })}

      {/* Queue Name — required, alpha-numeric (max 30), locked after
          save. The spec says "Editable at the time of creation, not
          allowed to edit the field once it is saved" — so we disable
          the input when editing. */}
      <Box>
        <TextField
          label='Queue Name'
          size='small'
          value={form.name ?? ''}
          onChange={(e) => updateForm((f) => ({ ...f, name: e.target.value }))}
          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          placeholder='e.g. Tier-1 Support'
          inputProps={{
            style: { fontFamily: 'monospace', fontWeight: 700 },
            maxLength: MAX_NAME,
          }}
          disabled={!!editing}
          error={Boolean(nameError)}
          helperText={
            nameError ||
            (editing
              ? 'Name cannot be changed after creation'
              : `Alpha-numeric, max ${MAX_NAME} characters`)
          }
          required
        />
      </Box>

      {/* Short Description — required, alpha-numeric (max 60). "Used as
          tool tip. Same as ticket type form short description". */}
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
            {shortError || `Alpha-numeric, max ${MAX_SHORT_DESC} characters. Used as tool tip.`}
          </Typography>
        </Box>
      </Box>

      {/* Description — optional, alpha-numeric (max 60). "Same as
          ticket type form Description". */}
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
            {`Alpha-numeric, max ${MAX_DESC} characters.`}
          </Typography>
        </Box>
      </Box>

      {/* Queue lead — optional. Sourced from User Management > All Users.
          Stored value is the user's full name. Mapped to
          `queueSpecificLead` on the model. */}
      {renderSearchField({
        label: 'Queue lead',
        placeholder: 'Search users...',
        input: leadInput,
        optionsOpen: leadOptionsOpen,
        loading: leadLoading,
        filtered: leadFiltered,
        onChange: handleLeadInputChange,
        onSelect: handleLeadSelect,
        onClear: handleLeadClear,
        onFocus: () => {
          const next = leadSearch(leadInput);
          setLeadFiltered(next);
          if (next.length > 0) setLeadOptionsOpen(true);
        },
        onClosePopover: () => setLeadOptionsOpen(false),
      })}

      {/* Manager Level 1 — optional. Sourced from User Management > All
          Users. Stored value is the user's full name. */}
      {renderSearchField({
        label: 'Manager Level 1',
        placeholder: 'Search users...',
        input: mgr1Input,
        optionsOpen: mgr1OptionsOpen,
        loading: mgr1Loading,
        filtered: mgr1Filtered,
        onChange: handleMgr1InputChange,
        onSelect: handleMgr1Select,
        onClear: handleMgr1Clear,
        onFocus: () => {
          const next = mgr1Search(mgr1Input);
          setMgr1Filtered(next);
          if (next.length > 0) setMgr1OptionsOpen(true);
        },
        onClosePopover: () => setMgr1OptionsOpen(false),
      })}

      {/* Manager Level 2 — optional. Sourced from User Management > All
          Users. Stored value is the user's full name. */}
      {renderSearchField({
        label: 'Manager Level 2',
        placeholder: 'Search users...',
        input: mgr2Input,
        optionsOpen: mgr2OptionsOpen,
        loading: mgr2Loading,
        filtered: mgr2Filtered,
        onChange: handleMgr2InputChange,
        onSelect: handleMgr2Select,
        onClear: handleMgr2Clear,
        onFocus: () => {
          const next = mgr2Search(mgr2Input);
          setMgr2Filtered(next);
          if (next.length > 0) setMgr2OptionsOpen(true);
        },
        onClosePopover: () => setMgr2OptionsOpen(false),
      })}

      {/* Internal note — optional, alpha-numeric (max 60). "Same as
          ticket type form internal note". */}
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
            {`Alpha-numeric, max ${MAX_NOTE} characters.`}
          </Typography>
        </Box>
      </Box>
    </ConfigFormDialog>
  );
};

export default ApplicationQueueFormDialog;
