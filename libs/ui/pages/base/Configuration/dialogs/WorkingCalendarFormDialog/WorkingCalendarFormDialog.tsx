import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, Box, TextField, Paper, Typography } from '@serviceops/component';
import {
  alpha,
  CircularProgress,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import { CalendarToday, Clear as ClearIcon, Search as SearchIcon } from '@mui/icons-material';
import { useFieldError, useNotification } from '@serviceops/hooks';
import { IConfigWorkingCalendar } from '@serviceops/interfaces';
import { ConfigFormDialog } from '@serviceops/configdialogs';
import { parseRichText, serializeRichText, RichTextEditor } from '../../shared/RichTextEditor';

const WC_ACCENT = '#0369a1';

interface WorkingCalendarFormDialogProps {
  open: boolean;
  editing: IConfigWorkingCalendar | null;
  /** Other working-calendar rows for duplicate-name detection. */
  existingCalendars?: IConfigWorkingCalendar[];
  /** Drop-down options for the "Holiday Calendar" field. Sourced from the
   * existing Holiday Calendar list (Calendar > Holiday calendar (tab) >
   * Holiday calendar (field)). `value` and `label` are the holiday
   * calendar name. */
  holidayCalendarOptions?: { value: string; label: string }[];
  /** Drop-down options for the "Working Day Template" field. Sourced from
   * the existing Working Day Template list (Calendar > Working day
   * template (tab) > Working day template (field)). `value` and `label`
   * are the working day template name. */
  workingDayTemplateOptions?: { value: string; label: string }[];
  onClose: () => void;
  onSave: (data: Partial<IConfigWorkingCalendar>) => void;
  subtitle?: string;
}

const WorkingCalendarFormDialog = ({
  open,
  editing,
  existingCalendars = [],
  holidayCalendarOptions = [],
  workingDayTemplateOptions = [],
  onClose,
  onSave,
  subtitle,
}: WorkingCalendarFormDialogProps) => {
  const { success } = useNotification();
  const reqError = useFieldError();
  const [form, setForm] = useState<Partial<IConfigWorkingCalendar>>({});
  const formRef = useRef<Partial<IConfigWorkingCalendar>>({});
  const [duplicateAlert, setDuplicateAlert] = useState<string | null>(null);
  const [touched, setTouched] = useState<{
    name?: boolean;
    shortDescription?: boolean;
    internalNote?: boolean;
  }>({});
  const [requiredErrors, setRequiredErrors] = useState<{
    name?: string;
    shortDescription?: string;
    internalNote?: string;
  }>({});

  const updateForm = useCallback(
    (
      patch:
        | Partial<IConfigWorkingCalendar>
        | ((f: Partial<IConfigWorkingCalendar>) => Partial<IConfigWorkingCalendar>),
    ) => {
      formRef.current =
        typeof patch === 'function' ? patch(formRef.current) : { ...formRef.current, ...patch };
      setForm(formRef.current);
    },
    [],
  );

  const validateRequired = (f: Partial<IConfigWorkingCalendar>): typeof requiredErrors => {
    const errs: typeof requiredErrors = {};
    if (!String(f.name ?? '').trim()) errs.name = 'required';
    if (!String(f.shortDescription ?? '').trim()) errs.shortDescription = 'required';
    if (!String(f.internalNote ?? '').trim()) errs.internalNote = 'required';
    return errs;
  };

  const computeDuplicateMessage = (f: Partial<IConfigWorkingCalendar>): string | null => {
    const myId = editing?.id;
    const others = existingCalendars.filter((c) => c.id !== myId);
    const nameVal = String(f.name ?? '')
      .trim()
      .toLowerCase();
    if (
      nameVal &&
      others.some(
        (c) =>
          String(c.name ?? '')
            .trim()
            .toLowerCase() === nameVal,
      )
    ) {
      return `Working Calendar "${String(f.name ?? '')}" already exists. Please use a different name.`;
    }
    return null;
  };

  useEffect(() => {
    if (!open) {
      setDuplicateAlert(null);
      return;
    }
    setDuplicateAlert(computeDuplicateMessage(formRef.current));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, open, editing, existingCalendars]);

  useEffect(() => {
    if (!open) return;
    setTouched({});
    setRequiredErrors({});
    const initial: Partial<IConfigWorkingCalendar> = editing
      ? {
          name: editing.name,
          holidayCalendar: editing.holidayCalendar ?? '',
          workingDayTemplate: editing.workingDayTemplate ?? '',
          shortDescription: editing.shortDescription ?? '',
          internalNote: editing.internalNote ?? '',
        }
      : {
          name: '',
          holidayCalendar: '',
          workingDayTemplate: '',
          shortDescription: '',
          internalNote: '',
        };
    formRef.current = initial;
    setForm(initial);
  }, [open, editing]);

  const handleSubmit = () => {
    const reqErrs = validateRequired(formRef.current);
    setRequiredErrors(reqErrs);
    setTouched({ name: true, shortDescription: true, internalNote: true });
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
      editing ? 'Working calendar updated successfully' : 'Working calendar added successfully',
    );
  };

  const nameError = reqError(touched.name, requiredErrors.name);
  const shortDescriptionError = reqError(touched.shortDescription, requiredErrors.shortDescription);
  const internalNoteError = reqError(touched.internalNote, requiredErrors.internalNote);

  // ── Holiday Calendar — search-style autocomplete ──────────────────────────
  // Mirrors the Application Category pattern used by the Application
  // Sub-Category dialog: TextField with a search/clear end adornment, a
  // floating Paper + List of matching holiday-calendar options, sourced
  // from Calendar > Holiday calendar (tab) > Holiday calendar (field).
  const [hcInput, setHcInput] = useState<string>('');
  const [hcOptionsOpen, setHcOptionsOpen] = useState(false);
  const [hcLoading, setHcLoading] = useState(false);
  const hcDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hcFiltered, setHcFiltered] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    const stored = String(form.holidayCalendar ?? '');
    if (stored !== hcInput) {
      setHcInput(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.holidayCalendar]);

  const hcSearch = useCallback(
    (query: string) => {
      const q = query.trim().toLowerCase();
      if (!q) return holidayCalendarOptions;
      return holidayCalendarOptions.filter((o) =>
        String(o.label ?? '')
          .toLowerCase()
          .includes(q),
      );
    },
    [holidayCalendarOptions],
  );

  const handleHcInputChange = useCallback(
    (value: string) => {
      setHcInput(value);
      updateForm((f) => ({ ...f, holidayCalendar: value }));
      if (hcDebounceRef.current) clearTimeout(hcDebounceRef.current);
      hcDebounceRef.current = setTimeout(() => {
        setHcLoading(true);
        const next = hcSearch(value);
        setHcFiltered(next);
        setHcOptionsOpen(next.length > 0);
        setHcLoading(false);
      }, 200);
    },
    [hcSearch, updateForm],
  );

  const handleHcSelect = useCallback(
    (opt: { value: string; label: string }) => {
      setHcInput(opt.label);
      setHcOptionsOpen(false);
      setHcFiltered([]);
      updateForm((f) => ({ ...f, holidayCalendar: opt.value }));
    },
    [updateForm],
  );

  const handleHcClear = useCallback(() => {
    setHcInput('');
    setHcFiltered([]);
    setHcOptionsOpen(false);
    updateForm((f) => ({ ...f, holidayCalendar: '' }));
  }, [updateForm]);

  // Reset the search field's transient state whenever the dialog opens so
  // a previously-typed query (and any open popover) doesn't bleed into a
  // new Add/Edit cycle.
  useEffect(() => {
    if (!open) return;
    setHcOptionsOpen(false);
    setHcFiltered([]);
    setHcLoading(false);
  }, [open]);

  // ── Working Day Template — search-style autocomplete ──────────────────────
  // Same pattern as Holiday Calendar above, sourced from Calendar > Working
  // day template (tab) > Working day template (field).
  const [wdtInput, setWdtInput] = useState<string>('');
  const [wdtOptionsOpen, setWdtOptionsOpen] = useState(false);
  const [wdtLoading, setWdtLoading] = useState(false);
  const wdtDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [wdtFiltered, setWdtFiltered] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    const stored = String(form.workingDayTemplate ?? '');
    if (stored !== wdtInput) {
      setWdtInput(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.workingDayTemplate]);

  const wdtSearch = useCallback(
    (query: string) => {
      const q = query.trim().toLowerCase();
      if (!q) return workingDayTemplateOptions;
      return workingDayTemplateOptions.filter((o) =>
        String(o.label ?? '')
          .toLowerCase()
          .includes(q),
      );
    },
    [workingDayTemplateOptions],
  );

  const handleWdtInputChange = useCallback(
    (value: string) => {
      setWdtInput(value);
      updateForm((f) => ({ ...f, workingDayTemplate: value }));
      if (wdtDebounceRef.current) clearTimeout(wdtDebounceRef.current);
      wdtDebounceRef.current = setTimeout(() => {
        setWdtLoading(true);
        const next = wdtSearch(value);
        setWdtFiltered(next);
        setWdtOptionsOpen(next.length > 0);
        setWdtLoading(false);
      }, 200);
    },
    [wdtSearch, updateForm],
  );

  const handleWdtSelect = useCallback(
    (opt: { value: string; label: string }) => {
      setWdtInput(opt.label);
      setWdtOptionsOpen(false);
      setWdtFiltered([]);
      updateForm((f) => ({ ...f, workingDayTemplate: opt.value }));
    },
    [updateForm],
  );

  const handleWdtClear = useCallback(() => {
    setWdtInput('');
    setWdtFiltered([]);
    setWdtOptionsOpen(false);
    updateForm((f) => ({ ...f, workingDayTemplate: '' }));
  }, [updateForm]);

  useEffect(() => {
    if (!open) return;
    setWdtOptionsOpen(false);
    setWdtFiltered([]);
    setWdtLoading(false);
  }, [open]);

  return (
    <ConfigFormDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      isEdit={!!editing}
      icon={<CalendarToday sx={{ color: '#fff', fontSize: '1.1rem' }} />}
      accent={WC_ACCENT}
      title='Working Calendar'
      subtitle={subtitle}
      submitDisabled={false}
      submitLabel={editing ? 'Save' : 'Submit'}
      maxWidth='sm'
    >
      {duplicateAlert && (
        <Alert severity='error' variant='outlined' sx={{ mb: 1 }}>
          {duplicateAlert}
        </Alert>
      )}

      <TextField
        label='Working Calendar'
        size='small'
        value={form.name ?? ''}
        onChange={(e) => updateForm((f) => ({ ...f, name: e.target.value }))}
        onBlur={() => setTouched((t) => ({ ...t, name: true }))}
        placeholder='e.g. UK Standard Calendar'
        inputProps={{ style: { fontWeight: 700 } }}
        error={Boolean(nameError)}
        helperText={nameError}
        required
      />

      <Box sx={{ position: 'relative' }}>
        <TextField
          label='Holiday Calendar'
          placeholder='Search holiday calendars...'
          value={hcInput}
          onChange={(e) => handleHcInputChange(e.target.value)}
          onFocus={() => {
            const next = hcSearch(hcInput);
            setHcFiltered(next);
            if (next.length > 0) setHcOptionsOpen(true);
          }}
          onBlur={() => setTimeout(() => setHcOptionsOpen(false), 200)}
          fullWidth
          size='small'
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position='end'>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {hcLoading ? (
                      <CircularProgress size={16} />
                    ) : hcInput ? (
                      <ClearIcon
                        onClick={handleHcClear}
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
        {hcOptionsOpen && hcFiltered.length > 0 && (
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
              {hcFiltered.map((opt) => (
                <ListItem key={opt.value} disablePadding>
                  <ListItemButton
                    onClick={() => handleHcSelect(opt)}
                    sx={{
                      py: 1,
                      px: 1.5,
                      '&:hover': { bgcolor: alpha(WC_ACCENT, 0.08) },
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

      <Box sx={{ position: 'relative' }}>
        <TextField
          label='Working Day Template'
          placeholder='Search working day templates...'
          value={wdtInput}
          onChange={(e) => handleWdtInputChange(e.target.value)}
          onFocus={() => {
            const next = wdtSearch(wdtInput);
            setWdtFiltered(next);
            if (next.length > 0) setWdtOptionsOpen(true);
          }}
          onBlur={() => setTimeout(() => setWdtOptionsOpen(false), 200)}
          fullWidth
          size='small'
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position='end'>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {wdtLoading ? (
                      <CircularProgress size={16} />
                    ) : wdtInput ? (
                      <ClearIcon
                        onClick={handleWdtClear}
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
        {wdtOptionsOpen && wdtFiltered.length > 0 && (
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
              {wdtFiltered.map((opt) => (
                <ListItem key={opt.value} disablePadding>
                  <ListItemButton
                    onClick={() => handleWdtSelect(opt)}
                    sx={{
                      py: 1,
                      px: 1.5,
                      '&:hover': { bgcolor: alpha(WC_ACCENT, 0.08) },
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

      <Box>
        <RichTextEditor
          value={parseRichText(form.shortDescription ?? '')}
          onChange={(value) => {
            updateForm((f) => ({
              ...f,
              shortDescription: serializeRichText(value.segments),
            }));
            setTouched((t) => ({ ...t, shortDescription: true }));
          }}
          showFooterActions={false}
          title='Short Description'
          required
          error={Boolean(shortDescriptionError)}
        />
        {shortDescriptionError && (
          <Typography
            variant='caption'
            sx={{
              color: '#d32f2f',
              fontSize: '0.7rem',
              mt: 0.25,
              display: 'block',
              fontWeight: 600,
            }}
          >
            {shortDescriptionError}
          </Typography>
        )}
      </Box>

      <Box>
        <RichTextEditor
          value={parseRichText(form.internalNote ?? '')}
          onChange={(value) => {
            updateForm((f) => ({
              ...f,
              internalNote: serializeRichText(value.segments),
            }));
            setTouched((t) => ({ ...t, internalNote: true }));
          }}
          showFooterActions={false}
          title='Internal note'
          required
          error={Boolean(internalNoteError)}
        />
        {internalNoteError && (
          <Typography
            variant='caption'
            sx={{
              color: '#d32f2f',
              fontSize: '0.7rem',
              mt: 0.25,
              display: 'block',
              fontWeight: 600,
            }}
          >
            {internalNoteError}
          </Typography>
        )}
      </Box>
    </ConfigFormDialog>
  );
};

export default WorkingCalendarFormDialog;
