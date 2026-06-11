import { useState, useEffect } from 'react';
import { Box, Typography, TextField, Switch, IconButton } from '@serviceops/component';
import { Dialog, DialogContent, DialogActions, FormControlLabel, alpha } from '@mui/material';
import { PriorityHigh, ColorLens, Close, Check } from '@mui/icons-material';
import { useNotification } from '@serviceops/hooks';
import { PriorityLevel } from '@serviceops/configpriorityutil';
import { ConfigFormDialog } from '@serviceops/configdialogs';
import { parseRichText, serializeRichText, RichTextEditor } from '../../shared/RichTextEditor';

interface PriorityFormDialogProps {
  open: boolean;
  editing: PriorityLevel | null;
  onClose: () => void;
  onSave: (data: Partial<PriorityLevel>) => void;
  ticketTypeColumns: { key: string; label: string }[];
}

const PRESET_COLORS = [
  '#2563eb',
  '#dc2626',
  '#16a34a',
  '#ea580c',
  '#9333ea',
  '#0891b2',
  '#ca8a04',
  '#475569',
];

const PriorityFormDialog = ({
  open,
  editing,
  onClose,
  onSave,
  ticketTypeColumns,
}: PriorityFormDialogProps) => {
  const { success } = useNotification();
  const [form, setForm] = useState<Partial<PriorityLevel>>({});
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setColorPickerOpen(false);
      return;
    }
    setForm(
      editing
        ? {
            name: editing.name,
            shortDescription: editing.shortDescription ?? '',
            description: editing.description,
            bgColor: editing.bgColor,
            internalNote: editing.internalNote ?? '',
            enabledFor: { ...editing.enabledFor },
          }
        : {
            name: '',
            shortDescription: '',
            description: '',
            bgColor: '#2563eb',
            internalNote: '',
            enabledFor: Object.fromEntries(ticketTypeColumns.map((t) => [t.key, true])),
          },
    );
  }, [open, editing, ticketTypeColumns]);

  const handleSubmit = () => {
    onSave(form);
    success(editing ? 'Priority updated successfully' : 'Priority added successfully');
  };

  const handleColorIconClick = () => {
    setColorPickerOpen(true);
  };

  const handleColorPickerClose = () => {
    setColorPickerOpen(false);
  };

  const handleColorChange = (color: string) => {
    setForm((f) => ({ ...f, bgColor: color }));
    setColorPickerOpen(false);
  };

  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
      setForm((f) => ({ ...f, bgColor: value }));
    }
  };

  const currentColor = form.bgColor ?? '#2563eb';

  return (
    <>
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
          label='Priority'
          size='small'
          value={form.name ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          helperText='e.g. 1-Critical, 2-High, 3-Medium'
          inputProps={{ style: { fontFamily: 'monospace', fontWeight: 700 } }}
          required
        />

        <Box>
          <RichTextEditor
            value={parseRichText(form.shortDescription ?? '')}
            onChange={(value) =>
              setForm((f) => ({ ...f, shortDescription: serializeRichText(value.segments) }))
            }
            showFooterActions={false}
            title='Short Description'
          />
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ fontSize: '0.7rem', mt: 0.5, display: 'block' }}
          >
            Brief summary shown in compact views
          </Typography>
        </Box>

        <Box>
          <RichTextEditor
            value={parseRichText(form.description ?? '')}
            onChange={(value) =>
              setForm((f) => ({ ...f, description: serializeRichText(value.segments) }))
            }
            showFooterActions={false}
            title='Description'
          />
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ fontSize: '0.7rem', mt: 0.5, display: 'block' }}
          >
            Describe when this priority should be used
          </Typography>
        </Box>

        <Box>
          <Typography
            variant='caption'
            fontWeight={700}
            color='text.secondary'
            sx={{ mb: 1, display: 'block' }}
          >
            Colour
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              onClick={handleColorIconClick}
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                bgcolor: currentColor,
                border: '2px solid',
                borderColor: 'divider',
                boxShadow: 1,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                '&:hover': {
                  opacity: 0.9,
                  boxShadow: 2,
                  transform: 'scale(1.02)',
                },
              }}
              role='button'
              aria-label='Pick a colour'
            >
              <ColorLens sx={{ color: '#fff', fontSize: '1.1rem' }} />
            </Box>
            <TextField
              size='small'
              value={currentColor}
              onChange={handleColorInputChange}
              placeholder='#2563eb'
              inputProps={{ style: { fontFamily: 'monospace', textTransform: 'lowercase' } }}
              sx={{ flex: 1 }}
            />
          </Box>
        </Box>

        <Box>
          <RichTextEditor
            value={parseRichText(form.internalNote ?? '')}
            onChange={(value) =>
              setForm((f) => ({ ...f, internalNote: serializeRichText(value.segments) }))
            }
            showFooterActions={false}
            title='Internal note'
          />
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ fontSize: '0.7rem', mt: 0.5, display: 'block' }}
          >
            Internal note for this priority (not visible to end users)
          </Typography>
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

      <Dialog
        open={colorPickerOpen}
        onClose={handleColorPickerClose}
        maxWidth='xs'
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                bgcolor: alpha(currentColor, 0.15),
                border: `2px solid ${currentColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ColorLens sx={{ color: currentColor, fontSize: '1rem' }} />
            </Box>
            <Typography variant='subtitle2' fontWeight={700}>
              Pick a Color
            </Typography>
          </Box>
          <IconButton size='small' onClick={handleColorPickerClose} aria-label='Close color picker'>
            <Close fontSize='small' />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 2.5 }}>
          <Box sx={{ mb: 2 }}>
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ mb: 1, display: 'block', fontWeight: 600 }}
            >
              Preset Colors
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
              {PRESET_COLORS.map((preset) => (
                <Box
                  key={preset}
                  onClick={() => handleColorChange(preset)}
                  sx={{
                    width: '100%',
                    aspectRatio: '2 / 1',
                    bgcolor: preset,
                    borderRadius: 1,
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor:
                      currentColor.toLowerCase() === preset.toLowerCase()
                        ? 'primary.main'
                        : 'transparent',
                    boxShadow: 1,
                    transition: 'transform 0.15s, border-color 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      borderColor: 'primary.main',
                    },
                  }}
                  role='button'
                  aria-label={`Select color ${preset}`}
                >
                  {currentColor.toLowerCase() === preset.toLowerCase() && (
                    <Check
                      sx={{
                        color: '#fff',
                        fontSize: '1rem',
                        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))',
                      }}
                    />
                  )}
                </Box>
              ))}
            </Box>
          </Box>

          <Box sx={{ mt: 1.5 }}>
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}
            >
              Custom Color
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <input
                type='color'
                value={currentColor}
                onChange={(e) => handleColorChange(e.target.value)}
                style={{
                  width: 48,
                  height: 40,
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  padding: 0,
                }}
              />
              <TextField
                size='small'
                fullWidth
                value={currentColor}
                onChange={handleColorInputChange}
                inputProps={{
                  style: { fontFamily: 'monospace', textTransform: 'lowercase' },
                  maxLength: 7,
                }}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 2.5, py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
          <Box
            component='button'
            type='button'
            onClick={handleColorPickerClose}
            sx={{
              textTransform: 'none',
              fontFamily: 'inherit',
              fontSize: '0.875rem',
              fontWeight: 600,
              px: 2.5,
              py: 0.75,
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              color: 'text.primary',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: 'action.hover',
                borderColor: 'text.secondary',
              },
            }}
          >
            Cancel
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PriorityFormDialog;
