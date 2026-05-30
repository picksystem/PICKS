import { useState, useEffect } from 'react';
import { Box, Typography, TextField, Switch } from '@serviceops/component';
import { FormControlLabel } from '@mui/material';
import { PriorityHigh } from '@mui/icons-material';
import { useNotification } from '@serviceops/hooks';
import { PriorityLevel } from '@serviceops/configpriorityutil';
import { ConfigFormDialog } from '@serviceops/configdialogs';

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
  const { success } = useNotification();
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
  }, [open, editing, ticketTypeColumns]);

  const handleSubmit = () => {
    onSave(form);
    success(editing ? 'Priority updated successfully' : 'Priority added successfully');
  };

  return (
    <ConfigFormDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      isEdit={!!editing}
      icon={<PriorityHigh sx={{ color: '#fff', fontSize: '1.1rem' }} />}
      accent='#b91c1c'
      title='Priority'
      submitDisabled={!form.name}
      submitLabel={editing ? 'Save' : 'Submit'}
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
