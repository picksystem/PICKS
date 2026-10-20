import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Switch,
  Modal,
  Tooltip,
  FormControlLabel,
} from '../../../../components';
import { alpha, darken, Paper, InputAdornment } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  AccessTime as AccessTimeIcon,
  CloudUploadOutlined as CloudUploadOutlinedIcon,
  DeleteOutline as DeleteOutlineIcon,
} from '@mui/icons-material';
import { useCreateTicketTimeEntryMutation } from '../../../../../services';
import { useAuth, useNotification, useFieldError } from '@serviceops/hooks';
import { useConfiguration } from '@serviceops/confighooks';
import { TicketEntity } from '../types/ticketDetail.types';
import type { IConfigTimeEntryLine, IConfigTimeEntryTemplate } from '@serviceops/interfaces';
import {
  parseRichText,
  serializeRichText,
  RichTextEditor,
} from '../../../../pages/base/Configuration/shared/RichTextEditor';
import { DurationPickerField } from '../../../../pages/base/Configuration/shared/GenericPanel/components/DurationPickerField/DurationPickerField';

const TIME_ENTRY_ACCENT = '#0369a1';

interface TimeEntryWindowProps {
  open: boolean;
  onClose: () => void;
  incident: TicketEntity;
  onSuccess: () => void;
}

const TimeEntryWindow = ({ open, onClose, incident, onSuccess }: TimeEntryWindowProps) => {
  const { user } = useAuth();
  const [createTimeEntry, { isLoading }] = useCreateTicketTimeEntryMutation();
  const { statuses, timeEntryTemplates, saveSection } = useConfiguration();
  const notify = useNotification();

  const [duration, setDuration] = useState('');
  const [billingCode, setBillingCode] = useState('');

  // ── Save as Template (mirror CommentWindow) ────────────────────────────
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [newTemplateActive, setNewTemplateActive] = useState(true);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  // ── Billing Code / Project searchable field (mirror TimeEntryFormDialog) ──
  const { categorization } = useConfiguration();
  const [bcInput, setBcInput] = useState('');
  const [bcOpen, setBcOpen] = useState(false);
  const [bcFiltered, setBcFiltered] = useState<{ value: string; label: string }[]>([]);
  const bcDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const billingCodes = (categorization?.applications ?? []).flatMap((app) =>
    (app.billingCodes ?? []).map((bc) => ({ value: bc.code, label: bc.description })),
  );

  // Sync local input with form value
  useEffect(() => {
    if (billingCode !== bcInput) setBcInput(billingCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billingCode]);

  const handleBillingCodeInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setBcInput(val);
      if (bcDebounceRef.current) clearTimeout(bcDebounceRef.current);
      bcDebounceRef.current = setTimeout(() => {
        const q = val.trim().toLowerCase();
        const next = q
          ? billingCodes.filter((o) => o.label.toLowerCase().includes(q))
          : billingCodes;
        setBcFiltered(next);
        setBcOpen(next.length > 0);
      }, 150);
    },
    [billingCodes],
  );

  const handleBillingCodeFocus = useCallback(() => {
    const q = bcInput.trim().toLowerCase();
    const next = q ? billingCodes.filter((o) => o.label.toLowerCase().includes(q)) : billingCodes;
    setBcFiltered(next);
    if (next.length > 0) setBcOpen(true);
  }, [billingCodes, bcInput]);

  const handleBillingCodeBlur = useCallback(() => {
    setTouched((t) => ({ ...t, billingCode: true }));
    setTimeout(() => setBcOpen(false), 150);
  }, []);

  const handleBillingCodeSelect = useCallback((opt: { value: string; label: string }) => {
    setBcInput(opt.label);
    setBcOpen(false);
    setBcFiltered([]);
    setBillingCode(opt.value);
  }, []);

  const handleBillingCodeClear = useCallback(() => {
    setBcInput('');
    setBcFiltered([]);
    setBcOpen(false);
    setBillingCode('');
  }, []);

  const billingCodeEndAdornment = bcInput ? (
    <InputAdornment position='end'>
      <ClearIcon
        onClick={handleBillingCodeClear}
        sx={{ fontSize: 18, color: 'text.primary', cursor: 'pointer' }}
      />
    </InputAdornment>
  ) : (
    <InputAdornment position='end'>
      <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
    </InputAdornment>
  );
  const [activityTask, setActivityTask] = useState('');
  const [externalComment, setExternalComment] = useState('');
  const [internalComment, setInternalComment] = useState('');
  const [isNonBillable, setIsNonBillable] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  // ── Date ────────────────────────────────────────────────────────────────
  const [date, setDate] = useState<dayjs.Dayjs | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const handleDateChange = (newDate: unknown) => {
    setDate(newDate as dayjs.Dayjs | null);
    setDatePickerOpen(false);
  };

  // ── Status search field ─────────────────────────────────────────────────
  const [statusInput, setStatusInput] = useState('');
  const [statusValue, setStatusValue] = useState('');
  const [statusOptionsOpen, setStatusOptionsOpen] = useState(false);
  const [statusFiltered, setStatusFiltered] = useState<{ id: string; label: string }[]>([]);
  const statusDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const statusOptions = statuses?.items
    ? statuses.items
        .filter((s) => s.isActive)
        .map((s) => ({ id: String(s.id), label: s.displayName || s.name }))
    : [];

  const handleStatusInputChange = useCallback(
    (value: string) => {
      setStatusInput(value);
      setStatusValue('');
      if (statusDebounceRef.current) clearTimeout(statusDebounceRef.current);
      statusDebounceRef.current = setTimeout(() => {
        const q = value.trim().toLowerCase();
        const next = q
          ? statusOptions.filter((o) => o.label.toLowerCase().includes(q))
          : statusOptions;
        setStatusFiltered(next);
        setStatusOptionsOpen(next.length > 0);
      }, 150);
    },
    [statusOptions],
  );

  const handleStatusSelect = useCallback((opt: { id: string; label: string }) => {
    setStatusInput(opt.label);
    setStatusValue(opt.id);
    setStatusOptionsOpen(false);
    setStatusFiltered([]);
  }, []);

  const handleStatusClear = useCallback(() => {
    setStatusInput('');
    setStatusValue('');
    setStatusOptionsOpen(false);
    setStatusFiltered([]);
  }, []);

  // ── Time Entry Template search field ─────────────────────────────────────
  const [templateInput, setTemplateInput] = useState('');
  const [templateValue, setTemplateValue] = useState('');
  const [templateOptionsOpen, setTemplateOptionsOpen] = useState(false);
  const [templateFiltered, setTemplateFiltered] = useState<
    {
      id: string;
      name: string;
      description: string;
      ticketStatus: string;
      weekStartDate: string;
      entries: IConfigTimeEntryLine[];
      externalComment: string;
      internalComment: string;
      nonBillable: boolean;
    }[]
  >([]);
  const templateDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const templateOptions = timeEntryTemplates?.items
    ? timeEntryTemplates.items
        .filter((t) => t.active)
        .map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description || '',
          ticketStatus: t.ticketStatus || '',
          weekStartDate: t.weekStartDate || '',
          entries: t.entries,
          externalComment: t.externalComment || '',
          internalComment: t.internalComment || '',
          nonBillable: t.nonBillable ?? false,
        }))
    : [];

  const handleTemplateInputChange = useCallback(
    (value: string) => {
      setTemplateInput(value);
      setTemplateValue('');
      if (templateDebounceRef.current) clearTimeout(templateDebounceRef.current);
      templateDebounceRef.current = setTimeout(() => {
        const q = value.trim().toLowerCase();
        const next = q
          ? templateOptions.filter((o) => o.name.toLowerCase().includes(q))
          : templateOptions;
        setTemplateFiltered(next);
        setTemplateOptionsOpen(next.length > 0);
      }, 150);
    },
    [templateOptions],
  );

  const handleTemplateSelect = useCallback(
    (opt: (typeof templateOptions)[number]) => {
      setTemplateInput(opt.name);
      setTemplateValue(opt.id);
      setTemplateOptionsOpen(false);
      setTemplateFiltered([]);

      // Populate fields from the selected template's config
      if (opt.weekStartDate) {
        setDate(dayjs(opt.weekStartDate));
      }
      if (opt.entries?.[0]) {
        const entry = opt.entries[0];
        setBillingCode(entry.billingCode || '');
        setActivityTask(entry.activityTask || '');
        // Sum the whole weekly entry (mon–sun hours) into a single H:MM duration.
        // A trailing "HH:MM duration" marker in the description (written by the
        // Save-as-Template flow) overrides with exact hours + minutes.
        const totalHours =
          (entry.mon || 0) +
          (entry.tue || 0) +
          (entry.wed || 0) +
          (entry.thu || 0) +
          (entry.fri || 0) +
          (entry.sat || 0) +
          (entry.sun || 0);
        const durationMarker = /(\d+):(\d{2}) duration/.exec(opt.description || '');
        if (durationMarker) {
          setDuration(`${String(Number(durationMarker[1])).padStart(2, '0')}:${durationMarker[2]}`);
        } else {
          setDuration(totalHours > 0 ? `${totalHours}:00` : '');
        }
      }
      if (opt.externalComment) {
        setExternalComment(opt.externalComment);
      }
      if (opt.internalComment) {
        setInternalComment(opt.internalComment);
      }
      if (typeof opt.nonBillable === 'boolean') {
        setIsNonBillable(opt.nonBillable);
      }
      if (opt.ticketStatus) {
        // The template stores the status displayName; look up the matching active status
        const match = statusOptions.find(
          (s) => s.label.toLowerCase() === opt.ticketStatus.toLowerCase(),
        );
        setStatusValue(match ? match.id : '');
        setStatusInput(match ? match.label : opt.ticketStatus);
      }
    },
    [statusOptions],
  );

  // Template name typing — used when saving as a new template (no lookup)
  const handleTemplateNameChange = useCallback((value: string) => {
    setTemplateInput(value);
    setTemplateValue('');
  }, []);

  const handleTemplateClear = useCallback(() => {
    setTemplateInput('');
    setTemplateValue('');
    setTemplateOptionsOpen(false);
    setTemplateFiltered([]);
  }, []);

  // ── Required field validation (same pattern as CommentWindow) ───────────
  const reqError = useFieldError();
  const [touched, setTouched] = useState<{
    template?: boolean;
    status?: boolean;
    date?: boolean;
    duration?: boolean;
    billingCode?: boolean;
    activityTask?: boolean;
    externalComment?: boolean;
    internalComment?: boolean;
    templateName?: boolean;
    templateDescription?: boolean;
  }>({});
  const [requiredErrors, setRequiredErrors] = useState<{
    template?: string;
    status?: string;
    date?: string;
    duration?: string;
    billingCode?: string;
    activityTask?: string;
    externalComment?: string;
    internalComment?: string;
    templateName?: string;
    templateDescription?: string;
  }>({});

  const validateRequired = (): typeof requiredErrors => {
    const errs: typeof requiredErrors = {};
    // Save-as-template mode: template name is required, existing template lookup is not
    if (saveAsTemplate && !templateInput.trim()) errs.templateName = 'required';
    if (saveAsTemplate && !newTemplateDescription.trim()) errs.templateDescription = 'required';
    // Existing-template mode: a template must be selected
    if (!saveAsTemplate && !templateValue) errs.template = 'required';
    if (!statusValue) errs.status = 'required';
    if (!date) errs.date = 'required';
    if (
      !duration ||
      (duration.split(':').map(Number)[0] === 0 && duration.split(':').map(Number)[1] === 0)
    ) {
      errs.duration = 'required';
    }
    if (!billingCode) errs.billingCode = 'required';
    if (!activityTask.trim()) errs.activityTask = 'required';
    if (!externalComment.trim()) errs.externalComment = 'required';
    if (!internalComment.trim()) errs.internalComment = 'required';
    return errs;
  };

  // ── Required-field error renderers ──────────────────────────────────────
  const templateError = reqError(touched.template, requiredErrors.template);
  const templateNameError = reqError(touched.templateName, requiredErrors.templateName);
  const templateDescriptionError = reqError(
    touched.templateDescription,
    requiredErrors.templateDescription,
  );
  const statusError = reqError(touched.status, requiredErrors.status);
  const dateError = reqError(touched.date, requiredErrors.date);
  const durationError = reqError(touched.duration, requiredErrors.duration);
  const billingCodeError = reqError(touched.billingCode, requiredErrors.billingCode);
  const activityTaskError = reqError(touched.activityTask, requiredErrors.activityTask);
  const externalCommentError = reqError(touched.externalComment, requiredErrors.externalComment);
  const internalCommentError = reqError(touched.internalComment, requiredErrors.internalComment);

  // ── Search icon adornment ────────────────────────────────────────────────
  const searchAdornment = (hasValue: boolean, onClear: () => void) => (
    <InputAdornment position='end'>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {hasValue ? (
          <ClearIcon
            onClick={onClear}
            sx={{ fontSize: 18, color: 'text.primary', cursor: 'pointer' }}
          />
        ) : (
          <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
        )}
      </Box>
    </InputAdornment>
  );

  // ── Reset fields when dialog opens ──────────────────────────────────────
  useEffect(() => {
    if (open) {
      setDuration('');
      setBillingCode('');
      setBcInput('');
      setBcOpen(false);
      setBcFiltered([]);
      setActivityTask('');
      setExternalComment('');
      setInternalComment('');
      setIsNonBillable(false);
      setDate(null);
      setFiles([]);
      setStatusInput('');
      setStatusValue('');
      setTemplateInput('');
      setTemplateValue('');
      setTemplateOptionsOpen(false);
      setTemplateFiltered([]);
      setStatusOptionsOpen(false);
      setStatusFiltered([]);
      setSaveAsTemplate(false);
      setNewTemplateDescription('');
      setNewTemplateActive(true);
      setIsSavingTemplate(false);
      setTouched({});
      setRequiredErrors({});
    }
  }, [open]);

  // ── Save handler ────────────────────────────────────────────────────────
  const handleSave = async () => {
    setTouched({
      template: true,
      status: true,
      date: true,
      duration: true,
      billingCode: true,
      activityTask: true,
      externalComment: true,
      internalComment: true,
      templateName: true,
      templateDescription: true,
    });
    const errs = validateRequired();
    setRequiredErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const durParts = duration.split(':').map(Number);
    const durH = isNaN(durParts[0]) ? 0 : durParts[0];
    const durM = isNaN(durParts[1]) ? 0 : durParts[1];

    // Save-as-template: save the new template to config first; on failure, do not post the entry.
    if (saveAsTemplate) {
      try {
        setIsSavingTemplate(true);
        const now = new Date().toISOString();
        const currentUserName = user ? `${user.firstName} ${user.lastName}`.trim() : '';
        const statusLabel = statusOptions.find((o) => o.id === statusValue)?.label || statusValue;

        // Build a weekly entry: all duration hours are allocated to Monday.
        // Minutes are preserved in the description (mon is a whole-hour number)
        // so the configuration table can render the full H:MM duration.
        const descriptionParts: string[] = [newTemplateDescription.trim()];
        if (durM > 0) descriptionParts.push(`${durH}:${String(durM).padStart(2, '0')} duration`);
        const newTemplate: IConfigTimeEntryTemplate = {
          id: crypto.randomUUID(),
          name: templateInput.trim(),
          description: descriptionParts.filter(Boolean).join(' '),
          active: newTemplateActive,
          ticketStatus: statusLabel,
          weekStartDate: date ? date.format('YYYY-MM-DD') : '',
          entries: [
            {
              id: '',
              billingCode: billingCode || '',
              activityTask: activityTask || '',
              nonBillable: isNonBillable,
              mon: durH,
              tue: 0,
              wed: 0,
              thu: 0,
              fri: 0,
              sat: 0,
              sun: 0,
            },
          ],
          externalComment: externalComment || '',
          internalComment: internalComment || '',
          nonBillable: isNonBillable,
          createdBy: currentUserName,
          createdAt: now,
        };
        await saveSection('timeEntryTemplates', {
          items: [...(timeEntryTemplates?.items ?? []), newTemplate],
        });
        // Pre-select the just-saved template in the Time Entry Template field
        setTemplateValue(newTemplate.id);
        setTemplateInput(newTemplate.name);
      } catch {
        setIsSavingTemplate(false);
        notify.error('Failed to save template');
        return;
      }
      setIsSavingTemplate(false);
    }

    try {
      await createTimeEntry({
        ticketType: incident.ticketType,
        ticketId: incident.id,
        date: date ? date.format('YYYY-MM-DD') : '',
        hours: durH,
        minutes: durM,
        billingCode: billingCode || undefined,
        activityTask: activityTask || undefined,
        externalComment: externalComment || undefined,
        internalComment: internalComment || undefined,
        isNonBillable,
        createdBy: user?.email || '',
      }).unwrap();
      onSuccess();
      onClose();
    } catch {
      notify.error('Failed to add time entry');
    }
  };

  const footer = (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
      <Button variant='outlined' onClick={onClose}>
        Cancel
      </Button>
      <Button variant='contained' onClick={handleSave} disabled={isLoading || isSavingTemplate}>
        {isSavingTemplate ? 'Saving Template...' : 'Save'}
      </Button>
    </Box>
  );

  const fieldBaseSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 1.5,
      bgcolor: alpha(TIME_ENTRY_ACCENT, 0.03),
      '& fieldset': {
        borderColor: alpha(TIME_ENTRY_ACCENT, 0.3),
        borderWidth: 1.5,
      },
      '&:hover fieldset': {
        borderColor: TIME_ENTRY_ACCENT,
      },
      '&.Mui-focused fieldset': {
        borderColor: TIME_ENTRY_ACCENT,
        borderWidth: 2,
      },
      '&.Mui-error fieldset': {
        borderColor: '#d32f2f',
      },
    },
  };

  // Date picker textField style overrides (style-only object — MUI X's
  // slotProps.textField does not accept MuiTextField props like fullWidth;
  // fullWidth/full-height styling is applied on the wrapping Box instead)
  const datePickerSx: SystemStyleObject = {
    ...fieldBaseSx,
    // Match the Add Time Entry Template dialog's Date field
    // (MUI X renders a PickersOutlinedInput, not MuiOutlinedInput-root)
    '& .MuiPickersOutlinedInput-root': {
      borderRadius: '8px',
      '& fieldset': {
        borderColor: TIME_ENTRY_ACCENT,
      },
      '&:hover fieldset': {
        borderColor: TIME_ENTRY_ACCENT,
      },
      '&.Mui-focused fieldset': {
        borderColor: TIME_ENTRY_ACCENT,
        borderWidth: 2,
      },
    },
    '& .MuiInputBase-root': { borderRadius: '8px' },
    // Fill the grid column like the sibling fields (MUI X's slotProps
    // accept style props on textField, not fullWidth)
    width: '100%',
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      headerBackground={`linear-gradient(135deg, ${darken(TIME_ENTRY_ACCENT, 0.18)} 0%, ${TIME_ENTRY_ACCENT} 100%)`}
      headerTextColor='#fff'
      title={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 1.5,
              bgcolor: 'rgba(255,255,255,0.18)',
              border: '1px solid rgba(255,255,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AccessTimeIcon sx={{ fontSize: '1.1rem', color: '#fff' }} />
          </Box>
          <Box>
            <Typography
              sx={{ fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.3, color: '#fff' }}
            >
              Time entry
            </Typography>
            <Typography
              sx={{
                fontSize: '0.78rem',
                color: 'rgba(255,255,255,0.85)',
                lineHeight: 1.3,
              }}
            >
              Add a time entry to this ticket
            </Typography>
          </Box>
        </Box>
      }
      footer={footer}
      maxWidth='sm'
    >
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Save as Template toggle — above the fields; header left, switch after label */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              px: 2,
              py: 1,
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 1.5,
            }}
          >
            <Typography sx={{ fontSize: '0.85rem', color: '#374151', whiteSpace: 'nowrap' }}>
              Save as Template
            </Typography>
            <Switch
              checked={saveAsTemplate}
              onChange={(e) => setSaveAsTemplate(e.target.checked)}
              size='small'
              color='primary'
            />
            {saveAsTemplate && (
              <Box sx={{ ml: 'auto' }}>
                <FormControlLabel
                  labelPlacement='end'
                  control={
                    <Switch
                      checked={newTemplateActive}
                      onChange={(e) => setNewTemplateActive(e.target.checked)}
                      size='small'
                      color='primary'
                    />
                  }
                  label={
                    <Typography
                      sx={{ fontSize: '0.85rem', color: '#374151', whiteSpace: 'nowrap' }}
                    >
                      Active
                    </Typography>
                  }
                />
              </Box>
            )}
          </Box>

          {/* Time Entry Template + Status — side by side */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <Box sx={{ position: 'relative' }}>
              {saveAsTemplate ? (
                // Save-as-template: plain text field for the new template name
                <TextField
                  label='Template Name'
                  placeholder='Enter template name'
                  value={templateInput}
                  onChange={(e) => handleTemplateNameChange(e.target.value)}
                  error={Boolean(templateNameError)}
                  helperText={templateNameError}
                  required
                  fullWidth
                  size='small'
                  sx={fieldBaseSx}
                />
              ) : (
                // Existing-template lookup
                <TextField
                  label='Time Entry Template'
                  required
                  placeholder='Search templates...'
                  value={templateInput}
                  onChange={(e) => handleTemplateInputChange(e.target.value)}
                  onFocus={() => {
                    const q = templateInput.trim().toLowerCase();
                    const next = q
                      ? templateOptions.filter((o) => o.name.toLowerCase().includes(q))
                      : templateOptions;
                    setTemplateFiltered(next);
                    if (next.length > 0) setTemplateOptionsOpen(true);
                  }}
                  onBlur={() => {
                    setTouched((t) => ({ ...t, template: true }));
                    setTimeout(() => setTemplateOptionsOpen(false), 200);
                  }}
                  error={Boolean(templateError)}
                  helperText={templateError}
                  fullWidth
                  size='small'
                  sx={fieldBaseSx}
                  slotProps={{
                    input: {
                      endAdornment: searchAdornment(templateInput.length > 0, handleTemplateClear),
                    },
                  }}
                />
              )}
              {!saveAsTemplate && templateOptionsOpen && templateFiltered.length > 0 && (
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
                  {templateFiltered.map((opt) => (
                    <Tooltip key={opt.id} title={opt.description || ''} arrow placement='left'>
                      <Box
                        component='div'
                        role='button'
                        tabIndex={0}
                        onClick={() => handleTemplateSelect(opt)}
                        sx={{
                          px: 1.5,
                          py: 1,
                          cursor: 'pointer',
                          fontSize: '0.84rem',
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          '&:last-child': { borderBottom: 'none' },
                          '&:hover': { bgcolor: alpha(TIME_ENTRY_ACCENT, 0.08) },
                        }}
                      >
                        {opt.name}
                      </Box>
                    </Tooltip>
                  ))}
                </Paper>
              )}
            </Box>
            <Box sx={{ position: 'relative' }}>
              <TextField
                label='Status'
                required
                placeholder='Search statuses...'
                value={statusInput}
                onChange={(e) => handleStatusInputChange(e.target.value)}
                onFocus={() => {
                  const q = statusInput.trim().toLowerCase();
                  const next = q
                    ? statusOptions.filter((o) => o.label.toLowerCase().includes(q))
                    : statusOptions;
                  setStatusFiltered(next);
                  if (next.length > 0) setStatusOptionsOpen(true);
                }}
                onBlur={() => {
                  setTouched((t) => ({ ...t, status: true }));
                  setTimeout(() => setStatusOptionsOpen(false), 200);
                }}
                error={Boolean(statusError)}
                helperText={statusError}
                fullWidth
                size='small'
                sx={fieldBaseSx}
                slotProps={{
                  input: {
                    endAdornment: searchAdornment(statusInput.length > 0, handleStatusClear),
                  },
                }}
              />
              {statusOptionsOpen && statusFiltered.length > 0 && (
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
                  {statusFiltered.map((opt) => (
                    <Box
                      key={opt.id}
                      onClick={() => handleStatusSelect(opt)}
                      sx={{
                        px: 1.5,
                        py: 1,
                        cursor: 'pointer',
                        fontSize: '0.84rem',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:last-child': { borderBottom: 'none' },
                        '&:hover': { bgcolor: alpha(TIME_ENTRY_ACCENT, 0.08) },
                      }}
                    >
                      {opt.label}
                    </Box>
                  ))}
                </Paper>
              )}
            </Box>
          </Box>

          {/* New template description — shown when saving as a template */}
          {saveAsTemplate && (
            <Box>
              <RichTextEditor
                value={{ segments: parseRichText(newTemplateDescription).segments }}
                onChange={(value) => setNewTemplateDescription(serializeRichText(value.segments))}
                showFooterActions={false}
                title='Description'
                required
                error={Boolean(templateDescriptionError)}
              />
              {templateDescriptionError && (
                <Typography sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                  {templateDescriptionError}
                </Typography>
              )}
            </Box>
          )}

          {/* Date + Duration — side by side */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <Box sx={{ width: '100%' }}>
              <DatePicker
                label='Date'
                value={date}
                onChange={handleDateChange}
                open={datePickerOpen}
                onOpen={() => setDatePickerOpen(true)}
                onClose={() => setDatePickerOpen(false)}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    required: true,
                    sx: datePickerSx,
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
                value={duration}
                onChange={setDuration}
                error={Boolean(durationError)}
                helperText={durationError}
                sx={{ ...fieldBaseSx, width: '100%' }}
              />
            </Box>
          </Box>

          {/* Billing Code / Project + Activity / Task — side by side */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            {/* Billing Code — searchable field styled like the Add Time Entry Template dialog */}
            <Box sx={{ position: 'relative' }}>
              <TextField
                label='Billing Code'
                size='small'
                fullWidth
                required
                placeholder='Search billing code...'
                value={bcInput}
                onChange={handleBillingCodeInputChange}
                onFocus={handleBillingCodeFocus}
                onBlur={handleBillingCodeBlur}
                error={Boolean(billingCodeError)}
                helperText={billingCodeError}
                sx={fieldBaseSx}
                slotProps={{ input: { endAdornment: billingCodeEndAdornment } }}
              />
              {bcOpen && bcFiltered.length > 0 && (
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
                  {bcFiltered.map((opt) => (
                    <Box
                      key={opt.value}
                      onClick={() => handleBillingCodeSelect(opt)}
                      sx={{
                        px: 1.5,
                        py: 1,
                        cursor: 'pointer',
                        fontSize: '0.84rem',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:last-child': { borderBottom: 'none' },
                        '&:hover': { bgcolor: alpha(TIME_ENTRY_ACCENT, 0.08) },
                      }}
                    >
                      {opt.label}
                    </Box>
                  ))}
                </Paper>
              )}
            </Box>
            <Box>
              <TextField
                label='Activity / Task'
                required
                value={activityTask}
                onChange={(e) => setActivityTask(e.target.value)}
                size='small'
                fullWidth
                error={Boolean(activityTaskError)}
                helperText={activityTaskError}
                sx={fieldBaseSx}
              />
            </Box>
          </Box>

          {/* External Comment — RichTextEditor */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <RichTextEditor
              value={{ segments: parseRichText(externalComment).segments }}
              onChange={(value) => setExternalComment(serializeRichText(value.segments))}
              showFooterActions={false}
              title='External Comment'
              required
              error={Boolean(externalCommentError)}
            />
            {externalCommentError && (
              <Typography sx={{ color: 'error.main', fontSize: '0.75rem' }}>
                {externalCommentError}
              </Typography>
            )}
          </Box>

          {/* Internal Comment — RichTextEditor */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <RichTextEditor
              value={{ segments: parseRichText(internalComment).segments }}
              onChange={(value) => setInternalComment(serializeRichText(value.segments))}
              showFooterActions={false}
              title='Internal Comment'
              required
              error={Boolean(internalCommentError)}
            />
            {internalCommentError && (
              <Typography sx={{ color: 'error.main', fontSize: '0.75rem' }}>
                {internalCommentError}
              </Typography>
            )}
          </Box>

          {/* Non-billable toggle */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 0.25,
            }}
          >
            <Typography sx={{ fontSize: '0.85rem', color: '#374151' }}>Non-billable</Typography>
            <Switch
              size='small'
              color='primary'
              checked={isNonBillable}
              onChange={(e) => setIsNonBillable(e.target.checked)}
            />
          </Box>

          {/* File Upload */}
          <Box
            onClick={() =>
              document.querySelector<HTMLInputElement>('.timeentry-upload-input')?.click()
            }
            sx={{
              border: '2px dashed #ccc',
              borderRadius: 1.5,
              p: '16px 16px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
              bgcolor: alpha(TIME_ENTRY_ACCENT, 0.02),
              '&:hover': {
                borderColor: TIME_ENTRY_ACCENT,
                bgcolor: alpha(TIME_ENTRY_ACCENT, 0.04),
              },
            }}
          >
            <input
              type='file'
              className='timeentry-upload-input'
              style={{ display: 'none' }}
              onChange={(e) => {
                const selected = Array.from(e.target.files || []);
                setFiles((prev) => [...prev, ...selected]);
              }}
            />
            <Box sx={{ mb: 0.75 }}>
              <CloudUploadOutlinedIcon sx={{ fontSize: 24, color: '#9ca3af' }} />
            </Box>
            <Button
              variant='contained'
              size='small'
              sx={{
                bgcolor: TIME_ENTRY_ACCENT,
                '&:hover': { bgcolor: darken(TIME_ENTRY_ACCENT, 0.15) },
                textTransform: 'none',
                px: 3,
                py: 0.75,
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: 1.5,
              }}
            >
              CHOOSE FILE
            </Button>
          </Box>

          {/* Attached files */}
          {files.length > 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151' }}>
                Attached Files ({files.length})
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                {files.map((file, index) => (
                  <Box
                    key={`${file.name}-${index}`}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1,
                      p: 1,
                      borderRadius: 1.5,
                      border: '1px solid #e5e7eb',
                      bgcolor: alpha(TIME_ENTRY_ACCENT, 0.04),
                    }}
                  >
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}
                    >
                      <CloudUploadOutlinedIcon
                        sx={{ fontSize: '1.1rem', color: TIME_ENTRY_ACCENT }}
                      />
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          sx={{
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            color: '#1e293b',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {file.name}
                        </Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>
                          {(file.size / 1024).toFixed(1)} KB
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        p: 0.5,
                        borderRadius: 1,
                        color: '#dc2626',
                        '&:hover': { bgcolor: 'rgba(220, 38, 38, 0.08)' },
                      }}
                    >
                      <DeleteOutlineIcon sx={{ fontSize: '1.1rem' }} />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </LocalizationProvider>
    </Modal>
  );
};

export default TimeEntryWindow;
