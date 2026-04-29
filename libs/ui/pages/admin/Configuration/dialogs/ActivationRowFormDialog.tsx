import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { IConfigActivationRow, ITicketType } from '@serviceops/interfaces';

interface Props {
  open: boolean;
  title: string;
  editingRow: IConfigActivationRow | null;
  ticketTypes: ITicketType[];
  usedTicketTypeIds: number[];
  idPrefix: string;
  onClose: () => void;
  onSubmit: (row: IConfigActivationRow) => void;
}

const ActivationRowFormDialog = ({
  open,
  title,
  editingRow,
  ticketTypes,
  usedTicketTypeIds,
  idPrefix,
  onClose,
  onSubmit,
}: Props) => {
  const [ticketTypeId, setTicketTypeId] = useState(0);
  const [ticketTypeName, setTicketTypeName] = useState('');
  const [activation, setActivation] = useState(true);

  useEffect(() => {
    if (editingRow) {
      setTicketTypeId(editingRow.ticketTypeId);
      setTicketTypeName(editingRow.ticketTypeName);
      setActivation(editingRow.activation);
    } else {
      setTicketTypeId(0);
      setTicketTypeName('');
      setActivation(true);
    }
  }, [editingRow, open]);

  const availableTicketTypes = ticketTypes.filter(
    (tt) => !usedTicketTypeIds.includes(tt.id) || tt.id === editingRow?.ticketTypeId,
  );

  const handleTicketTypeChange = (id: number) => {
    const tt = ticketTypes.find((t) => t.id === id);
    setTicketTypeId(id);
    setTicketTypeName(tt?.displayName ?? tt?.name ?? '');
  };

  const handleSubmit = () => {
    if (!ticketTypeId) return;
    onSubmit({
      id: editingRow?.id ?? `${idPrefix}_${Date.now()}`,
      ticketTypeId,
      ticketTypeName,
      activation,
    });
  };

  const isEditing = editingRow !== null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {isEditing ? `Edit ${title}` : `New ${title}`}
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 0.5 }}>
          {isEditing ? (
            <TextField label='Ticket Type' value={ticketTypeName} disabled size='small' fullWidth />
          ) : (
            <FormControl size='small' fullWidth required>
              <InputLabel>Ticket Type</InputLabel>
              <Select
                label='Ticket Type'
                value={ticketTypeId || ''}
                onChange={(e) => handleTicketTypeChange(Number(e.target.value))}
              >
                {availableTicketTypes.map((tt) => (
                  <MenuItem key={tt.id} value={tt.id}>
                    {tt.displayName || tt.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <FormControlLabel
            control={
              <Switch
                checked={activation}
                onChange={(e) => setActivation(e.target.checked)}
                color='primary'
              />
            }
            label={
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>Activation</Typography>
            }
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', borderRadius: 2 }}>
          Cancel
        </Button>
        <Button
          variant='contained'
          onClick={handleSubmit}
          disabled={!ticketTypeId}
          sx={{ textTransform: 'none', borderRadius: 2 }}
        >
          {isEditing ? 'Save Changes' : 'Add Row'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ActivationRowFormDialog;
