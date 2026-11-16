import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import {
  alpha,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import { Box, TextField } from '@serviceops/component';
import { DatePickerField } from '../Configuration/shared/GenericPanel/components/DatePickerField/DatePickerField';
import { ConfigFormDialog } from '@serviceops/configdialogs';
import { useSubmitLeaveRequestMutation } from '@serviceops/services';
import { ICreateLeaveRequestInput } from '@serviceops/interfaces';
import { APPROVED_ESTIMATES_ACCENT } from '../Configuration/sections/General/components/ApprovedEstimates/shared/ApprovedEstimatesConfig';
import {
  RichTextEditor,
  parseRichText,
  serializeRichText,
} from '../Configuration/shared/RichTextEditor';

interface CreateLeaveModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  /** Leave type labels taken from the user's balances (drives the type dropdown). */
  leaveTypes: string[];
}

/**
 * "Create Time-Off" submit dialog. Built on the shared ConfigFormDialog shell
 * with the same field styles as the Configuration form dialogs (e.g.
 * "Add Approved Estimate"): a searchable leave-type field, the shared
 * DatePicker, and the Configuration RichTextEditor for the wish/reason.
 * Posts a new leave request via /api/user/leave/requests and refreshes the
 * caller's data.
 */
const CreateLeaveModal = ({ open, onClose, onSuccess, leaveTypes }: CreateLeaveModalProps) => {
  const [leaveType, setLeaveType] = useState('');
  const [typeInput, setTypeInput] = useState('');
  const [typeOptionsOpen, setTypeOptionsOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submit, { isLoading }] = useSubmitLeaveRequestMutation();

  /* The leave types come entirely from the API (the user's balance rows) —
     no hardcoded fallback list. */
  const allTypes = leaveTypes;
  const selected = leaveType || allTypes[0] || '';

  /* Reset the transient search state when the dialog opens, mirroring the
     currently selected type in the input. */
  useEffect(() => {
    if (open) setTypeInput(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const reset = () => {
    setLeaveType('');
    setTypeInput('');
    setTypeOptionsOpen(false);
    setStartDate('');
    setEndDate('');
    setReason('');
  };

  /* Inclusive day count between the two selected dates (1 day when only the
     start date is picked). */
  const days =
    startDate && endDate ? Math.max(1, dayjs(endDate).diff(dayjs(startDate), 'day') + 1) : 1;

  const filteredTypes = typeInput.trim()
    ? allTypes.filter((t) => t.toLowerCase().includes(typeInput.trim().toLowerCase()))
    : allTypes;

  const handleTypeSelect = (t: string) => {
    setLeaveType(t);
    setTypeInput(t);
    setTypeOptionsOpen(false);
  };

  const handleTypeClear = () => {
    setLeaveType('');
    setTypeInput('');
    setTypeOptionsOpen(true);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    const body: ICreateLeaveRequestInput = {
      leaveType: selected,
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

  return (
    <ConfigFormDialog
      open={open}
      onClose={handleClose}
      onSubmit={handleSubmit}
      isEdit={false}
      icon={<EventBusyIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
      accent={APPROVED_ESTIMATES_ACCENT}
      title='Time-Off'
      newTitle='Create Time-Off'
      subtitle='Submit a leave request for approval'
      submitLabel='Submit'
      /* A type must come from the API's balance rows — with no balance
          data there is nothing valid to submit. */
      submitDisabled={!startDate || !selected || isLoading}
      maxWidth='sm'
    >
      {/* Leave type — required searchable field (same pattern as the
          Service Line / Application / Queue fields in the reference
          dialog). */}
      <Box sx={{ position: 'relative' }}>
        <TextField
          label='Leave type'
          placeholder='Search leave types...'
          value={typeInput}
          onChange={(e) => {
            setTypeInput(e.target.value);
            setTypeOptionsOpen(true);
          }}
          onFocus={() => setTypeOptionsOpen(true)}
          onBlur={() => setTimeout(() => setTypeOptionsOpen(false), 200)}
          fullWidth
          size='small'
          required
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position='end'>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {typeInput ? (
                      <ClearIcon
                        onClick={handleTypeClear}
                        sx={{ fontSize: 18, color: 'text.primary', cursor: 'pointer' }}
                      />
                    ) : (
                      <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    )}
                  </Box>
                </InputAdornment>
              ),
            },
          }}
        />
        {typeOptionsOpen && filteredTypes.length > 0 && (
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
              {filteredTypes.map((t) => (
                <ListItem key={t} disablePadding>
                  <ListItemButton
                    onClick={() => handleTypeSelect(t)}
                    sx={{
                      py: 1,
                      px: 1.5,
                      '&:hover': { bgcolor: alpha(APPROVED_ESTIMATES_ACCENT, 0.08) },
                    }}
                  >
                    <ListItemText
                      primary={t}
                      primaryTypographyProps={{ fontSize: '0.84rem', noWrap: true }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Box>

      {/* Dates — the same Configuration DatePickerField used across the
          Configuration form dialogs (one-day leave when the end is left
          blank). */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <DatePickerField label='Start date' value={startDate} onChange={setStartDate} required />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <DatePickerField label='End date (optional)' value={endDate} onChange={setEndDate} />
        </Box>
      </Box>

      {/* Your wish / reason — the Configuration RichTextEditor */}
      <Box sx={{ borderRadius: 1 }}>
        <RichTextEditor
          value={{ segments: parseRichText(reason).segments }}
          onChange={(value) => setReason(serializeRichText(value.segments))}
          showFooterActions={false}
          title='Your wish / reason'
        />
      </Box>
    </ConfigFormDialog>
  );
};

export default CreateLeaveModal;
