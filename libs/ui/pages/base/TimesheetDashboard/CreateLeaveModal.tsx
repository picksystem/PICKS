import { useState } from 'react';
import dayjs from 'dayjs';
import {
  Stack,
  TextField as MuiTextField,
  Select as MuiSelect,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Modal, Button, Typography, DatePicker } from '../../../components';
import { useSubmitLeaveRequestMutation } from '@serviceops/services';
import { ICreateLeaveRequestInput } from '@serviceops/interfaces';

interface CreateLeaveModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  /** Leave type labels taken from the user's balances (drives the type dropdown). */
  leaveTypes: string[];
}

/**
 * "Create Time-Off" submit dialog. Posts a new leave request via the
 * /api/user/leave/requests endpoint and refreshes the dashboard's leave data.
 */
const CreateLeaveModal = ({ open, onClose, onSuccess, leaveTypes }: CreateLeaveModalProps) => {
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submit, { isLoading }] = useSubmitLeaveRequestMutation();

  const reset = () => {
    setLeaveType('');
    setStartDate('');
    setEndDate('');
    setReason('');
  };

  // Inclusive day count between the two selected dates (1 day if only one set).
  const days =
    startDate && endDate ? Math.max(1, dayjs(endDate).diff(dayjs(startDate), 'day') + 1) : 1;

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    const body: ICreateLeaveRequestInput = {
      leaveType: leaveType || leaveTypes[0] || 'Privilege Leave',
      startDate,
      endDate: endDate || startDate,
      days,
      reason: reason.trim() || null,
    };
    try {
      await submit(body).unwrap();
      reset();
      onSuccess();
    } catch {
      // API errors surface through the app-level notification handling.
    }
  };

  const footer = (
    <Stack direction='row' spacing={1} justifyContent='flex-end' sx={{ gap: 1 }}>
      <Button variant='outlined' label='Cancel' onClick={handleClose} />
      <Button
        variant='contained'
        label='Submit request'
        loading={isLoading}
        onClick={handleSubmit}
        disabled={!startDate || !endDate}
      />
    </Stack>
  );

  return (
    <Modal open={open} onClose={handleClose} title='Create Time-Off' footer={footer} maxWidth='sm'>
      <Stack spacing={2.5} sx={{ px: 1 }}>
        <FormControl fullWidth>
          <InputLabel>Leave type</InputLabel>
          <MuiSelect
            label='Leave type'
            value={leaveType || leaveTypes[0] || ''}
            onChange={(e) => setLeaveType(e.target.value)}
          >
            {(leaveTypes.length ? leaveTypes : ['Privilege Leave']).map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </MuiSelect>
        </FormControl>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <DatePicker label='Start date' value={startDate} onChange={setStartDate} required />
          <DatePicker
            label='End date'
            value={endDate}
            onChange={setEndDate}
            minDate={startDate || undefined}
            required
          />
        </Stack>

        <Typography variant='body2' color='text.secondary'>
          Total days: <b>{days}</b>
        </Typography>

        <MuiTextField
          label='Your wish / reason'
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder='e.g. Family function'
          multiline
          minRows={2}
          maxRows={4}
          fullWidth
        />
      </Stack>
    </Modal>
  );
};

export default CreateLeaveModal;
