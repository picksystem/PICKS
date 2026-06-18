import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, Box, Typography, TextField, IconButton } from '@serviceops/component';
import {
  Dialog,
  DialogContent,
  DialogActions,
  alpha,
  Radio,
  FormControl,
  FormGroup,
  Checkbox,
  Collapse,
} from '@mui/material';
import { PriorityHigh, ColorLens, Close, Check, ExpandMore } from '@mui/icons-material';
import { useFieldError, useNotification } from '@serviceops/hooks';
import { PriorityLevel } from '@serviceops/configpriorityutil';
import { ConfigFormDialog } from '@serviceops/configdialogs';
import { parseRichText, serializeRichText, RichTextEditor } from '../../shared/RichTextEditor';

interface PriorityFormDialogProps {
  open: boolean;
  editing: PriorityLevel | null;
  /** Other priority rows for duplicate detection. */
  existingPriorities?: PriorityLevel[];
  onClose: () => void;
  onSave: (data: Partial<PriorityLevel>) => void;
  ticketTypeColumns: { key: string; label: string }[];
  subtitle?: string;
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
  existingPriorities = [],
  onClose,
  onSave,
  ticketTypeColumns,
  subtitle,
}: PriorityFormDialogProps) => {
  const { success } = useNotification();
  const reqError = useFieldError();
  const [form, setForm] = useState<Partial<PriorityLevel>>({});
  // Mirror of `form` that updates synchronously inside onChange handlers.
  // The RichTextEditor only fires onChange on blur, so a state update from
  // there lands AFTER the user has already clicked Submit. By the time
  // handleSubmit runs, `form` is still the previous render's value and
  // duplicate checks would miss values typed into the editor. We read this
  // ref in handleSubmit / computeDuplicateMessage to get the live value.
  const formRef = useRef<Partial<PriorityLevel>>({});
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [ticketTypesExpanded, setTicketTypesExpanded] = useState(false);
  const [duplicateAlert, setDuplicateAlert] = useState<string | null>(null);
  // Per-field required-validation state. Touched flips true on blur (or
  // immediately on Submit) and `errors` carries the field-level message
  // produced by validateRequired. Mirrors the formik `touched`/`errors`
  // shape that useFieldError expects in TicketTypeFormDialog.
  const [touched, setTouched] = useState<{
    name?: boolean;
    shortDescription?: boolean;
    description?: boolean;
  }>({});
  const [requiredErrors, setRequiredErrors] = useState<{
    name?: string;
    shortDescription?: string;
    description?: string;
  }>({});

  // Updates both the ref and the state in one go. Use this everywhere a
  // field changes so handleSubmit always sees the latest values.
  const updateForm = useCallback(
    (patch: Partial<PriorityLevel> | ((f: Partial<PriorityLevel>) => Partial<PriorityLevel>)) => {
      formRef.current =
        typeof patch === 'function' ? patch(formRef.current) : { ...formRef.current, ...patch };
      setForm(formRef.current);
    },
    [],
  );

  // Strip rich-text markers and compare case-insensitively on plain text.
  // Mirrors the helper used in TicketTypeFormDialog.
  const plainText = (v: string): string =>
    String(v ?? '')
      .replace(/\*\*/g, '')
      .replace(/__/g, '')
      .replace(/\*/g, '')
      .trim()
      .toLowerCase();

  /**
   * Required-field validation per the spec:
   *   Priority (name)        — Yes
   *   Short Description       — Yes
   *   Description             — Yes
   *   Internal note           — No
   *
   * Returns a map of fieldName → 'required' for any blank required field.
   * Rich-text fields are checked on plain text (markers stripped) so a
   * user who only typed formatting without content still fails validation.
   */
  const validateRequired = (f: Partial<PriorityLevel>): typeof requiredErrors => {
    const errs: typeof requiredErrors = {};
    if (!String(f.name ?? '').trim()) errs.name = 'required';
    if (!plainText(f.shortDescription ?? '')) errs.shortDescription = 'required';
    if (!plainText(f.description ?? '')) errs.description = 'required';
    return errs;
  };

  /**
   * Returns a single consolidated duplicate message, or null when the form
   * passes the duplicate check.
   *
   * Per the spec for the Priority section:
   *   - Priority (name):    Allowed  — skip
   *   - Short Description:  Not allowed
   *   - Description:        Not allowed
   *   - Colour (bgColor):   Allowed  — skip
   *   - Internal note:      Allowed  — skip
   */
  const computeDuplicateMessage = (f: Partial<PriorityLevel>): string | null => {
    const myId = editing?.id;
    const others = existingPriorities.filter((p) => p.id !== myId);

    const conflicts: string[] = [];

    const shortVal = plainText(f.shortDescription ?? '');
    if (shortVal && others.some((p) => plainText(p.shortDescription ?? '') === shortVal)) {
      conflicts.push('Short Description');
    }

    const descVal = plainText(f.description ?? '');
    if (descVal && others.some((p) => plainText(p.description ?? '') === descVal)) {
      conflicts.push('Description');
    }

    if (conflicts.length === 0) return null;
    if (conflicts.length === 1) {
      return `${conflicts[0]} already exists. Please use a different value.`;
    }
    return `${conflicts.join(' and ')} already exist. Please use different values.`;
  };

  // Live-recompute the duplicate alert so the user sees it as they type,
  // not only after clicking Submit. This mirrors the live validation the
  // approved-estimates and ticket-types dialogs do.
  useEffect(() => {
    if (!open) {
      setDuplicateAlert(null);
      return;
    }
    setDuplicateAlert(computeDuplicateMessage(formRef.current));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, open, editing, existingPriorities]);

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
    // Reset required-validation state each time the dialog opens so
    // errors from a previous Add/Edit don't carry over.
    setTouched({});
    setRequiredErrors({});
    const initial = editing
      ? {
          name: editing.name,
          shortDescription: editing.shortDescription ?? '',
          description: editing.description,
          bgColor: editing.bgColor,
          internalNote: editing.internalNote ?? '',
          enabledFor: { ...editing.enabledFor },
          accessControl: (editing as { accessControl?: string[] }).accessControl ?? [
            'admin',
            'consultant',
            'endUser',
          ],
        }
      : {
          name: '',
          shortDescription: '',
          description: '',
          bgColor: '#2563eb',
          internalNote: '',
          enabledFor: Object.fromEntries(ticketTypeColumns.map((t) => [t.key, true])),
          accessControl: ['admin', 'consultant', 'endUser'],
        };
    formRef.current = initial;
    setForm(initial);
  }, [open, editing, ticketTypeColumns]);

  // Handle "Select All" toggle for ticket types
  const handleSelectAllTicketTypes = useCallback(
    (checked: boolean) => {
      updateForm((f) => ({
        ...f,
        enabledFor: Object.fromEntries(ticketTypeColumns.map((t) => [t.key, checked])),
      }));
    },
    [ticketTypeColumns, updateForm],
  );

  const handleSubmit = () => {
    // Read the ref, not the `form` state — see formRef comment above for why.
    // Run required-field validation first so the user sees a per-field red
    // border / helper text on Priority, Short Description, and Description
    // when any of them is blank. Mark all required fields as touched so the
    // errors render even if the user hasn't blurred them yet.
    const reqErrs = validateRequired(formRef.current);
    setRequiredErrors(reqErrs);
    setTouched({ name: true, shortDescription: true, description: true });
    if (Object.keys(reqErrs).length > 0) {
      return;
    }

    const message = computeDuplicateMessage(formRef.current);
    if (message) {
      setDuplicateAlert(message);
      return;
    }
    setDuplicateAlert(null);
    onSave(formRef.current);
    success(editing ? 'Priority updated successfully' : 'Priority added successfully');
  };

  const handleColorIconClick = () => {
    setColorPickerOpen(true);
  };

  const handleColorPickerClose = () => {
    setColorPickerOpen(false);
  };

  const handleColorChange = (color: string) => {
    updateForm((f) => ({ ...f, bgColor: color }));
    setColorPickerOpen(false);
  };

  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
      updateForm((f) => ({ ...f, bgColor: value }));
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
        subtitle={subtitle}
        submitDisabled={
          !form.name ||
          !plainText(form.shortDescription ?? '') ||
          !plainText(form.description ?? '') ||
          Boolean(duplicateAlert)
        }
        submitLabel={editing ? 'Save' : 'Submit'}
        maxWidth='md'
      >
        {/* Duplicate Alert — single dialog-level message. Per spec, only
            Short Description and Description must be unique. The Alert is
            the only signal; no per-field red borders for duplicates. */}
        {duplicateAlert && (
          <Alert severity='error' variant='outlined' sx={{ mb: 1 }}>
            {duplicateAlert}
          </Alert>
        )}

        <TextField
          label='Priority'
          size='small'
          value={form.name ?? ''}
          onChange={(e) => updateForm((f) => ({ ...f, name: e.target.value }))}
          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          placeholder='e.g. 1-Critical, 2-High, 3-Medium'
          inputProps={{ style: { fontFamily: 'monospace', fontWeight: 700 } }}
          error={Boolean(reqError(touched.name, requiredErrors.name))}
          helperText={reqError(touched.name, requiredErrors.name)}
          required
        />

        <Box>
          <Box
            onBlur={() => setTouched((t) => ({ ...t, shortDescription: true }))}
            sx={{ borderRadius: 1 }}
          >
            <RichTextEditor
              value={parseRichText(form.shortDescription ?? '')}
              onChange={(value) =>
                updateForm((f) => ({ ...f, shortDescription: serializeRichText(value.segments) }))
              }
              showFooterActions={false}
              title='Short Description'
              required
              error={Boolean(reqError(touched.shortDescription, requiredErrors.shortDescription))}
            />
            <Typography
              variant='caption'
              sx={{
                color: reqError(touched.shortDescription, requiredErrors.shortDescription)
                  ? '#d32f2f'
                  : 'text.secondary',
                fontSize: '0.7rem',
                mt: 0.5,
                display: 'block',
              }}
            >
              {reqError(touched.shortDescription, requiredErrors.shortDescription) ||
                'Brief summary shown in compact views'}
            </Typography>
          </Box>
        </Box>

        <Box>
          <Box
            onBlur={() => setTouched((t) => ({ ...t, description: true }))}
            sx={{ borderRadius: 1 }}
          >
            <RichTextEditor
              value={parseRichText(form.description ?? '')}
              onChange={(value) =>
                updateForm((f) => ({ ...f, description: serializeRichText(value.segments) }))
              }
              showFooterActions={false}
              title='Description'
              required
              error={Boolean(reqError(touched.description, requiredErrors.description))}
            />
            <Typography
              variant='caption'
              sx={{
                color: reqError(touched.description, requiredErrors.description)
                  ? '#d32f2f'
                  : 'text.secondary',
                fontSize: '0.7rem',
                mt: 0.5,
                display: 'block',
              }}
            >
              {reqError(touched.description, requiredErrors.description) ||
                'Describe when this priority should be used'}
            </Typography>
          </Box>
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
              updateForm((f) => ({ ...f, internalNote: serializeRichText(value.segments) }))
            }
            showFooterActions={false}
            title='Internal note'
          />
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ fontSize: '0.7rem', mt: 0.5, display: 'block' }}
          >
            Internal note for this priority (not visible to end users) — optional
          </Typography>
        </Box>

        {/* ── Ticket Types Activation ── */}
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
                              updateForm((f) => ({
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

        {/* ── Access Control ── */}
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

export default PriorityFormDialog;
