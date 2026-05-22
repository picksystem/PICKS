import { useState, useEffect } from 'react';
import { Box, Typography, TextField, Switch, Chip } from '@serviceops/component';
import { FormControlLabel, alpha } from '@mui/material';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import { PriorityLevel } from '@serviceops/pages/base/Configuration/sections/Priorities/util';
import { ConfigFormDialog } from '@serviceops/pages/base/Configuration/dialogs/ConfigDialogs/ConfigDialogs';

const PRESET_COLORS = [
  '#b91c1c',
  '#ea580c',
  '#ca8a04',
  '#2563eb',
  '#0f766e',
  '#7c3aed',
  '#db2777',
  '#15803d',
  '#1d4ed8',
  '#374151',
];

interface PriorityFormDialogProps {
  open: boolean;
  editing: PriorityLevel | null;
  onClose: () => void;
  onSave: (data: Partial<PriorityLevel>) => void;
  ticketTypeColumns: { key: string; label: string }[];
}

const PriorityFormDialog = ({
  open,
  editing,
  onClose,
  onSave,
  ticketTypeColumns,
}: PriorityFormDialogProps) => {
  const [form, setForm] = useState<Partial<PriorityLevel>>({});

  useEffect(() => {
    if (!open) return;
    setForm(
      editing
        ? {
            name: editing.name,
            description: editing.description,
            bgColor: editing.bgColor,
            enabledFor: { ...editing.enabledFor },
          }
        : {
            name: '',
            description: '',
            bgColor: '#2563eb',
            enabledFor: Object.fromEntries(ticketTypeColumns.map((t) => [t.key, true])),
          },
    );
  }, [open, editing]);

  return (
    <ConfigFormDialog
      open={open}
      onClose={onClose}
      onSubmit={() => onSave(form)}
      isEdit={!!editing}
      icon={<PriorityHighIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
      accent='#b91c1c'
      title='Priority'
      submitDisabled={!form.name}
      submitLabel={editing ? 'Save Changes' : 'Add Priority'}
      maxWidth='sm'
    >
      <TextField
        label='Priority Name'
        size='small'
        value={form.name ?? ''}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        helperText='e.g. 1-Critical, 2-High, 3-Medium'
        inputProps={{ style: { fontFamily: 'monospace', fontWeight: 700 } }}
        required
      />
      <TextField
        label='Description'
        size='small'
        value={form.description ?? ''}
        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        multiline
        rows={2}
      />

      <Box>
        <Typography
          variant='caption'
          fontWeight={700}
          color='text.secondary'
          sx={{ mb: 0.75, display: 'block' }}
        >
          Badge Color
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
          {PRESET_COLORS.map((c) => (
            <Box
              key={c}
              onClick={() => setForm((f) => ({ ...f, bgColor: c }))}
              sx={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                bgcolor: c,
                cursor: 'pointer',
                border: form.bgColor === c ? '2.5px solid #1976d2' : '2px solid transparent',
                boxShadow: form.bgColor === c ? `0 0 0 2px ${alpha('#1976d2', 0.3)}` : 'none',
                transition: 'all 0.15s',
                '&:hover': { transform: 'scale(1.18)' },
              }}
            />
          ))}
          <TextField
            size='small'
            value={form.bgColor ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, bgColor: e.target.value }))}
            inputProps={{ style: { fontFamily: 'monospace', fontSize: '0.75rem', width: 72 } }}
            sx={{ ml: 0.5 }}
          />
          {form.bgColor && (
            <Chip
              label={form.name || 'Preview'}
              size='small'
              sx={{ bgcolor: form.bgColor, color: '#fff', fontWeight: 700, fontSize: '0.72rem' }}
            />
          )}
        </Box>
      </Box>

      <Box>
        <Typography
          variant='caption'
          fontWeight={700}
          color='text.secondary'
          sx={{ mb: 1, display: 'block' }}
        >
          Enable for Ticket Types
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {ticketTypeColumns.map((t) => (
            <FormControlLabel
              key={t.key}
              labelPlacement='end'
              control={
                <Switch
                  size='small'
                  checked={form.enabledFor?.[t.key] ?? true}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      enabledFor: { ...(f.enabledFor ?? {}), [t.key]: e.target.checked },
                    }))
                  }
                  color='success'
                />
              }
              label={<Typography sx={{ fontSize: '0.8rem' }}>{t.label}</Typography>}
              sx={{ mr: 2 }}
            />
          ))}
        </Box>
      </Box>
    </ConfigFormDialog>
  );
};

export default PriorityFormDialog;
