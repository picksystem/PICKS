import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Switch,
  Button,
} from '@serviceops/component';
import { darken, Dialog, DialogContent, DialogActions, Divider } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { RichTextEditor, parseRichText } from '@serviceops/richtexteditor';
import type { IConfigTimeEntryTemplate, IConfigTimeEntryLine } from '@serviceops/interfaces';

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
  weekStartDate: '',
  entries: [createEmptyEntry()],
  externalComment: '',
  internalComment: '',
});

interface FormState {
  name: string;
  description: string;
  active: boolean;
  ticketStatus: string;
  weekStartDate: string;
  entries: IConfigTimeEntryLine[];
  externalComment: string;
  internalComment: string;
}

export const TimeEntryFormDialog = ({
  open,
  onClose,
  onSubmit,
  isEdit,
  initialData,
  accent = '#0369a1',
}: TimeEntryFormDialogProps) => {
  const [form, setForm] = useState<FormState>(createEmptyForm());
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        description: initialData.description,
        active: initialData.active,
        ticketStatus: initialData.ticketStatus,
        weekStartDate: initialData.weekStartDate,
        entries: initialData.entries.length > 0 ? initialData.entries : [createEmptyEntry()],
        externalComment: initialData.externalComment,
        internalComment: initialData.internalComment,
      });
    } else {
      setForm(createEmptyForm());
    }
  }, [initialData, open]);

  const handleChange = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEntryChange = (
    field: keyof IConfigTimeEntryLine,
    value: string | boolean | number,
  ) => {
    setForm((prev) => ({
      ...prev,
      entries: prev.entries.map((entry, idx) => (idx === 0 ? { ...entry, [field]: value } : entry)),
    }));
  };

  const handleSubmit = () => {
    const template: IConfigTimeEntryTemplate = {
      ...form,
      id: initialData?.id || `template-${Date.now()}`,
    };
    onSubmit(template);
  };

  const handleDateTimeChange = (newValue: Dayjs | null) => {
    handleChange('weekStartDate', newValue ? newValue.format('YYYY-MM-DD HH:mm') : '');
  };

  const handleExternalCommentChange = (value: {
    segments: Array<{ text: string; bold?: boolean; italic?: boolean; underline?: boolean }>;
  }) => {
    const text = value.segments.map((s) => s.text).join('');
    handleChange('externalComment', text);
  };

  const handleInternalCommentChange = (value: {
    segments: Array<{ text: string; bold?: boolean; italic?: boolean; underline?: boolean }>;
  }) => {
    const text = value.segments.map((s) => s.text).join('');
    handleChange('internalComment', text);
  };

  const entry = form.entries[0] || createEmptyEntry();

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
            {/* Row 1: Name, Description */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 2fr',
                gap: 1.5,
                alignItems: 'center',
                mb: 2,
              }}
            >
              <TextField
                label='Name'
                size='small'
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                placeholder='Enter template name'
              />
              <TextField
                label='Description'
                size='small'
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder='Enter description'
              />
            </Box>

            {/* Row 2: Date & Time, Billing Code, Activity/Task */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 1.5,
                mb: 2,
              }}
            >
              <DateTimePicker
                label={
                  <span>
                    Date{' '}
                    <Typography component='span' sx={{ color: 'error.main' }}>
                      *
                    </Typography>
                  </span>
                }
                value={form.weekStartDate ? dayjs(form.weekStartDate) : null}
                onChange={handleDateTimeChange}
                open={datePickerOpen}
                onOpen={() => setDatePickerOpen(true)}
                onClose={() => setDatePickerOpen(false)}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    onClick: () => setDatePickerOpen(true),
                    sx: { '& .MuiOutlinedInput-root': { borderRadius: 1 } },
                  },
                }}
              />
              <TextField
                label='Billing Code'
                size='small'
                value={entry.billingCode}
                onChange={(e) => handleEntryChange('billingCode', e.target.value)}
                placeholder='Select billing code'
                required
              />
              <TextField
                label='Activity/Task'
                size='small'
                value={entry.activityTask}
                onChange={(e) => handleEntryChange('activityTask', e.target.value)}
                placeholder='Select activity/task'
                required
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* External Comment with RichTextEditor */}
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mb: 0.75 }}>
                External Comment{' '}
                <Typography
                  component='span'
                  variant='caption'
                  sx={{ color: 'text.disabled', fontSize: '0.7rem' }}
                >
                  (gets printed on the customer invoice copies, when the time is billable)
                </Typography>
              </Typography>
              <RichTextEditor
                value={parseRichText(form.externalComment)}
                onChange={handleExternalCommentChange}
                accent={accent}
                placeholder='Enter external comment...'
                showFooterActions={false}
              />
            </Box>

            {/* Internal Comment with RichTextEditor */}
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mb: 0.75 }}>
                Internal Comment{' '}
                <Typography
                  component='span'
                  variant='caption'
                  sx={{ color: 'text.disabled', fontSize: '0.7rem' }}
                >
                  (max 60 char)
                </Typography>
              </Typography>
              <RichTextEditor
                value={parseRichText(form.internalComment)}
                onChange={handleInternalCommentChange}
                accent={accent}
                placeholder='Enter internal comment...'
                showFooterActions={false}
              />
            </Box>

            {/* Footer Controls - Active & Non-billable switches */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.active}
                    onChange={(e) => handleChange('active', e.target.checked)}
                    size='small'
                  />
                }
                label={<Typography sx={{ fontSize: '0.8rem' }}>Active</Typography>}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={entry.nonBillable}
                    onChange={(e) => handleEntryChange('nonBillable', e.target.checked)}
                    size='small'
                  />
                }
                label={<Typography sx={{ fontSize: '0.8rem' }}>Non-billable</Typography>}
              />
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
