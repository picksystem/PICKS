import { useState, useEffect, useCallback, useMemo } from 'react';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { Alert, Box } from '@serviceops/component';
import { useFieldError } from '@serviceops/hooks';
import { ConfigFormDialog } from '@serviceops/configdialogs';
import { IConfigComposedWorkingTime } from '@serviceops/interfaces';
import { WorkingCalendarSearchField } from '@serviceops/pages/base/Configuration/shared/GenericPanel/components/WorkingCalendarSearchField/WorkingCalendarSearchField';
import { HolidayCalendarSearchField } from '@serviceops/pages/base/Configuration/shared/GenericPanel/components/HolidayCalendarSearchField/HolidayCalendarSearchField';
import { WorkingDayTemplateSearchField } from '@serviceops/pages/base/Configuration/shared/GenericPanel/components/WorkingDayTemplateSearchField/WorkingDayTemplateSearchField';

const ACCENT = '#0369a1';

interface ComposeWorkingTimesFormDialogProps {
  open: boolean;
  /** Existing composed working time rows, used to reject an exact-duplicate
   * compose (same calendar/date-range/template combination). */
  existingComposedTimes?: IConfigComposedWorkingTime[];
  onClose: () => void;
  onSubmit: (data: {
    fromDate: string;
    toDate: string;
    workingCalendar: string;
    holidayCalendar: string;
    workingTimeTemplate: string;
  }) => void;
}

const ComposeWorkingTimesFormDialog = ({
  open,
  existingComposedTimes = [],
  onClose,
  onSubmit,
}: ComposeWorkingTimesFormDialogProps) => {
  const reqError = useFieldError();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [workingCalendar, setWorkingCalendar] = useState('');
  const [holidayCalendar, setHolidayCalendar] = useState('');
  const [workingTimeTemplate, setWorkingTimeTemplate] = useState('');
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFromDate('');
    setToDate('');
    setWorkingCalendar('');
    setHolidayCalendar('');
    setWorkingTimeTemplate('');
    setShowValidation(false);
  }, [open]);

  const missingWorkingCalendar = !workingCalendar.trim();
  const missingHolidayCalendar = !holidayCalendar.trim();
  const missingWorkingTimeTemplate = !workingTimeTemplate.trim();

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
        norm(r.workingCalendar ?? r.calendarName) === norm(workingCalendar) &&
        norm(r.holidayCalendar) === norm(holidayCalendar) &&
        norm(r.workingTimeTemplate) === norm(workingTimeTemplate),
    );
    return isDuplicate
      ? `A Composed Working Time from ${fromDate} to ${toDate} already exists for "${workingCalendar}". Please use a different date range.`
      : null;
  }, [
    existingComposedTimes,
    fromDate,
    toDate,
    workingCalendar,
    holidayCalendar,
    workingTimeTemplate,
  ]);

  const handleSubmit = useCallback(() => {
    if (
      !fromDate ||
      !toDate ||
      missingWorkingCalendar ||
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
    onSubmit({
      fromDate,
      toDate,
      workingCalendar: workingCalendar.trim(),
      holidayCalendar: holidayCalendar.trim(),
      workingTimeTemplate: workingTimeTemplate.trim(),
    });
  }, [
    fromDate,
    toDate,
    workingCalendar,
    holidayCalendar,
    workingTimeTemplate,
    missingWorkingCalendar,
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
      editSubtitle='Define a working time composition with a date range and calendar assignment'
      submitLabel='Submit'
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
        <WorkingCalendarSearchField
          label='Calendar'
          value={workingCalendar}
          onChange={setWorkingCalendar}
          onCalendarSelect={(defaults) => setHolidayCalendar(defaults.holidayCalendar)}
          required
          error={Boolean(showValidation && missingWorkingCalendar)}
          helperText={reqError(showValidation, missingWorkingCalendar ? 'required' : undefined)}
        />
        <HolidayCalendarSearchField
          label='Holiday calendar'
          value={holidayCalendar}
          onChange={setHolidayCalendar}
          required
          error={Boolean(showValidation && missingHolidayCalendar)}
          helperText={reqError(showValidation, missingHolidayCalendar ? 'required' : undefined)}
        />
      </Box>

      <WorkingDayTemplateSearchField
        label='Working time template'
        value={workingTimeTemplate}
        onChange={setWorkingTimeTemplate}
        required
        error={Boolean(showValidation && missingWorkingTimeTemplate)}
        helperText={reqError(showValidation, missingWorkingTimeTemplate ? 'required' : undefined)}
      />
    </ConfigFormDialog>
  );
};

export default ComposeWorkingTimesFormDialog;
