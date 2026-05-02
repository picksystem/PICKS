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
  Grid,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { IConfigResponseAckSLARow, ITicketType } from '@serviceops/interfaces';
import { ConfigFormDialog } from './ConfigDialogs';

interface Props {
  open: boolean;
  editingRow: IConfigResponseAckSLARow | null;
  ticketTypes: ITicketType[];
  usedTicketTypeIds: number[];
  onClose: () => void;
  onSubmit: (row: IConfigResponseAckSLARow) => void;
}

const EMPTY_FORM = {
  ticketTypeId: 0,
  ticketTypeName: '',
  activation: true,
  p1: 15,
  p2: 30,
  p3: 60,
  p4: 240,
  p5: 480,
};

const ResponseAckSLAFormDialog = ({
  open,
  editingRow,
  ticketTypes,
  usedTicketTypeIds,
  onClose,
  onSubmit,
}: Props) => {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (editingRow) {
      setForm({
        ticketTypeId: editingRow.ticketTypeId,
        ticketTypeName: editingRow.ticketTypeName,
        activation: editingRow.activation,
        p1: editingRow.p1,
        p2: editingRow.p2,
        p3: editingRow.p3,
        p4: editingRow.p4,
        p5: editingRow.p5,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editingRow, open]);

  const availableTicketTypes = ticketTypes.filter(
    (tt) => !usedTicketTypeIds.includes(tt.id) || tt.id === editingRow?.ticketTypeId,
  );

  const handleTicketTypeChange = (id: number) => {
    const tt = ticketTypes.find((t) => t.id === id);
    setForm((f) => ({ ...f, ticketTypeId: id, ticketTypeName: tt?.displayName ?? tt?.name ?? '' }));
  };

  const setNum = (field: 'p1' | 'p2' | 'p3' | 'p4' | 'p5', raw: string) => {
    const v = parseInt(raw, 10);
    setForm((f) => ({ ...f, [field]: isNaN(v) || v < 0 ? 0 : v }));
  };

  const handleSubmit = () => {
    if (!form.ticketTypeId) return;
    onSubmit({
      id: editingRow?.id ?? `rack_${Date.now()}`,
      ticketTypeId: form.ticketTypeId,
      ticketTypeName: form.ticketTypeName,
      activation: form.activation,
      p1: form.p1,
      p2: form.p2,
      p3: form.p3,
      p4: form.p4,
      p5: form.p5,
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
      accent='#0369a1'
      title='Response / Acknowledgement SLA Row'
      subtitle='Set response time targets (in minutes) per priority level'
      submitDisabled={!form.ticketTypeId}
      submitLabel={isEditing ? 'Save Changes' : 'Add Row'}
      maxWidth='sm'
    >
      {isEditing ? (
        <TextField
          label='Ticket Type'
          value={form.ticketTypeName}
          disabled
          size='small'
          fullWidth
        />
      ) : (
        <FormControl size='small' fullWidth required>
          <InputLabel>Ticket Type</InputLabel>
          <Select
            label='Ticket Type'
            value={form.ticketTypeId || ''}
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
            checked={form.activation}
            onChange={(e) => setForm((f) => ({ ...f, activation: e.target.checked }))}
            color='primary'
          />
        }
        label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>Activation</Typography>}
      />

      <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: 'text.secondary' }}>
        Response time targets (minutes)
      </Typography>

      <Grid container spacing={1.5}>
        {(['p1', 'p2', 'p3', 'p4', 'p5'] as const).map((p) => (
          <Grid key={p} size={{ xs: 6, sm: 'grow' }}>
            <TextField
              label={p.toUpperCase()}
              type='number'
              size='small'
              fullWidth
              value={form[p]}
              onChange={(e) => setNum(p, e.target.value)}
              slotProps={{ htmlInput: { min: 0 } }}
            />
          </Grid>
        ))}
      </Grid>
    </ConfigFormDialog>
  );
};

export default ResponseAckSLAFormDialog;
