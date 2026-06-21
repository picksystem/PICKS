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
import {
  Numbers as NumbersIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useFieldError, useNotification } from '@serviceops/hooks';
import { IConfigApplicationNumberSequence, ITicketType } from '@serviceops/interfaces';
import { ConfigFormDialog } from '@serviceops/configdialogs';
import { parseRichText, serializeRichText, RichTextEditor } from '../../shared/RichTextEditor';
import { CATEG_ACCENT } from '../../sections/Categorization/components/shared/types';

const ANS_ACCENT = CATEG_ACCENT;

// Alpha-numeric pattern used as a soft guard (matches the spec wording
// "Alpha-numeric"). Spaces, dashes and underscores are allowed so values
// like "HR Ops" or "Finance-1" pass; characters outside this set are
// stripped from the plain-text view at validation time.
const ALNUM_PATTERN = /[^A-Za-z0-9 _-]/g;

const stripAlphaNumeric = (v: string): string => String(v ?? '').replace(ALNUM_PATTERN, '');

interface ApplicationNumberSequenceFormDialogProps {
  open: boolean;
  editing: IConfigApplicationNumberSequence | null;
  /** Other application-number-sequence rows for duplicate detection
   * within this form. */
  existingSequences?: IConfigApplicationNumberSequence[];
  /** Drop-down options for the "Application" field. Sourced from the
   * existing applications list. `value` and `label` are the application
   * name. */
  applicationOptions: { value: string; label: string }[];
  /** Ticket types list — used to populate the "Ticket type" drop-down
   * AND enforce the cross-form prefix-uniqueness rule. */
  ticketTypes: ITicketType[];
  onClose: () => void;
  onSave: (data: Partial<IConfigApplicationNumberSequence>) => void;
  subtitle?: string;
}

// Character limits per the spec. The "Mandatory" column lists the max
// length for alpha-numeric fields (6 / 60). Used as `inputProps.maxLength`.
const MAX_PREFIX = 6;
const MAX_NOTE = 60;
// Number-length is constrained to digits 3-9 per the spec. The total
// preview length (prefix + number) must reach 15 — the "Mandatory" 15
// cap. Used by both the live preview and validation.
const MIN_NUMBER_LENGTH = 3;
const MAX_NUMBER_LENGTH = 9;
const PREVIEW_TOTAL_LENGTH = 15;

/**
 * Build the read-only preview shown in the "Numbering Preview" field.
 * Mirrors `buildPreview` used by the Ticket Type form so the two forms
 * produce the same format: uppercased prefix + 1 padded to the chosen
 * number-length (e.g. `INC` + length 4 -> `INC0001`).
 */
const buildPreview = (prefix: string, length: number): string => {
  const num = length > 0 ? '1'.padStart(length, '0') : '';
  return `${(prefix ?? '').toUpperCase()}${num}`;
};

const ApplicationNumberSequenceFormDialog = ({
  open,
  editing,
  existingSequences = [],
  applicationOptions = [],
  ticketTypes = [],
  onClose,
  onSave,
  subtitle,
}: ApplicationNumberSequenceFormDialogProps) => {
  const { success } = useNotification();
  const reqError = useFieldError();
  const [form, setForm] = useState<Partial<IConfigApplicationNumberSequence>>({});
  // Mirror of `form` that updates synchronously inside onChange handlers.
  // The RichTextEditor only fires onChange on blur, so a state update
  // from there lands AFTER the user has already clicked Submit. By the
  // time handleSubmit runs, `form` is still the previous render's
  // value and duplicate checks would miss values typed into the editor.
  // We read this ref in handleSubmit / computeDuplicateMessage to get
  // the live value.
  const formRef = useRef<Partial<IConfigApplicationNumberSequence>>({});
  const [duplicateAlert, setDuplicateAlert] = useState<string | null>(null);
  // Per-field required-validation state. Touched flips true on blur (or
  // immediately on Submit) and `requiredErrors` carries the field-level
  // message produced by validateRequired. Mirrors the formik
  // touched/errors shape that useFieldError expects.
  const [touched, setTouched] = useState<{
    applicationName?: boolean;
    ticketTypeId?: boolean;
    numberSequenceCode?: boolean;
    numericCharLength?: boolean;
  }>({});
  const [requiredErrors, setRequiredErrors] = useState<{
    applicationName?: string;
    ticketTypeId?: string;
    numberSequenceCode?: string;
    numericCharLength?: string;
  }>({});

  // Updates both the ref and the state in one go. Use this everywhere
  // a field changes so handleSubmit always sees the latest values.
  const updateForm = useCallback(
    (
      patch:
        | Partial<IConfigApplicationNumberSequence>
        | ((
            f: Partial<IConfigApplicationNumberSequence>,
          ) => Partial<IConfigApplicationNumberSequence>),
    ) => {
      formRef.current =
        typeof patch === 'function' ? patch(formRef.current) : { ...formRef.current, ...patch };
      setForm(formRef.current);
    },
    [],
  );

  // Alpha-numeric check on the stored plain text. The RichTextEditor
  // serializer can leave `**` markers behind; those are stripped first
  // so the alpha-numeric check is enforced on the rendered content.
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
   *   Application                                  — Yes (linked data)
   *   Ticket type                                  — Yes
   *   Number sequence Prefix                       — Yes (alpha-numeric, max 6)
   *   Number length                                — Yes (digits 3-9)
   *   Numbering Preview                            — Display only
   *   Internal note                                — No
   */
  const validateRequired = (
    f: Partial<IConfigApplicationNumberSequence>,
  ): typeof requiredErrors => {
    const errs: typeof requiredErrors = {};
    if (!String(f.applicationName ?? '').trim()) errs.applicationName = 'required';
    const ttId = f.ticketTypeId as number | string | undefined;
    if (ttId === undefined || ttId === null || String(ttId) === '' || String(ttId) === '0') {
      errs.ticketTypeId = 'required';
    }
    if (!plainText(f.numberSequenceCode ?? '')) errs.numberSequenceCode = 'required';
    const len = Number(f.numericCharLength);
    if (!Number.isInteger(len) || len < MIN_NUMBER_LENGTH || len > MAX_NUMBER_LENGTH) {
      errs.numericCharLength = `must be ${MIN_NUMBER_LENGTH}-${MAX_NUMBER_LENGTH}`;
    }
    return errs;
  };

  /**
   * Returns a single consolidated duplicate message, or null when the
   * form passes the duplicate check.
   *
   * Per the spec for the Application Number Sequence section:
   *   - Number sequence Prefix: Not allowed, AND must not collide with
   *     any other ticket type's prefix (cross-form uniqueness).
   *   - Numbering Preview:     Display only, derived from prefix.
   *
   * All other fields allow duplicates and are not checked here.
   */
  const computeDuplicateMessage = (f: Partial<IConfigApplicationNumberSequence>): string | null => {
    const myId = editing?.id;
    const others = existingSequences.filter((c) => c.id !== myId);

    const prefixVal = plainText(f.numberSequenceCode ?? '');
    if (!prefixVal) return null;

    const conflicts: string[] = [];

    // Within-form collision (another row in the same Application Number
    // Sequence list has the same prefix).
    if (others.some((c) => plainText(c.numberSequenceCode ?? '') === prefixVal)) {
      conflicts.push('Number sequence Prefix');
    }

    // Cross-form collision: the chosen prefix must not match any
    // ticket type's prefix (case-insensitive). The selected ticket
    // type is excluded because the user is overriding ITS number
    // sequence via this row.
    const myTicketTypeId = f.ticketTypeId;
    const crossCollision = ticketTypes.find(
      (t) => t.id !== myTicketTypeId && plainText(String(t.prefix ?? '')) === prefixVal,
    );
    if (crossCollision) {
      conflicts.push(
        `Number sequence Prefix (matches ticket type "${crossCollision.displayName || crossCollision.name}")`,
      );
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
  }, [form, open, editing, existingSequences, ticketTypes]);

  useEffect(() => {
    if (!open) return;
    // Reset required-validation state each time the dialog opens so
    // errors from a previous Add/Edit don't carry over.
    setTouched({});
    setRequiredErrors({});
    const initial: Partial<IConfigApplicationNumberSequence> = editing
      ? {
          applicationId: editing.applicationId ?? '',
          applicationName: editing.applicationName ?? '',
          ticketTypeId: editing.ticketTypeId,
          ticketTypeName: editing.ticketTypeName ?? '',
          numberSequenceCode: editing.numberSequenceCode ?? '',
          numericCharLength: editing.numericCharLength,
          numberSequenceFormat: editing.numberSequenceFormat ?? '',
          internalNote: editing.internalNote ?? '',
        }
      : {
          applicationId: '',
          applicationName: '',
          ticketTypeId: undefined,
          ticketTypeName: '',
          numberSequenceCode: '',
          numericCharLength: undefined,
          numberSequenceFormat: '',
          internalNote: '',
        };
    formRef.current = initial;
    setForm(initial);
  }, [open, editing]);

  const handleSubmit = () => {
    // Run required-field validation first so the user sees a per-field
    // red border / helper text on each required field when blank. Mark
    // all required fields as touched so the errors render even if the
    // user hasn't blurred them yet.
    const reqErrs = validateRequired(formRef.current);
    setRequiredErrors(reqErrs);
    setTouched({
      applicationName: true,
      ticketTypeId: true,
      numberSequenceCode: true,
      numericCharLength: true,
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
      editing ? 'Number sequence updated successfully' : 'Number sequence added successfully',
    );
  };

  const appError = reqError(touched.applicationName, requiredErrors.applicationName);
  const ttError = reqError(touched.ticketTypeId, requiredErrors.ticketTypeId);
  const prefixError = reqError(touched.numberSequenceCode, requiredErrors.numberSequenceCode);
  const lengthError = reqError(touched.numericCharLength, requiredErrors.numericCharLength);

  // ── Application — search-style autocomplete ─────────────────────────────
  // Mirrors the Business Category pattern used by the Service Line and
  // Application Category dialogs: a TextField with a search/clear end
  // adornment and a floating Paper + List of matching options.
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

  // ── Ticket type — search-style autocomplete ─────────────────────────────
  // Mirrors the Application field above AND the `CustomDropdown` pattern
  // from the Ticket Type form: a TextField with a search/clear end
  // adornment and a floating Paper + List of matching options. The
  // CustomDropdown component lives inside TicketTypeFormDialog/components
  // and isn't exported, so we re-implement the same UX inline to keep
  // this dialog self-contained.
  const [ttInput, setTtInput] = useState<string>('');
  const [ttOptionsOpen, setTtOptionsOpen] = useState(false);
  const [ttLoading, setTtLoading] = useState(false);
  const ttDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ttFiltered, setTtFiltered] = useState<{ value: number; label: string }[]>([]);

  const ttSearch = useCallback(
    (query: string) => {
      const q = query.trim().toLowerCase();
      const opts = ticketTypes.map((t) => ({
        value: t.id,
        label: t.name,
      }));
      if (!q) return opts;
      return opts.filter((o) =>
        String(o.label ?? '')
          .toLowerCase()
          .includes(q),
      );
    },
    [ticketTypes],
  );

  const handleTtInputChange = useCallback(
    (value: string) => {
      setTtInput(value);
      if (ttDebounceRef.current) clearTimeout(ttDebounceRef.current);
      ttDebounceRef.current = setTimeout(() => {
        setTtLoading(true);
        const next = ttSearch(value);
        setTtFiltered(next);
        setTtOptionsOpen(next.length > 0);
        setTtLoading(false);
      }, 200);
    },
    [ttSearch],
  );

  const handleTtSelect = useCallback(
    (opt: { value: number; label: string }) => {
      setTtInput(opt.label);
      setTtOptionsOpen(false);
      setTtFiltered([]);
      setTouched((t) => ({ ...t, ticketTypeId: true }));
      updateForm((f) => ({ ...f, ticketTypeId: opt.value, ticketTypeName: opt.label }));
    },
    [updateForm],
  );

  const handleTtClear = useCallback(() => {
    setTtInput('');
    setTtFiltered([]);
    setTtOptionsOpen(false);
    setTouched((t) => ({ ...t, ticketTypeId: true }));
    updateForm((f) => ({ ...f, ticketTypeId: undefined, ticketTypeName: '' }));
  }, [updateForm]);

  // Keep the visible text in sync with the stored value when the dialog
  // reopens for a different row. Mirrors the Application-field sync.
  useEffect(() => {
    const stored = String(form.ticketTypeName ?? '');
    if (stored !== ttInput) {
      setTtInput(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.ticketTypeName]);

  // Reset the search fields' transient state whenever the dialog opens
  // so a previously-typed query (and any open popover) doesn't bleed
  // into a new Add/Edit cycle.
  useEffect(() => {
    if (!open) return;
    setAppOptionsOpen(false);
    setAppFiltered([]);
    setAppLoading(false);
    setTtOptionsOpen(false);
    setTtFiltered([]);
    setTtLoading(false);
    setTtInput(String(form.ticketTypeName ?? ''));
  }, [open]);

  // Live preview derived from prefix + numeric length. The spec's
  // "Mandatory 15" column is the displayed total length: keep the
  // rendered text padded to 15 characters of uppercased-prefix +
  // number-padding so the column matches every other row visually.
  const prefixStr = String(form.numberSequenceCode ?? '');
  const lengthVal = Number(form.numericCharLength);
  const previewRaw = buildPreview(prefixStr, Number.isFinite(lengthVal) ? lengthVal : 0);
  const previewDisplay = previewRaw
    .padEnd(PREVIEW_TOTAL_LENGTH, ' ')
    .slice(0, PREVIEW_TOTAL_LENGTH);

  return (
    <ConfigFormDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      isEdit={!!editing}
      icon={<NumbersIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
      accent={ANS_ACCENT}
      title='Application Number Sequence'
      subtitle={subtitle}
      submitDisabled={false}
      submitLabel={editing ? 'Save' : 'Submit'}
      maxWidth='md'
    >
      {/* Duplicate Alert — single dialog-level message. Per spec, only
          the Number sequence Prefix must be unique (and not collide with
          any other ticket type's prefix). */}
      {duplicateAlert && (
        <Alert severity='error' variant='outlined' sx={{ mb: 1 }}>
          {duplicateAlert}
        </Alert>
      )}

      {/* Application — required, drop-down search sourced from the
          existing applications list. */}
      <Box>
        <Box sx={{ position: 'relative' }}>
          <TextField
            label='Application'
            placeholder='Search applications...'
            value={appInput}
            onChange={(e) => handleAppInputChange(e.target.value)}
            onFocus={() => {
              const next = appSearch(appInput);
              setAppFiltered(next);
              if (next.length > 0) setAppOptionsOpen(true);
            }}
            onBlur={() => {
              setTouched((t) => ({ ...t, applicationName: true }));
              setTimeout(() => setAppOptionsOpen(false), 200);
            }}
            fullWidth
            size='small'
            required
            error={Boolean(appError)}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position='end'>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {appLoading ? (
                        <CircularProgress size={16} />
                      ) : appInput ? (
                        <ClearIcon
                          onClick={handleAppClear}
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
          {appOptionsOpen && appFiltered.length > 0 && (
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
                {appFiltered.map((opt) => (
                  <ListItem key={opt.value} disablePadding>
                    <ListItemButton
                      onClick={() => handleAppSelect(opt)}
                      sx={{
                        py: 1,
                        px: 1.5,
                        '&:hover': { bgcolor: alpha(ANS_ACCENT, 0.08) },
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
            color: appError ? '#d32f2f' : 'transparent',
            fontSize: '0.75rem',
            mt: 0.5,
            ml: 1.75,
            display: 'block',
            minHeight: '1em',
            lineHeight: 1.66,
          }}
        >
          {appError || ' '}
        </Typography>
      </Box>

      {/* Ticket type — required, drop-down sourced from the existing
          ticket-types list. Same search/clear/no-results UX as the
          CustomDropdown used by the Ticket Type form: a TextField
          with a search/clear end adornment and a floating Paper +
          List of matching options, with the active row highlighted
          using the section accent. */}
      <Box>
        <Box sx={{ position: 'relative' }}>
          <TextField
            label='Ticket type'
            placeholder='Search ticket types...'
            value={ttInput}
            onChange={(e) => handleTtInputChange(e.target.value)}
            onFocus={() => {
              const next = ttSearch(ttInput);
              setTtFiltered(next);
              if (next.length > 0) setTtOptionsOpen(true);
            }}
            onBlur={() => {
              setTouched((t) => ({ ...t, ticketTypeId: true }));
              setTimeout(() => setTtOptionsOpen(false), 200);
            }}
            fullWidth
            size='small'
            required
            error={Boolean(ttError)}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position='end'>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {ttLoading ? (
                        <CircularProgress size={16} />
                      ) : ttInput ? (
                        <ClearIcon
                          onClick={handleTtClear}
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
          {ttOptionsOpen && (
            <Paper
              elevation={4}
              sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 1300,
                mt: 0,
                maxHeight: 280,
                overflow: 'auto',
              }}
            >
              {ttFiltered.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant='body2' fontWeight={500} color='text.primary'>
                    No ticket types available
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Configure ticket types first.
                  </Typography>
                </Box>
              ) : (
                <List dense disablePadding>
                  {ttFiltered.map((opt) => {
                    const isActive = String(form.ticketTypeId ?? '') === String(opt.value);
                    return (
                      <ListItem key={String(opt.value)} disablePadding>
                        <ListItemButton
                          onClick={() => handleTtSelect(opt)}
                          sx={{
                            py: 1,
                            px: 1.5,
                            bgcolor: isActive ? alpha(ANS_ACCENT, 0.08) : 'transparent',
                            '&:hover': { bgcolor: alpha(ANS_ACCENT, 0.12) },
                          }}
                        >
                          <ListItemText
                            primary={opt.label}
                            primaryTypographyProps={{
                              fontSize: '0.84rem',
                              fontWeight: isActive ? 700 : 400,
                              noWrap: true,
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </Paper>
          )}
        </Box>
        <Typography
          variant='caption'
          sx={{
            color: ttError ? '#d32f2f' : 'text.secondary',
            fontSize: '0.75rem',
            mt: 0.5,
            ml: 1.75,
            display: 'block',
            minHeight: '1em',
            lineHeight: 1.66,
          }}
        >
          {ttError || 'Drop-down from the Ticket types list.'}
        </Typography>
      </Box>

      {/* Number sequence Prefix — required, alpha-numeric, max 6.
          Unique across this form and the ticket-types form per the
          spec. */}
      <Box>
        <TextField
          label='Number sequence Prefix'
          size='small'
          value={form.numberSequenceCode ?? ''}
          onChange={(e) => {
            const cleaned = stripAlphaNumeric(e.target.value).toUpperCase();
            updateForm((f) => ({
              ...f,
              numberSequenceCode: cleaned,
              numberSequenceFormat: buildPreview(cleaned, Number(f.numericCharLength) || 0),
            }));
          }}
          onBlur={() => setTouched((t) => ({ ...t, numberSequenceCode: true }))}
          placeholder='e.g. INC, HR, PAY'
          inputProps={{
            style: { fontFamily: 'monospace', fontWeight: 700, textTransform: 'uppercase' },
            maxLength: MAX_PREFIX,
          }}
          error={Boolean(prefixError)}
          helperText={
            prefixError ||
            `Alpha-numeric, max ${MAX_PREFIX} characters. Unique across application and ticket-type number sequences.`
          }
          required
        />
      </Box>

      {/* Number length — required, digits 3-9 per the spec. */}
      <Box>
        <TextField
          label='Number length'
          size='small'
          type='number'
          value={
            form.numericCharLength === undefined || form.numericCharLength === null
              ? ''
              : String(form.numericCharLength)
          }
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, '');
            const n = raw === '' ? undefined : parseInt(raw, 10);
            updateForm((f) => ({
              ...f,
              numericCharLength: n,
              numberSequenceFormat: buildPreview(String(f.numberSequenceCode ?? ''), n ?? 0),
            }));
          }}
          onBlur={() => setTouched((t) => ({ ...t, numericCharLength: true }))}
          placeholder='3-9'
          inputProps={{ min: MIN_NUMBER_LENGTH, max: MAX_NUMBER_LENGTH }}
          error={Boolean(lengthError)}
          helperText={
            lengthError || `Digits only, between ${MIN_NUMBER_LENGTH} and ${MAX_NUMBER_LENGTH}.`
          }
          required
        />
      </Box>

      {/* Numbering Preview — display only. Read-only, derived from
          prefix + numeric length. Padded to 15 chars per the spec's
          "Mandatory 15" column. */}
      <Box>
        <TextField
          label='Numbering Preview'
          size='small'
          value={previewDisplay}
          fullWidth
          disabled
          inputProps={{
            style: { fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.5px' },
            readOnly: true,
          }}
          helperText='Display only — derived from Number sequence Prefix and Number length.'
        />
      </Box>

      {/* Internal note — optional, alpha-numeric, max 60. "Same as
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

export default ApplicationNumberSequenceFormDialog;
