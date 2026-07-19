import { useState, useEffect, useCallback, useMemo } from 'react';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { Alert, Box, TextField } from '@serviceops/component';
import { useFieldError } from '@serviceops/hooks';
import { ConfigFormDialog } from '@serviceops/configdialogs';
import { IConfigComposedWorkingTime } from '@serviceops/interfaces';

const ACCENT = '#0369a1';

interface ComposeWorkingTimesFormDialogProps {
  open: boolean;
  calendarName?: string;
  holidayCalendar?: string;
  workingTimeTemplate?: string;
  /** Existing composed working time rows across every calendar, used to
   * reject an exact-duplicate compose (same calendar/date-range/template
   * combination). */
  existingComposedTimes?: IConfigComposedWorkingTime[];
  onClose: () => void;
  onSubmit: (data: { fromDate: string; toDate: string }) => void;
}

const ComposeWorkingTimesFormDialog = ({
  open,
  calendarName,
  holidayCalendar,
  workingTimeTemplate,
  existingComposedTimes = [],
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

  // Working calendar / Holiday calendar / Working time template are all
  // mandatory for a compose, but they're read-only here (sourced from the
  // selected Working Calendar row) — so "missing" means the calendar itself
  // hasn't had a Holiday Calendar / Working Time Template assigned yet.
  const missingCalendarName = !String(calendarName ?? '').trim();
  const missingHolidayCalendar = !String(holidayCalendar ?? '').trim();
  const missingWorkingTimeTemplate = !String(workingTimeTemplate ?? '').trim();

  // From date, To date, Working calendar, Holiday calendar and Working time
  // template are all "Not allowed" for duplicates — the full combination of
  // all five must be unique, so composing the exact same range for the same
  // calendar/holiday-calendar/template twice is rejected.
  const duplicateMessage = useMemo(() => {
    if (!fromDate || !toDate) return null;
    const norm = (v: unknown) =>
      String(v ?? '')
        .trim()
        .toLowerCase();
    const isDuplicate = existingComposedTimes.some(
      (r) =>
        norm(r.fromDate) === norm(fromDate) &&
        norm(r.toDate) === norm(toDate) &&
        norm(r.workingCalendar ?? r.calendarName) === norm(calendarName) &&
        norm(r.holidayCalendar) === norm(holidayCalendar) &&
        norm(r.workingTimeTemplate) === norm(workingTimeTemplate),
    );
    return isDuplicate
      ? `A Composed Working Time from ${fromDate} to ${toDate} already exists for "${calendarName ?? ''}". Please use a different date range.`
      : null;
  }, [existingComposedTimes, fromDate, toDate, calendarName, holidayCalendar, workingTimeTemplate]);

  const handleSubmit = useCallback(() => {
    if (
      !fromDate ||
      !toDate ||
      missingCalendarName ||
      missingHolidayCalendar ||
      missingWorkingTimeTemplate
    ) {
      setShowValidation(true);
      return;
    }
    if (duplicateMessage) {
      setShowValidation(true);
      return;
    }
    onSubmit({ fromDate, toDate });
  }, [
    fromDate,
    toDate,
    missingCalendarName,
    missingHolidayCalendar,
    missingWorkingTimeTemplate,
    duplicateMessage,
    onSubmit,
  ]);

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
      submitLabel='Compose Working Times'
      maxWidth='sm'
    >
      {showValidation && duplicateMessage && (
        <Alert severity='error' variant='outlined' sx={{ mb: 1 }}>
          {duplicateMessage}
        </Alert>
      )}

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
          required
          error={Boolean(showValidation && missingCalendarName)}
          helperText={reqError(showValidation, missingCalendarName ? 'required' : undefined)}
        />
        <TextField
          label='Holiday calendar'
          size='small'
          value={holidayCalendar ?? ''}
          disabled
          InputProps={{ readOnly: true }}
          fullWidth
          required
          error={Boolean(showValidation && missingHolidayCalendar)}
          helperText={reqError(showValidation, missingHolidayCalendar ? 'required' : undefined)}
        />
      </Box>

      <TextField
        label='Working time template'
        size='small'
        value={workingTimeTemplate ?? ''}
        required
        error={Boolean(showValidation && missingWorkingTimeTemplate)}
        helperText={reqError(showValidation, missingWorkingTimeTemplate ? 'required' : undefined)}
        disabled
        InputProps={{ readOnly: true }}
        fullWidth
      />
    </ConfigFormDialog>
  );
};

export default ComposeWorkingTimesFormDialog;
