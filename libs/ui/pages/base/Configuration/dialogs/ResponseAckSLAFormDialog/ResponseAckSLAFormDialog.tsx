import { useState, useEffect, useCallback, useRef } from 'react';
import {
  TextField,
  Switch,
  FormControlLabel,
  Typography,
  Select,
  MenuItem,
  Grid,
  Box,
} from '@serviceops/component';
import { FormControl, InputLabel } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useNotification } from '@serviceops/hooks';
import { ResponseAckSLAFormDialogProps } from './util';
import { ConfigFormDialog } from '../ConfigDialogs/ConfigDialogs';
import { parseRichText, serializeRichText, RichTextEditor } from '../../shared/RichTextEditor';

// P1-P5 may arrive as HH:MM strings (from the GenericPanel duration picker)
// or as legacy numeric hours. Normalize both into the HH:MM string form
// used by the custom dialog's `setNum` handler.
const toHHMM = (v: string | number | undefined): string => {
  if (v === undefined || v === null) return '00:00';
  if (typeof v === 'number') {
    if (!Number.isFinite(v) || v < 0) return '00:00';
    const h = Math.floor(v);
    const m = Math.round((v - h) * 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
  const raw = String(v).trim();
  if (!raw) return '00:00';
  if (/^\d+:\d{1,2}$/.test(raw)) {
    const [hStr, mStr] = raw.split(':');
    const h = parseInt(hStr, 10) || 0;
    const m = parseInt(mStr, 10) || 0;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
  const n = Number(raw);
  if (Number.isFinite(n) && n >= 0) {
    const h = Math.floor(n);
    const m = Math.round((n - h) * 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
  return '00:00';
};

const EMPTY_FORM = {
  ticketTypeId: 0,
  ticketTypeName: '',
  activation: true,
  shortDescription: '',
  internalNote: '',
  p1: '00:15',
  p2: '00:30',
  p3: '01:00',
  p4: '04:00',
  p5: '08:00',
};

const ResponseAckSLAFormDialog = ({
  open,
  editingRow,
  ticketTypes,
  usedTicketTypeIds,
  onClose,
  onSubmit,
}: ResponseAckSLAFormDialogProps) => {
  const { success } = useNotification();
  const [form, setForm] = useState(EMPTY_FORM);
  // Mirror of `form` that updates synchronously inside onChange handlers.
  // The RichTextEditor only fires onChange on blur, so the ref lets handleSubmit
  // always read the latest typed value.
  const formRef = useRef(EMPTY_FORM);

  useEffect(() => {
    if (editingRow) {
      const next = {
        ticketTypeId: editingRow.ticketTypeId,
        ticketTypeName: editingRow.ticketTypeName,
        activation: editingRow.activation ?? editingRow.isActive ?? true,
        shortDescription: editingRow.shortDescription ?? '',
        internalNote: editingRow.internalNote ?? '',
        p1: toHHMM(editingRow.p1),
        p2: toHHMM(editingRow.p2),
        p3: toHHMM(editingRow.p3),
        p4: toHHMM(editingRow.p4),
        p5: toHHMM(editingRow.p5),
      };
      formRef.current = next;
      setForm(next);
    } else {
      formRef.current = EMPTY_FORM;
      setForm(EMPTY_FORM);
    }
  }, [editingRow, open]);

  useEffect(() => {
    formRef.current = form;
  }, [form]);

  const availableTicketTypes = ticketTypes.filter(
    (tt) => !usedTicketTypeIds.includes(tt.id) || tt.id === editingRow?.ticketTypeId,
  );

  const handleTicketTypeChange = (id: number) => {
    const tt = ticketTypes.find((t) => t.id === id);
    setForm((f) => ({ ...f, ticketTypeId: id, ticketTypeName: tt?.displayName ?? tt?.name ?? '' }));
  };

  const setNum = (field: 'p1' | 'p2' | 'p3' | 'p4' | 'p5', raw: string) => {
    const v = parseInt(raw, 10);
    const hours = isNaN(v) || v < 0 ? 0 : v;
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    setForm((f) => ({
      ...f,
      [field]: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
    }));
  };

  const handleSubmit = () => {
    if (!form.ticketTypeId) return;
    const live = formRef.current;
    onSubmit({
      id: editingRow?.id ?? `rack_${Date.now()}`,
      ticketTypeId: live.ticketTypeId,
      ticketTypeName: live.ticketTypeName,
      activation: live.activation,
      shortDescription: live.shortDescription,
      internalNote: live.internalNote,
      p1: live.p1,
      p2: live.p2,
      p3: live.p3,
      p4: live.p4,
      p5: live.p5,
    });
    success('Response / Acknowledgement SLA saved successfully');
  };

  const isEditing = editingRow !== null;

  const handleShortDescriptionChange = useCallback(
    (value: {
      segments: { text: string; bold?: boolean; italic?: boolean; underline?: boolean }[];
    }) => {
      const serialized = serializeRichText(value.segments);
      setForm((f) => {
        const next = { ...f, shortDescription: serialized };
        formRef.current = next;
        return next;
      });
    },
    [],
  );

  const handleInternalNoteChange = useCallback(
    (value: {
      segments: { text: string; bold?: boolean; italic?: boolean; underline?: boolean }[];
    }) => {
      const serialized = serializeRichText(value.segments);
      setForm((f) => {
        const next = { ...f, internalNote: serialized };
        formRef.current = next;
        return next;
      });
    },
    [],
  );

  return (
    <ConfigFormDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      isEdit={isEditing}
      icon={<AccessTimeIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
      accent='#0369a1'
      title='Response / Acknowledgement SLA Row'
      subtitle='Set response time targets (in hours) per priority level'
      submitDisabled={!form.ticketTypeId}
      submitLabel={isEditing ? 'Save' : 'Submit'}
      maxWidth='md'
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

      <Box>
        <RichTextEditor
          value={parseRichText(form.shortDescription ?? '')}
          onChange={handleShortDescriptionChange}
          showFooterActions={false}
          title='Short Description'
        />
      </Box>

      <Box>
        <RichTextEditor
          value={parseRichText(form.internalNote ?? '')}
          onChange={handleInternalNoteChange}
          showFooterActions={false}
          title='Internal note'
        />
      </Box>

      <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: 'text.secondary' }}>
        Response time targets (hours)
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
    </ConfigFormDialog>
  );
};

export default ResponseAckSLAFormDialog;
