import { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Button, TextField, Typography, Switch, Modal } from '../../../../components';
import { alpha, darken, Paper, InputAdornment } from '@mui/material';
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
import { useAuth, useNotification } from '@serviceops/hooks';
import { useConfiguration } from '@serviceops/confighooks';
import { TicketEntity } from '../types/ticketDetail.types';
import { IncidentStatus } from '@serviceops/interfaces';
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

const INCIDENT_STATUS_OPTIONS = Object.values(IncidentStatus).map(
  (v): { id: string; label: string } => ({
    id: v,
    label: v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  }),
);

const TimeEntryWindow = ({ open, onClose, incident, onSuccess }: TimeEntryWindowProps) => {
  const { user } = useAuth();
  const [createTimeEntry, { isLoading }] = useCreateTicketTimeEntryMutation();
  const { statuses } = useConfiguration();
  const notify = useNotification();

  const [duration, setDuration] = useState('');
  const [billingCode, setBillingCode] = useState('');
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
  const [statusOptionsOpen, setStatusOptionsOpen] = useState(false);
  const [statusFiltered, setStatusFiltered] = useState<{ id: string; label: string }[]>([]);
  const statusDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const statusesFromConfig = statuses?.items
    ? statuses.items
        .filter((s) => s.isActive)
        .map((s) => ({ id: String(s.id), label: s.displayName || s.name }))
    : [];

  const mergedStatusOptions =
    statusesFromConfig.length > 0 ? statusesFromConfig : INCIDENT_STATUS_OPTIONS;

  const handleStatusInputChange = useCallback(
    (value: string) => {
      setStatusInput(value);
      if (statusDebounceRef.current) clearTimeout(statusDebounceRef.current);
      statusDebounceRef.current = setTimeout(() => {
        const q = value.trim().toLowerCase();
        const next = q
          ? mergedStatusOptions.filter((o) => o.label.toLowerCase().includes(q))
          : mergedStatusOptions;
        setStatusFiltered(next);
        setStatusOptionsOpen(next.length > 0);
      }, 150);
    },
    [mergedStatusOptions],
  );

  const handleStatusSelect = useCallback((opt: { id: string; label: string }) => {
    setStatusInput(opt.label);
    setStatusOptionsOpen(false);
    setStatusFiltered([]);
  }, []);

  const handleStatusClear = useCallback(() => {
    setStatusInput('');
    setStatusOptionsOpen(false);
    setStatusFiltered([]);
  }, []);

  // ── Response Template search field (stub) ────────────────────────────────
  const [templateInput, setTemplateInput] = useState('');

  const handleTemplateInputChange = useCallback((value: string) => {
    setTemplateInput(value);
  }, []);

  const handleTemplateClear = useCallback(() => {
    setTemplateInput('');
  }, []);

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
      setActivityTask('');
      setExternalComment('');
      setInternalComment('');
      setIsNonBillable(false);
      setDate(null);
      setFiles([]);
      setStatusInput('');
      setTemplateInput('');
      setStatusOptionsOpen(false);
      setStatusFiltered([]);
    }
  }, [open]);

  // ── Save handler ────────────────────────────────────────────────────────
  const handleSave = async () => {
    const durParts = duration.split(':').map(Number);
    const durH = isNaN(durParts[0]) ? 0 : durParts[0];
    const durM = isNaN(durParts[1]) ? 0 : durParts[1];
    if (!duration || (durH === 0 && durM === 0)) {
      notify.error('Please enter time spent');
      return;
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
      <Button variant='contained' onClick={handleSave} disabled={isLoading}>
        Save
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
              Add Time Entry
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
          {/* Status — search-style field */}
          <Box sx={{ position: 'relative' }}>
            <TextField
              label='Ticket Status'
              required
              placeholder='Search statuses...'
              value={statusInput}
              onChange={(e) => handleStatusInputChange(e.target.value)}
              onFocus={() => {
                const q = statusInput.trim().toLowerCase();
                const next = q
                  ? mergedStatusOptions.filter((o) => o.label.toLowerCase().includes(q))
                  : mergedStatusOptions;
                setStatusFiltered(next);
                if (next.length > 0) setStatusOptionsOpen(true);
              }}
              onBlur={() => setTimeout(() => setStatusOptionsOpen(false), 200)}
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

          {/* Time Entry Template */}
          <TextField
            label='Time Entry Template'
            placeholder='Search templates...'
            value={templateInput}
            onChange={(e) => handleTemplateInputChange(e.target.value)}
            fullWidth
            size='small'
            sx={fieldBaseSx}
            slotProps={{
              input: {
                endAdornment: searchAdornment(templateInput.length > 0, handleTemplateClear),
              },
            }}
          />

          {/* Date */}
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
                sx: fieldBaseSx,
              },
            }}
          />

          {/* Duration (HH:MM) */}
          <DurationPickerField
            label='Duration'
            required
            value={duration}
            onChange={setDuration}
            sx={fieldBaseSx}
          />

          {/* Billing Code */}
          <TextField
            label='Billing Code'
            value={billingCode}
            onChange={(e) => setBillingCode(e.target.value)}
            size='small'
            fullWidth
            sx={fieldBaseSx}
          />

          {/* Activity / Task */}
          <TextField
            label='Activity / Task'
            value={activityTask}
            onChange={(e) => setActivityTask(e.target.value)}
            size='small'
            fullWidth
            sx={fieldBaseSx}
          />

          {/* External Comment — RichTextEditor */}
          <RichTextEditor
            value={{ segments: parseRichText(externalComment).segments }}
            onChange={(value) => setExternalComment(serializeRichText(value.segments))}
            showFooterActions={false}
            title='External Comment'
            required={false}
          />

          {/* Internal Comment — RichTextEditor */}
          <RichTextEditor
            value={{ segments: parseRichText(internalComment).segments }}
            onChange={(value) => setInternalComment(serializeRichText(value.segments))}
            showFooterActions={false}
            title='Internal Comment'
            required={false}
          />

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
