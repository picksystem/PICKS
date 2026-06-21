import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, Box, Typography, TextField } from '@serviceops/component';
import { Popover, Radio, FormControl, FormGroup, Checkbox, Collapse } from '@mui/material';
import { PriorityHigh, ColorLens, Close, Check, ExpandMore } from '@mui/icons-material';
import { useFieldError, useNotification } from '@serviceops/hooks';
import { PriorityLevel } from '@serviceops/configpriorityutil';
import { ConfigFormDialog } from '@serviceops/configdialogs';
import { parseRichText, serializeRichText, RichTextEditor } from '../../shared/RichTextEditor';

const PRIORITY_ACCENT = '#b91c1c';

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
  const colorAnchorRef = useRef<HTMLDivElement | null>(null);
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
    bgColor?: boolean;
  }>({});
  const [requiredErrors, setRequiredErrors] = useState<{
    name?: string;
    shortDescription?: string;
    description?: string;
    bgColor?: string;
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
    if (!String(f.bgColor ?? '').trim()) errs.bgColor = 'required';
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
    setTouched({ name: true, shortDescription: true, description: true, bgColor: true });
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

  const currentColor = form.bgColor || '#2563eb';

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
          !form.bgColor ||
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

        <TextField
          label='Colour'
          size='small'
          fullWidth
          required
          value={currentColor}
          onChange={handleColorInputChange}
          onBlur={() => setTouched((t) => ({ ...t, bgColor: true }))}
          placeholder='#2563eb'
          error={Boolean(reqError(touched.bgColor, requiredErrors.bgColor))}
          helperText={reqError(touched.bgColor, requiredErrors.bgColor)}
          inputProps={{
            style: { fontFamily: 'monospace', textTransform: 'lowercase' },
            maxLength: 7,
          }}
          InputProps={{
            endAdornment: (
              <Box
                ref={colorAnchorRef}
                onClick={handleColorIconClick}
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: currentColor || 'transparent',
                  border: '1px solid',
                  borderColor: 'divider',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    boxShadow: 1,
                  },
                }}
                role='button'
                aria-label='Pick a colour'
              />
            ),
          }}
        />

        <Popover
          open={colorPickerOpen}
          onClose={handleColorPickerClose}
          anchorEl={colorAnchorRef.current}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{
            paper: {
              sx: {
                mt: 0.5,
                p: 1.5,
                borderRadius: 2,
                border: '1px solid #2d5ebb',
                boxShadow: 3,
                minWidth: 220,
              },
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant='body2' fontWeight={600} color={PRIORITY_ACCENT}>
              Pick a colour
            </Typography>
            <Close
              onClick={handleColorPickerClose}
              sx={{ fontSize: '1rem', cursor: 'pointer', color: 'text.secondary' }}
            />
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 1,
              mb: 1.25,
            }}
          >
            {PRESET_COLORS.map((c) => {
              const selected = c.toLowerCase() === currentColor.toLowerCase();
              return (
                <Box
                  key={c}
                  onClick={() => handleColorChange(c)}
                  sx={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '1 / 1',
                    borderRadius: 1.5,
                    bgcolor: c,
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: selected ? PRIORITY_ACCENT : 'transparent',
                    boxShadow: selected ? 2 : 0,
                    transition: 'transform 0.15s, box-shadow 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover': {
                      transform: 'scale(1.08)',
                      boxShadow: 2,
                    },
                  }}
                  role='button'
                  aria-label={`Select colour ${c}`}
                >
                  {selected && <Check sx={{ color: '#fff', fontSize: '1.1rem' }} />}
                </Box>
              );
            })}
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              pt: 1,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <ColorLens sx={{ color: PRIORITY_ACCENT, fontSize: '1.1rem' }} />
            <Typography variant='caption' color='text.secondary' sx={{ flex: 1 }}>
              Type a hex value in the field above
            </Typography>
          </Box>
        </Popover>

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
    </>
  );
};

export default PriorityFormDialog;
