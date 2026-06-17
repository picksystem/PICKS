import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, TextField, IconButton, Switch } from '@serviceops/component';
import {
  Dialog,
  DialogContent,
  DialogActions,
  alpha,
  Radio,
  FormControl,
  FormControlLabel,
  FormGroup,
  Checkbox,
  Collapse,
} from '@mui/material';
import { RadioButtonChecked, ColorLens, Close, Check, ExpandMore } from '@mui/icons-material';
import { useNotification } from '@serviceops/hooks';
import { IConfigStatusLevel } from '@serviceops/interfaces';
import { ConfigFormDialog } from '@serviceops/configdialogs';
import { parseRichText, serializeRichText, RichTextEditor } from '../../shared/RichTextEditor';

interface StatusFormDialogProps {
  open: boolean;
  editing: IConfigStatusLevel | null;
  onClose: () => void;
  onSave: (data: Partial<IConfigStatusLevel>) => void;
  ticketTypeColumns: { key: string; label: string }[];
  subtitle?: string;
  title?: string;
  hideFinalStatus?: boolean;
  successMessage?: { add: string; edit: string };
}

const STATUS_ACCENT = '#0369a1';

interface ActivationRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const ActivationRow = ({ label, description, checked, onChange }: ActivationRowProps) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      px: 2,
      py: 1.25,
      borderRadius: 1,
      border: '1px solid #2d5ebb',
      bgcolor: alpha(STATUS_ACCENT, 0.04),
      borderColor: '#2d5ebb',
      transition: 'all 0.2s ease',
    }}
  >
    <Box>
      <Typography variant='body2' color='#0369a1' fontWeight={600}>
        {label}
      </Typography>
      <Typography variant='caption' color='#2687bb' sx={{ display: { xs: 'none', sm: 'block' } }}>
        {description}
      </Typography>
    </Box>
    <FormControlLabel
      sx={{ ml: 0 }}
      control={
        <Switch
          size='small'
          color='success'
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
      }
      label={
        <Typography
          variant='body2'
          fontWeight={700}
          sx={{
            color: checked ? 'success.main' : 'text.secondary',
            display: { xs: 'none', sm: 'block' },
          }}
        >
          {checked ? 'Active' : 'Inactive'}
        </Typography>
      }
    />
  </Box>
);

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

const StatusFormDialog = ({
  open,
  editing,
  onClose,
  onSave,
  ticketTypeColumns,
  subtitle,
  title = 'Ticket Status',
  hideFinalStatus = false,
  successMessage,
}: StatusFormDialogProps) => {
  const { success } = useNotification();
  const [form, setForm] = useState<Partial<IConfigStatusLevel>>({});
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [ticketTypesExpanded, setTicketTypesExpanded] = useState(false);

  const getActiveTicketTypeCount = (): number => {
    const { enabledFor } = form;
    if (!enabledFor) return ticketTypeColumns.length;
    return ticketTypeColumns.filter((t) => enabledFor[t.key] ?? true).length;
  };

  useEffect(() => {
    if (!open) {
      setColorPickerOpen(false);
      return;
    }
    setForm(
      editing
        ? {
            name: editing.name,
            displayName: editing.displayName,
            shortDescription: editing.shortDescription ?? '',
            description: editing.description,
            bgColor: editing.bgColor,
            color: editing.color,
            isActive: editing.isActive,
            slaActive: editing.slaActive,
            isFinal: editing.isFinal,
            sortOrder: editing.sortOrder,
            internalNote: editing.internalNote ?? '',
            enabledFor: { ...editing.enabledFor },
          }
        : {
            name: '',
            displayName: '',
            shortDescription: '',
            description: '',
            bgColor: '#2563eb',
            color: '#fff',
            isActive: true,
            slaActive: true,
            isFinal: false,
            sortOrder: 1,
            internalNote: '',
            enabledFor: Object.fromEntries(ticketTypeColumns.map((t) => [t.key, true])),
          },
    );
  }, [open, editing, ticketTypeColumns]);

  const handleSelectAllTicketTypes = useCallback(
    (checked: boolean) => {
      setForm((f) => ({
        ...f,
        enabledFor: Object.fromEntries(ticketTypeColumns.map((t) => [t.key, checked])),
      }));
    },
    [ticketTypeColumns],
  );

  const handleSubmit = () => {
    onSave(form);
    success(
      editing
        ? (successMessage?.edit ?? 'Status updated successfully')
        : (successMessage?.add ?? 'Status added successfully'),
    );
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

  const currentColor = form.bgColor || '#2563eb';

  return (
    <>
      <ConfigFormDialog
        open={open}
        onClose={onClose}
        onSubmit={handleSubmit}
        isEdit={!!editing}
        icon={<RadioButtonChecked sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent='#0369a1'
        title={title}
        subtitle={subtitle}
        submitDisabled={!form.displayName}
        submitLabel={editing ? 'Save' : 'Submit'}
        maxWidth='md'
      >
        <TextField
          label='Ticket Status'
          size='small'
          value={form.displayName ?? ''}
          onChange={(e) =>
            setForm((f) => ({ ...f, displayName: e.target.value, name: e.target.value }))
          }
          placeholder='e.g. New, In Progress, On Hold'
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
            sx={{ fontSize: '0.7rem', mt: 0.5, display: 'none' }}
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
            sx={{ fontSize: '0.7rem', mt: 0.5, display: 'none' }}
          >
            Describe when this status should be used
          </Typography>
        </Box>

        <TextField
          label='Colour'
          size='small'
          fullWidth
          required
          value={currentColor}
          onChange={handleColorInputChange}
          placeholder='#2563eb'
          inputProps={{
            style: { fontFamily: 'monospace', textTransform: 'lowercase' },
            maxLength: 7,
          }}
          InputProps={{
            endAdornment: (
              <Box
                component='input'
                type='color'
                value={currentColor || '#000000'}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleColorChange(e.target.value)
                }
                aria-label='Pick a colour'
                sx={{
                  width: 32,
                  height: 32,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  padding: 0,
                  bgcolor: currentColor || 'transparent',
                }}
              />
            ),
          }}
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          <ActivationRow
            label='Status Activation'
            description='Enable this status for use on tickets'
            checked={form.isActive ?? true}
            onChange={(checked) => setForm((f) => ({ ...f, isActive: checked }))}
          />
          <ActivationRow
            label='SLA Activation'
            description='Track SLA timers for tickets in this status'
            checked={form.slaActive ?? true}
            onChange={(checked) => setForm((f) => ({ ...f, slaActive: checked }))}
          />
          {!hideFinalStatus && (
            <ActivationRow
              label='Final Status'
              description='Mark this status as a closed/final state'
              checked={form.isFinal ?? false}
              onChange={(checked) => setForm((f) => ({ ...f, isFinal: checked }))}
            />
          )}
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
            sx={{ fontSize: '0.7rem', mt: 0.5, display: 'none' }}
          >
            Internal note for this status (not visible to end users)
          </Typography>
        </Box>

        {/* Ticket Types Activation */}
        <Box>
          <Box
            sx={{
              border: '1px solid #2d5ebb',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Box
              onClick={() => setTicketTypesExpanded(!ticketTypesExpanded)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                py: 1.5,
                cursor: 'pointer',
                bgcolor: '#f0f4f8',
                transition: 'background-color 0.2s',
              }}
            >
              <Typography
                variant='body2'
                color='#0369a1'
                sx={{ fontWeight: 600, fontSize: '0.85rem' }}
              >
                Ticket Types Activation
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant='caption'
                  color='#0369a1'
                  sx={{ fontWeight: 500, fontSize: '0.78rem' }}
                >
                  {getActiveTicketTypeCount()} of {ticketTypeColumns.length} selected
                </Typography>
                <Radio
                  size='small'
                  checked={getActiveTicketTypeCount() === ticketTypeColumns.length}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => handleSelectAllTicketTypes(e.target.checked)}
                  sx={{
                    '&.Mui-checked': { color: '#0369a1' },
                  }}
                />
                <Typography variant='caption' sx={{ fontWeight: 500, color: '#0369a1' }}>
                  Select All
                </Typography>
                <ExpandMore
                  sx={{
                    color: '#0369a1',
                    fontSize: '1.1rem',
                    transform: ticketTypesExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }}
                />
              </Box>
            </Box>

            <Collapse in={ticketTypesExpanded}>
              <Box sx={{ px: 2, pb: 2 }}>
                <FormControl component='fieldset' fullWidth>
                  <FormGroup>
                    {ticketTypeColumns.map((t) => {
                      const isChecked = form.enabledFor?.[t.key] ?? true;
                      return (
                        <Box
                          key={t.key}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            py: 0.75,
                            borderBottom: '1px solid',
                            borderColor: '#2d5ebb',
                            '&:last-child': { borderBottom: 'none' },
                          }}
                        >
                          <Checkbox
                            checked={isChecked}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                enabledFor: { ...(f.enabledFor ?? {}), [t.key]: e.target.checked },
                              }))
                            }
                            sx={{
                              color: '#0369a1',
                              '&.Mui-checked': { color: '#0369a1' },
                            }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant='body2'
                              sx={{ fontWeight: 500, fontSize: '0.85rem' }}
                            >
                              {t.label}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </FormGroup>
                </FormControl>
              </Box>
            </Collapse>
          </Box>
        </Box>
      </ConfigFormDialog>

      <Dialog
        open={colorPickerOpen}
        onClose={handleColorPickerClose}
        maxWidth='xs'
        fullWidth
        disableEnforceFocus
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

export default StatusFormDialog;
