import { useState, useEffect, useCallback } from 'react';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { Box, TextField } from '@serviceops/component';
import { useFieldError } from '@serviceops/hooks';
import { ConfigFormDialog } from '@serviceops/configdialogs';

const ACCENT = '#0369a1';

interface ComposeWorkingTimesFormDialogProps {
  open: boolean;
  calendarName?: string;
  holidayCalendar?: string;
  workingTimeTemplate?: string;
  onClose: () => void;
  onSubmit: (data: { fromDate: string; toDate: string }) => void;
}

const ComposeWorkingTimesFormDialog = ({
  open,
  calendarName,
  holidayCalendar,
  workingTimeTemplate,
  onClose,
  onSubmit,
}: ComposeWorkingTimesFormDialogProps) => {
  const reqError = useFieldError();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFromDate('');
    setToDate('');
    setShowValidation(false);
  }, [open]);

  const handleSubmit = useCallback(() => {
    if (!fromDate || !toDate) {
      setShowValidation(true);
      return;
    }
    onSubmit({ fromDate, toDate });
  }, [fromDate, toDate, onSubmit]);

  return (
    <ConfigFormDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      isEdit
      icon={<EventNoteIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
      accent={ACCENT}
      title='Compose Working Times'
      editTitle='Compose Working Times'
      editSubtitle={`${holidayCalendar || ''}-${calendarName || ''}`}
      submitLabel='Submit'
      maxWidth='sm'
    >
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <DatePicker
            label='From date *'
            value={fromDate ? dayjs(fromDate) : null}
            onChange={(v: Dayjs | null) => setFromDate(v ? v.format('YYYY-MM-DD') : '')}
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
                error: Boolean(showValidation && !fromDate),
                helperText: reqError(showValidation, !fromDate ? 'required' : undefined),
              },
            }}
          />
          <DatePicker
            label='To date *'
            value={toDate ? dayjs(toDate) : null}
            onChange={(v: Dayjs | null) => setToDate(v ? v.format('YYYY-MM-DD') : '')}
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
                error: Boolean(showValidation && !toDate),
                helperText: reqError(showValidation, !toDate ? 'required' : undefined),
              },
            }}
          />
        </Box>
      </LocalizationProvider>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        <TextField
          label='Calendar'
          size='small'
          value={calendarName ?? ''}
          disabled
          InputProps={{ readOnly: true }}
          fullWidth
        />
        <TextField
          label='Holiday calendar'
          size='small'
          value={holidayCalendar ?? ''}
          disabled
          InputProps={{ readOnly: true }}
          fullWidth
        />
      </Box>

      <TextField
        label='Working time template'
        size='small'
        value={workingTimeTemplate ?? ''}
        disabled
        InputProps={{ readOnly: true }}
        fullWidth
      />
    </ConfigFormDialog>
  );
};

export default ComposeWorkingTimesFormDialog;
