import { useState, useEffect } from 'react';
import {
  TextField,
  Switch,
  FormControlLabel,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { IConfigActivationRow, ITicketType } from '@serviceops/interfaces';
import { ConfigFormDialog } from './ConfigDialogs';

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
    <ConfigFormDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      isEdit={isEditing}
      icon={<AccessTimeIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
      accent='#b45309'
      title={title}
      subtitle='Configure ticket type activation for this feature'
      submitDisabled={!ticketTypeId}
      submitLabel={isEditing ? 'Save Changes' : 'Add Row'}
      maxWidth='xs'
    >
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
        label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>Activation</Typography>}
      />
    </ConfigFormDialog>
  );
};

export default ActivationRowFormDialog;
