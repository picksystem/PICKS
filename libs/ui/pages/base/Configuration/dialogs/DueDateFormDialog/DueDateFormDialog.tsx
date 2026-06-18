import { useState, useEffect } from 'react';
import {
  TextField,
  Switch,
  FormControlLabel,
  Typography,
  Select,
  MenuItem,
  Grid,
} from '@serviceops/component';
import { FormControl, InputLabel } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useNotification } from '@serviceops/hooks';
import { DueDateFormDialogProps } from './util';
import { ConfigFormDialog } from '../ConfigDialogs/ConfigDialogs';

// Legacy custom dialog stores P1-P5 as numeric hours. Newer rows may arrive
// as HH:MM strings (from the GenericPanel duration picker) — normalize those
// back to numeric hours so the legacy TextField still works.
const toNumericHours = (v: string | number | undefined): number => {
  if (v === undefined || v === null) return 0;
  if (typeof v === 'number') return v;
  const raw = String(v).trim();
  if (!raw) return 0;
  if (/^\d+:\d{1,2}$/.test(raw)) {
    const [hStr, mStr] = raw.split(':');
    const h = parseInt(hStr, 10) || 0;
    const m = parseInt(mStr, 10) || 0;
    return h + m / 60;
  }
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
};

const EMPTY_FORM = {
  ticketTypeId: 0,
  ticketTypeName: '',
  activation: true,
  p1: 8,
  p2: 16,
  p3: 24,
  p4: 48,
  p5: 72,
};

const DueDateFormDialog = ({
  open,
  editingRow,
  ticketTypes,
  usedTicketTypeIds,
  onClose,
  onSubmit,
}: DueDateFormDialogProps) => {
  const { success } = useNotification();
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (editingRow) {
      setForm({
        ticketTypeId: editingRow.ticketTypeId,
        ticketTypeName: editingRow.ticketTypeName,
        activation: editingRow.activation ?? false,
        p1: toNumericHours(editingRow.p1),
        p2: toNumericHours(editingRow.p2),
        p3: toNumericHours(editingRow.p3),
        p4: toNumericHours(editingRow.p4),
        p5: toNumericHours(editingRow.p5),
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
      id: editingRow?.id ?? `rdd_${Date.now()}`,
      ticketTypeId: form.ticketTypeId,
      ticketTypeName: form.ticketTypeName,
      activation: form.activation,
      p1: form.p1,
      p2: form.p2,
      p3: form.p3,
      p4: form.p4,
      p5: form.p5,
    });
    success('Due Date SLA saved successfully');
  };

  const isEditing = editingRow !== null;

  return (
    <ConfigFormDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      isEdit={isEditing}
      icon={<AccessTimeIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
      accent='#7c3aed'
      title='Due Date SLA Row'
      subtitle='Set due date targets (in hours) per priority level'
      submitDisabled={!form.ticketTypeId}
      submitLabel={isEditing ? 'Save' : 'Submit'}
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
                {tt.name}
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
        Due date targets (hours)
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

export default DueDateFormDialog;
