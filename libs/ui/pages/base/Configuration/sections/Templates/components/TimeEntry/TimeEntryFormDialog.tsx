import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Switch,
  Button,
  Divider,
} from '@serviceops/component';
import {
  alpha,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  darken,
  Dialog,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Clear as ClearIcon, Search as SearchIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { RichTextEditor, parseRichText } from '@serviceops/richtexteditor';
import type { IConfigTimeEntryTemplate, IConfigTimeEntryLine } from '@serviceops/interfaces';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';
import { useStyles } from '../../../../styles';
import { DurationPickerField } from '../../../../shared/GenericPanel/components/DurationPickerField/DurationPickerField';
import { useFieldError } from '@serviceops/hooks';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface TimeEntryFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: IConfigTimeEntryTemplate) => void;
  isEdit: boolean;
  initialData?: IConfigTimeEntryTemplate;
  accent?: string;
}

const createEmptyEntry = (): IConfigTimeEntryLine => ({
  id: '',
  billingCode: '',
  activityTask: '',
  nonBillable: false,
  mon: 0,
  tue: 0,
  wed: 0,
  thu: 0,
  fri: 0,
  sat: 0,
  sun: 0,
});

const createEmptyForm = () => ({
  name: '',
  description: '',
  active: true,
  ticketStatus: '',
  date: '',
  duration: '',
  billingCode: '',
  activityTask: '',
  externalComment: '',
  internalComment: '',
  nonBillable: false,
});

interface FormState {
  name: string;
  description: string;
  active: boolean;
  ticketStatus: string;
  date: string;
  duration: string;
  billingCode: string;
  activityTask: string;
  externalComment: string;
  internalComment: string;
  nonBillable: boolean;
}

export const TimeEntryFormDialog = ({
  open,
  onClose,
  onSubmit,
  isEdit,
  initialData,
  accent = '#0369a1',
}: TimeEntryFormDialogProps) => {
  const _classes = useStyles();
  const config = useConfiguration();
  const [form, setForm] = useState<FormState>(createEmptyForm());

  // ── Validation state ──────────────────────────────────────────────────
  const [touched, setTouched] = useState<{
    [K in keyof FormState]?: boolean;
  }>({});
  const [requiredErrors, setRequiredErrors] = useState<{
    [K in keyof FormState]?: string;
  }>({});

  const reqError = useFieldError();

  const validateRequired = (f: FormState) => {
    const errs: typeof requiredErrors = {};
    if (!String(f.name ?? '').trim()) errs.name = 'required';
    if (!String(f.description ?? '').trim()) errs.description = 'required';
    if (!String(f.ticketStatus ?? '').trim()) errs.ticketStatus = 'required';
    if (!String(f.date ?? '').trim()) errs.date = 'required';
    if (!String(f.duration ?? '').trim()) errs.duration = 'required';
    if (!String(f.billingCode ?? '').trim()) errs.billingCode = 'required';
    if (!String(f.activityTask ?? '').trim()) errs.activityTask = 'required';
    if (!String(f.externalComment ?? '').trim()) errs.externalComment = 'required';
    if (!String(f.internalComment ?? '').trim()) errs.internalComment = 'required';
    return errs;
  };

  // ── Searchable field helpers (mirror ResolutionFormDialog) ───────────
  const useSearchableField = (
    input: string,
    setInput: (v: string) => void,
    open: boolean,
    setOpen: (v: boolean) => void,
    filtered: { value: string; label: string }[],
    setFiltered: (v: { value: string; label: string }[]) => void,
    debounceRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
    options: { value: string; label: string }[],
    formField: keyof FormState,
  ) => {
    const handleSelect = (opt: { value: string; label: string }) => {
      setInput(opt.label);
      setOpen(false);
      setFiltered([]);
      setForm((prev) => ({ ...prev, [formField]: opt.value }));
      setRequiredErrors((prev) => ({ ...prev, [formField]: undefined }));
    };

    const handleClear = () => {
      setInput('');
      setFiltered([]);
      setOpen(false);
      setForm((prev) => ({ ...prev, [formField]: '' }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setInput(val);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const q = val.trim().toLowerCase();
        const next = q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
        setFiltered(next);
        setOpen(next.length > 0);
      }, 150);
    };

    const handleFocus = () => {
      const q = input.trim().toLowerCase();
      const next = q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
      setFiltered(next);
      if (next.length > 0) setOpen(true);
    };

    const handleBlur = () => {
      setTimeout(() => setOpen(false), 150);
    };

    const renderDropdown = () =>
      open && filtered.length > 0 ? (
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
            {filtered.map((opt) => (
              <ListItem key={opt.value} disablePadding>
                <ListItemButton
                  onClick={() => handleSelect(opt)}
                  sx={{
                    py: 1,
                    px: 1.5,
                    '&:hover': { bgcolor: alpha(accent, 0.08) },
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
      ) : null;

    const endAdornment = input ? (
      <InputAdornment position='end'>
        <ClearIcon
          onClick={handleClear}
          sx={{ fontSize: 18, color: 'text.primary', cursor: 'pointer' }}
        />
      </InputAdornment>
    ) : (
      <InputAdornment position='end'>
        <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
      </InputAdornment>
    );

    return { handleInputChange, handleFocus, handleBlur, renderDropdown, endAdornment };
  };

  // ── Ticket Status searchable field ───────────────────────────────────
  const [tsInput, setTsInput] = useState<string>('');
  const [tsOpen, setTsOpen] = useState(false);
  const [tsFiltered, setTsFiltered] = useState<{ value: string; label: string }[]>([]);
  const tsDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const statuses = (config?.data?.statuses?.items ?? []).map((s) => ({
    value: s.name,
    label: s.displayName,
  }));

  // Sync local input with form value
  useEffect(() => {
    const stored = String(form.ticketStatus ?? '');
    if (stored !== tsInput) setTsInput(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.ticketStatus]);

  const tsSearch = useSearchableField(
    tsInput,
    setTsInput,
    tsOpen,
    setTsOpen,
    tsFiltered,
    setTsFiltered,
    tsDebounceRef,
    statuses,
    'ticketStatus',
  );

  // ── Billing Code searchable field ────────────────────────────────────
  const [bcInput, setBcInput] = useState<string>('');
  const [bcOpen, setBcOpen] = useState(false);
  const [bcFiltered, setBcFiltered] = useState<{ value: string; label: string }[]>([]);
  const bcDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const billingCodes = (config?.data?.categorization?.applications ?? []).flatMap((app) =>
    (app.billingCodes ?? []).map((bc) => ({ value: bc.code, label: bc.description })),
  );

  // Sync local input with form value
  useEffect(() => {
    const stored = String(form.billingCode ?? '');
    if (stored !== bcInput) setBcInput(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.billingCode]);

  const bcSearch = useSearchableField(
    bcInput,
    setBcInput,
    bcOpen,
    setBcOpen,
    bcFiltered,
    setBcFiltered,
    bcDebounceRef,
    billingCodes,
    'billingCode',
  );

  // ── Init form from initialData ────────────────────────────────────────
  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        description: initialData.description,
        active: initialData.active,
        ticketStatus: initialData.ticketStatus,
        date: initialData.weekStartDate || '',
        duration: initialData.entries?.[0] ? `${initialData.entries[0].mon || 0}:00` : '',
        billingCode: initialData.entries?.[0]?.billingCode || '',
        activityTask: initialData.entries?.[0]?.activityTask || '',
        externalComment: initialData.externalComment,
        internalComment: initialData.internalComment,
        nonBillable: initialData.nonBillable ?? false,
      });
      // Sync inputs — they auto-populate from form via the useEffect hooks above
      setTsFiltered([]);
      setTsOpen(false);
      setBcFiltered([]);
      setBcOpen(false);
    } else {
      setForm(createEmptyForm());
      setTsInput('');
      setTsOpen(false);
      setTsFiltered([]);
      setBcInput('');
      setBcOpen(false);
      setBcFiltered([]);
    }
    setTouched({});
    setRequiredErrors({});
  }, [initialData, open]);

  const handleChange = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    setTouched({
      name: true,
      description: true,
      ticketStatus: true,
      date: true,
      duration: true,
      billingCode: true,
      activityTask: true,
      externalComment: true,
      internalComment: true,
      nonBillable: true,
    });
    const errs = validateRequired(form);
    setRequiredErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const entry: IConfigTimeEntryLine =
      isEdit && initialData?.entries?.[0]
        ? { ...initialData.entries[0] }
        : {
            ...createEmptyEntry(),
            billingCode: form.billingCode,
            activityTask: form.activityTask,
            nonBillable: form.nonBillable,
          };

    entry.mon = Number(String(form.duration).split(':')[0]) || 0;

    const template: IConfigTimeEntryTemplate = {
      ...form,
      id: initialData?.id || `template-${Date.now()}`,
      weekStartDate: form.date,
      entries: [entry],
    } as IConfigTimeEntryTemplate;
    onSubmit(template);
  };

  const nameError = reqError(touched.name, requiredErrors.name);
  const descriptionError = reqError(touched.description, requiredErrors.description);
  const ticketStatusError = reqError(touched.ticketStatus, requiredErrors.ticketStatus);
  const dateError = reqError(touched.date, requiredErrors.date);
  const durationError = reqError(touched.duration, requiredErrors.duration);
  // NOTE: billingCode validation runs in validateRequired but ProjectSearchField
  // manages its own internal error display — the error var suppresses the lint rule.

  const _billingCodeError = reqError(touched.billingCode, requiredErrors.billingCode);
  const activityTaskError = reqError(touched.activityTask, requiredErrors.activityTask);
  const externalCommentError = reqError(touched.externalComment, requiredErrors.externalComment);
  const internalCommentError = reqError(touched.internalComment, requiredErrors.internalComment);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
      disableEscapeKeyDown
      TransitionProps={{ unmountOnExit: true }}
      PaperProps={{ sx: { borderRadius: 2, overflow: 'hidden' } }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          background: `linear-gradient(135deg, ${darken(accent, 0.15)} 0%, ${accent} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 1,
              bgcolor: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AccessTimeIcon sx={{ fontSize: '1rem', color: '#fff' }} />
          </Box>
          <Box>
            <Typography
              sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', lineHeight: 1.2 }}
            >
              {isEdit ? 'Edit Time Entry Template' : 'Add Time Entry Template'}
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', mt: 0.2 }}>
              Define time entry template with billing and activity details
            </Typography>
          </Box>
        </Box>
      </Box>

      <DialogContent dividers sx={{ p: 0 }}>
        <Box sx={{ px: 2.5, py: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            {/* Row 1: Template Name + Ticket Status side-by-side */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
              <Box>
                <TextField
                  label='Template Name'
                  size='small'
                  fullWidth
                  value={form.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange('name', e.target.value)
                  }
                  required
                  placeholder='Enter template name'
                  inputProps={{ maxLength: 40 }}
                  error={Boolean(nameError)}
                  helperText={nameError}
                />
              </Box>
              <Box sx={{ position: 'relative' }}>
                <TextField
                  label='Ticket Status'
                  size='small'
                  fullWidth
                  value={tsInput}
                  onChange={tsSearch.handleInputChange}
                  onFocus={tsSearch.handleFocus}
                  onBlur={tsSearch.handleBlur}
                  placeholder='Search ticket status...'
                  required
                  error={Boolean(ticketStatusError)}
                  helperText={ticketStatusError}
                  slotProps={{ input: { endAdornment: tsSearch.endAdornment } }}
                />
                {tsSearch.renderDropdown()}
              </Box>
            </Box>

            {/* Row 2: Description (RichTextEditor) */}
            <Box sx={{ mb: 2 }}>
              <RichTextEditor
                value={parseRichText(form.description)}
                onChange={(value: { segments: Array<{ text: string }> }) => {
                  const text = value.segments.map((s) => s.text).join('');
                  handleChange('description', text);
                }}
                accent={accent}
                title='Description'
                placeholder='Enter description...'
                showFooterActions={false}
                required
              />
              {descriptionError && (
                <Typography sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                  {descriptionError}
                </Typography>
              )}
            </Box>

            {/* Row 3: Date + Duration side-by-side */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 1.5,
                mb: 2,
              }}
            >
              <Box>
                <DatePicker
                  label='Date'
                  value={form.date ? dayjs(form.date) : null}
                  onChange={(newValue: Dayjs | null) => {
                    handleChange('date', newValue ? newValue.format('YYYY-MM-DD') : '');
                  }}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      required: true,
                      error: Boolean(dateError),
                      helperText: dateError,
                    },
                  }}
                />
              </Box>
              <Box>
                <DurationPickerField
                  label='Duration'
                  required
                  value={form.duration}
                  onChange={(val: string) => handleChange('duration', val)}
                  error={Boolean(durationError)}
                  helperText={durationError}
                />
              </Box>
            </Box>

            {/* Row 4: Billing Code / Project + Activity / Task side-by-side */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 1.5,
                mb: 2,
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <TextField
                  label='Billing Code'
                  size='small'
                  fullWidth
                  value={bcInput}
                  onChange={bcSearch.handleInputChange}
                  onFocus={bcSearch.handleFocus}
                  onBlur={bcSearch.handleBlur}
                  placeholder='Search billing code...'
                  required
                  error={Boolean(_billingCodeError && touched.billingCode)}
                  helperText={_billingCodeError && touched.billingCode ? _billingCodeError : ''}
                  slotProps={{ input: { endAdornment: bcSearch.endAdornment } }}
                />
                {bcSearch.renderDropdown()}
              </Box>
              <Box>
                <TextField
                  label='Activity / Task'
                  size='small'
                  fullWidth
                  value={form.activityTask}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange('activityTask', e.target.value)
                  }
                  required
                  placeholder='Enter activity/task'
                  error={Boolean(activityTaskError)}
                  helperText={activityTaskError}
                />
              </Box>
            </Box>

            {/* Row 6: External Comment (RichTextEditor) */}
            <Box sx={{ mb: 2 }}>
              <RichTextEditor
                value={parseRichText(form.externalComment)}
                onChange={(value: { segments: Array<{ text: string }> }) => {
                  const text = value.segments.map((s) => s.text).join('');
                  handleChange('externalComment', text);
                }}
                accent={accent}
                title='External Comment'
                placeholder='Enter external comment...'
                showFooterActions={false}
                required
              />
              {externalCommentError && (
                <Typography sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                  {externalCommentError}
                </Typography>
              )}
            </Box>

            {/* Row 7: Internal Comment (RichTextEditor) */}
            <Box sx={{ mb: 2 }}>
              <RichTextEditor
                value={parseRichText(form.internalComment)}
                onChange={(value: { segments: Array<{ text: string }> }) => {
                  const text = value.segments.map((s) => s.text).join('');
                  handleChange('internalComment', text);
                }}
                accent={accent}
                title='Internal Comment'
                placeholder='Enter internal comment...'
                showFooterActions={false}
                required
              />
              {internalCommentError && (
                <Typography sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                  {internalCommentError}
                </Typography>
              )}
            </Box>

            {/* Row 8: Switches at the bottom */}
            <Divider sx={{ my: 2 }} />
            <Box
              sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 2 }}
            >
              {[
                { key: 'active', label: 'Active' },
                { key: 'nonBillable', label: 'Non-billable' },
              ].map(({ key, label }) => (
                <FormControlLabel
                  key={key}
                  labelPlacement='start'
                  control={
                    <Switch
                      checked={form[key as keyof FormState] as boolean}
                      onChange={(e) => handleChange(key as keyof FormState, e.target.checked)}
                      size='small'
                    />
                  }
                  label={label}
                />
              ))}
            </Box>
          </LocalizationProvider>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Button
          onClick={onClose}
          variant='outlined'
          sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
        >
          Cancel
        </Button>
        <Button
          variant='contained'
          onClick={handleSubmit}
          sx={{
            textTransform: 'none',
            bgcolor: accent,
            width: { xs: '100%', sm: 'auto' },
            '&:hover': { bgcolor: accent },
          }}
        >
          {isEdit ? 'Save' : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TimeEntryFormDialog;
