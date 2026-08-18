import { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Button, TextField, Typography, Switch, DatePicker } from '../../../../components';
import { alpha, darken, Paper, InputAdornment } from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { useCreateTicketTimeEntryMutation } from '../../../../../services';
import { useAuth, useNotification } from '@serviceops/hooks';
import { useConfiguration } from '@serviceops/confighooks';
import { TicketEntity } from '../types/ticketDetail.types';
import { ConfigFormDialog } from '@serviceops/configdialogs';
import { IncidentStatus } from '@serviceops/interfaces';
import {
  parseRichText,
  serializeRichText,
  RichTextEditor,
} from '../../../../pages/base/Configuration/shared/RichTextEditor';

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

  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [billingCode, setBillingCode] = useState('');
  const [activityTask, setActivityTask] = useState('');
  const [externalComment, setExternalComment] = useState('');
  const [internalComment, setInternalComment] = useState('');
  const [isNonBillable, setIsNonBillable] = useState(false);

  // ── Date ────────────────────────────────────────────────────────────────
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // ── Status search field ─────────────────────────────────────────────────
  const [statusInput, setStatusInput] = useState('');
  const [statusValue, setStatusValue] = useState('');
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
      setHours(0);
      setMinutes(0);
      setBillingCode('');
      setActivityTask('');
      setExternalComment('');
      setInternalComment('');
      setIsNonBillable(false);
      setDate(new Date().toISOString().split('T')[0]);
      setStatusInput('');
      setStatusValue('');
      setTemplateInput('');
      setStatusOptionsOpen(false);
      setStatusFiltered([]);
    }
  }, [open]);

  // ── Save handler ────────────────────────────────────────────────────────
  const handleSave = async (closeAfter = false) => {
    if (hours === 0 && minutes === 0) {
      notify.error('Please enter time spent');
      return;
    }
    try {
      await createTimeEntry({
        ticketType: incident.ticketType,
        ticketId: incident.id,
        date,
        hours,
        minutes,
        billingCode: billingCode || undefined,
        activityTask: activityTask || undefined,
        externalComment: externalComment || undefined,
        internalComment: internalComment || undefined,
        isNonBillable,
        createdBy: user?.email || '',
      }).unwrap();

      if (closeAfter) {
        onSuccess();
      } else {
        setHours(0);
        setMinutes(0);
        setExternalComment('');
        setInternalComment('');
      }
    } catch {
      notify.error('Failed to add time entry');
    }
  };

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
  };

  return (
    <ConfigFormDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSave}
      isEdit={false}
      icon={<AccessTimeIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
      accent={TIME_ENTRY_ACCENT}
      title='Add Time Entry'
      subtitle='Add a time entry to this ticket'
      submitDisabled={false}
      submitLabel='Save'
      hideActions
      maxWidth='sm'
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
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
          slotProps={{
            input: {
              endAdornment: searchAdornment(templateInput.length > 0, handleTemplateClear),
            },
          }}
        />

        {/* Date, Hours, Minutes row */}
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <DatePicker
              label='Date'
              value={date}
              onChange={handleDateChange}
              size='small'
              fullWidth
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <TextField
              label='Hours'
              type='number'
              value={hours}
              onChange={(e) => setHours(Math.max(0, Math.min(24, parseInt(e.target.value) || 0)))}
              size='small'
              fullWidth
              inputProps={{ min: 0, max: 24 }}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <TextField
              label='Minutes'
              type='number'
              value={minutes}
              onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
              size='small'
              fullWidth
              inputProps={{ min: 0, max: 59 }}
            />
          </Box>
        </Box>

        {/* Billing Code & Activity / Task row */}
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <TextField
              label='Billing Code'
              value={billingCode}
              onChange={(e) => setBillingCode(e.target.value)}
              size='small'
              fullWidth
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <TextField
              label='Activity / Task'
              value={activityTask}
              onChange={(e) => setActivityTask(e.target.value)}
              size='small'
              fullWidth
            />
          </Box>
        </Box>

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
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.25 }}
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
            borderRadius: 1,
            p: '24px 16px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
            '&:hover': {
              borderColor: TIME_ENTRY_ACCENT,
              bgcolor: alpha(TIME_ENTRY_ACCENT, 0.02),
            },
          }}
        >
          <input
            type='file'
            className='timeentry-upload-input'
            style={{ display: 'none' }}
            onChange={() => {}}
          />
          <Button
            variant='contained'
            sx={{
              bgcolor: '#2d5ebb',
              '&:hover': { bgcolor: '#1e40af' },
              textTransform: 'none',
              px: 2.5,
              py: 0.5,
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            CHOOSE FILE
          </Button>
        </Box>

        {/* Action Buttons — Cancel + Save only */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            justifyContent: 'flex-end',
            flexDirection: { xs: 'column', sm: 'row' },
            pt: 2,
            mt: 1,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Button
            onClick={onClose}
            variant='outlined'
            sx={{
              textTransform: 'none',
              width: { xs: '100%', sm: 'auto' },
              borderColor: alpha(TIME_ENTRY_ACCENT, 0.4),
              color: darken(TIME_ENTRY_ACCENT, 0.15),
              '&:hover': {
                borderColor: TIME_ENTRY_ACCENT,
                bgcolor: alpha(TIME_ENTRY_ACCENT, 0.04),
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleSave(false)}
            disabled={isLoading}
            variant='contained'
            sx={{
              textTransform: 'none',
              width: { xs: '100%', sm: 'auto' },
              bgcolor: TIME_ENTRY_ACCENT,
              '&:hover': { bgcolor: darken(TIME_ENTRY_ACCENT, 0.15) },
              '&.Mui-disabled': {
                bgcolor: alpha(TIME_ENTRY_ACCENT, 0.4),
              },
            }}
          >
            Save
          </Button>
        </Box>
      </Box>
    </ConfigFormDialog>
  );
};

export default TimeEntryWindow;
