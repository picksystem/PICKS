import { useState } from 'react';
import { Box, Modal, Select, Checkbox, Button, UploadFile } from '../../../../components';
import { TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { IIncident, IncidentStatus } from '@serviceops/interfaces';
import { useCreateTimeEntryMutation } from '../../../../../services';
import { useAuth, useNotification } from '@serviceops/hooks';

interface TimeEntryWindowProps {
  open: boolean;
  onClose: () => void;
  incident: IIncident;
  onSuccess: () => void;
}

const statusOptions = Object.values(IncidentStatus).map((v) => ({
  label: v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  value: v,
}));

const footerSx = {
  display: 'flex',
  gap: 1,
  justifyContent: 'flex-end',
  flexDirection: { xs: 'column' as const, sm: 'row' as const },
};
const contentSx = { display: 'flex', flexDirection: 'column', gap: 2 };
const rowSx = { display: 'flex', gap: 2, flexDirection: { xs: 'column' as const, sm: 'row' as const } };
const fieldSx = { flex: 1, minWidth: 0 };
const dateSx = { flex: 1, minWidth: 0 };
const numSx = { width: { xs: '100%', sm: 100 } };

const TimeEntryWindow = ({ open, onClose, incident, onSuccess }: TimeEntryWindowProps) => {
  const { user } = useAuth();
  const [createTimeEntry, { isLoading }] = useCreateTimeEntryMutation();
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [billingCode, setBillingCode] = useState('');
  const [activityTask, setActivityTask] = useState('');
  const [externalComment, setExternalComment] = useState('');
  const [internalComment, setInternalComment] = useState('');
  const [isNonBillable, setIsNonBillable] = useState(false);
  const notify = useNotification();

  const handleSave = async (closeAfter = false) => {
    if (hours === 0 && minutes === 0) {
      notify.error('Please enter time spent');
      return;
    }
    try {
      await createTimeEntry({
        incidentId: incident.id,
        date: date.toISOString(),
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

  const footer = (
    <Box sx={footerSx}>
      <Button variant='outlined' onClick={onClose}>
        Cancel
      </Button>
      <Button variant='outlined' onClick={() => handleSave(false)} disabled={isLoading}>
        Save
      </Button>
      <Button variant='contained' onClick={() => handleSave(true)} disabled={isLoading}>
        Save & Close
      </Button>
    </Box>
  );

  return (
    <Modal open={open} onClose={onClose} title='Add Time Entry' maxWidth='lg' footer={footer}>
      <Box sx={contentSx}>
        <Box sx={rowSx}>
          <Box sx={fieldSx}>
            <Select
              label='Ticket Status'
              options={statusOptions}
              value={incident.status}
              onChange={() => {}}
            />
          </Box>
          <Box sx={fieldSx}>
            <Select label='Time Entry Template' options={[]} value='' onChange={() => {}} />
          </Box>
        </Box>

        <Box sx={rowSx}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label='Date'
              value={date}
              onChange={(val) => val && setDate(val)}
              slotProps={{ textField: { size: 'small', sx: dateSx } }}
            />
          </LocalizationProvider>
          <TextField
            label='Hours'
            type='number'
            value={hours}
            onChange={(e) => setHours(Math.max(0, Math.min(24, parseInt(e.target.value) || 0)))}
            size='small'
            inputProps={{ min: 0, max: 24 }}
            sx={numSx}
          />
          <TextField
            label='Minutes'
            type='number'
            value={minutes}
            onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
            size='small'
            inputProps={{ min: 0, max: 59 }}
            sx={numSx}
          />
        </Box>

        <Box sx={rowSx}>
          <TextField
            label='Billing Code'
            value={billingCode}
            onChange={(e) => setBillingCode(e.target.value)}
            size='small'
            sx={fieldSx}
          />
          <TextField
            label='Activity / Task'
            value={activityTask}
            onChange={(e) => setActivityTask(e.target.value)}
            size='small'
            sx={fieldSx}
          />
        </Box>

        <TextField
          label='External Comment'
          value={externalComment}
          onChange={(e) => setExternalComment(e.target.value)}
          multiline
          minRows={2}
          maxRows={8}
          size='small'
          fullWidth
        />

        <TextField
          label='Internal Comment'
          value={internalComment}
          onChange={(e) => setInternalComment(e.target.value)}
          multiline
          minRows={2}
          maxRows={8}
          size='small'
          fullWidth
        />

        <Checkbox
          label='Non-billable'
          checked={isNonBillable}
          onChange={() => setIsNonBillable(!isNonBillable)}
        />

        <UploadFile onChange={() => {}} />
      </Box>
    </Modal>
  );
};

export default TimeEntryWindow;
