import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, Box, Typography, TextField, Switch } from '@serviceops/component';
import {
  alpha,
  Popover,
  Radio,
  FormControl,
  FormControlLabel,
  FormGroup,
  Checkbox,
  Collapse,
} from '@mui/material';
import { RadioButtonChecked, ColorLens, Close, Check, ExpandMore } from '@mui/icons-material';
import { useFieldError, useNotification } from '@serviceops/hooks';
import { IConfigStatusLevel } from '@serviceops/interfaces';
import { ConfigFormDialog } from '@serviceops/configdialogs';
import { parseRichText, serializeRichText, RichTextEditor } from '../../shared/RichTextEditor';

interface StatusFormDialogProps {
  open: boolean;
  editing: IConfigStatusLevel | null;
  onClose: () => void;
  onSave: (data: Partial<IConfigStatusLevel>) => void;
  ticketTypeColumns: { key: string; label: string }[];
  /** Other status rows for duplicate detection. The row currently being
   *  edited is excluded from the comparison automatically. */
  existingStatuses?: IConfigStatusLevel[];
  /** Label used in the duplicate alert for the displayName field.
   *  Defaults to "Ticket Status". For release-cycle status flows this is
   *  typically "Release cycle status". */
  displayNameLabel?: string;
  subtitle?: string;
  title?: string;
  hideFinalStatus?: boolean;
  successMessage?: { add: string; edit: string };
}

// Strip rich-text markers and lowercase for case-insensitive comparison.
const plainText = (v: string): string =>
  String(v ?? '')
    .replace(/\*\*/g, '')
    .replace(/__/g, '')
    .replace(/\*/g, '')
    .trim()
    .toLowerCase();

const STATUS_ACCENT = '#0369a1';

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

const StatusFormDialog = ({
  open,
  editing,
  onClose,
  onSave,
  ticketTypeColumns,
  existingStatuses = [],
  displayNameLabel = 'Ticket Status',
  subtitle,
  title = 'Ticket Status',
  hideFinalStatus = false,
  successMessage,
}: StatusFormDialogProps) => {
  const { success } = useNotification();
  const reqError = useFieldError();
  const [form, setForm] = useState<Partial<IConfigStatusLevel>>({});
  // Mirror of `form` that updates synchronously inside onChange handlers.
  // The RichTextEditor only fires onChange on blur, so a state update from
  // there lands AFTER the user has already clicked Submit. By the time
  // handleSubmit runs, `form` is still the previous render's value and
  // duplicate checks would miss values typed into the editor. We read this
  // ref in handleSubmit / computeDuplicateMessage to get the live value.
  const formRef = useRef<Partial<IConfigStatusLevel>>({});
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const colorAnchorRef = useRef<HTMLDivElement | null>(null);
  const [ticketTypesExpanded, setTicketTypesExpanded] = useState(false);
  const [duplicateAlert, setDuplicateAlert] = useState<string | null>(null);
  // Per-field required-validation state. Touched flips true on blur (or
  // immediately on Submit) and `requiredErrors` carries the field-level
  // message produced by validateRequired. Mirrors the formik
  // touched/errors shape that useFieldError expects.
  const [touched, setTouched] = useState<{
    displayName?: boolean;
    shortDescription?: boolean;
    bgColor?: boolean;
  }>({});
  const [requiredErrors, setRequiredErrors] = useState<{
    displayName?: string;
    shortDescription?: string;
    bgColor?: string;
  }>({});

  /**
   * Required-field validation per the spec for the Ticket Status section:
   *   <displayName> (Ticket Status)  — Yes
   *   Short Description              — Yes
   *   Description                    — No
   *   Colour                         — Yes
   *   Status Activation              — NA  — skip
   *   SLA Activation                 — NA  — skip
   *   Internal note                  — No
   *
   * Rich-text fields are checked on plain text (markers stripped) so a user
   * who only typed formatting without content still fails validation.
   */
  const validateRequired = (f: Partial<IConfigStatusLevel>): typeof requiredErrors => {
    const errs: typeof requiredErrors = {};
    if (!String(f.displayName ?? '').trim()) errs.displayName = 'required';
    if (!plainText(String(f.shortDescription ?? ''))) errs.shortDescription = 'required';
    if (!String(f.bgColor ?? '').trim()) errs.bgColor = 'required';
    return errs;
  };

  /**
   * Returns a single consolidated duplicate message, or null when the form
   * passes the duplicate check.
   *
   * Per the spec for the Ticket Status / Release Cycle Status section:
   *   - <displayName> (Ticket Status / Release cycle status):  Not allowed
   *   - Short Description:                                     Not allowed
   *   - Description:                                           Allowed  — skip
   *   - Colour:                                                Allowed  — skip
   *   - Status Activation:                                     NA       — skip
   *   - SLA Activation:                                        NA       — skip
   *   - Internal note:                                         Allowed  — skip
   *   - Ticket types - activation:                             Allowed  — skip
   *
   * `displayNameLabel` controls the user-visible label of the first
   * conflict (e.g. "Ticket Status" vs "Release cycle status") so the
   * Alert reads naturally in each section.
   */
  const computeDuplicateMessage = (f: Partial<IConfigStatusLevel>): string | null => {
    const myId = editing?.id;
    const others = existingStatuses.filter((s) => s.id !== myId);

    const conflicts: string[] = [];

    const statusVal = plainText(String(f.displayName ?? ''));
    if (statusVal && others.some((s) => plainText(String(s.displayName ?? '')) === statusVal)) {
      conflicts.push(displayNameLabel);
    }

    const shortVal = plainText(String(f.shortDescription ?? ''));
    if (shortVal && others.some((s) => plainText(String(s.shortDescription ?? '')) === shortVal)) {
      conflicts.push('Short Description');
    }

    if (conflicts.length === 0) return null;
    if (conflicts.length === 1) {
      return `${conflicts[0]} already exists. Please use a different value.`;
    }
    return `${conflicts.join(' and ')} already exist. Please use different values.`;
  };

  const getActiveTicketTypeCount = (): number => {
    const { enabledFor } = form;
    if (!enabledFor) return ticketTypeColumns.length;
    return ticketTypeColumns.filter((t) => enabledFor[t.key] ?? true).length;
  };

  useEffect(() => {
    if (!open) {
      setColorPickerOpen(false);
      setTouched({});
      setRequiredErrors({});
      return;
    }
    // Reset required-validation state each time the dialog opens so
    // errors from a previous Add/Edit don't carry over.
    setTouched({});
    setRequiredErrors({});
    const initial: Partial<IConfigStatusLevel> = editing
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
        };
    formRef.current = initial;
    setForm(initial);
  }, [open, editing, ticketTypeColumns]);

  // Updates both the ref and the state in one go. Use this everywhere a
  // field changes so handleSubmit always sees the latest values.
  const updateForm = useCallback(
    (
      patch:
        | Partial<IConfigStatusLevel>
        | ((f: Partial<IConfigStatusLevel>) => Partial<IConfigStatusLevel>),
    ) => {
      formRef.current =
        typeof patch === 'function' ? patch(formRef.current) : { ...formRef.current, ...patch };
      setForm(formRef.current);
    },
    [],
  );

  // Live-recompute the duplicate alert so the user sees it as they type,
  // not only after clicking Submit.
  useEffect(() => {
    if (!open) {
      setDuplicateAlert(null);
      return;
    }
    setDuplicateAlert(computeDuplicateMessage(formRef.current));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, open, editing, existingStatuses]);

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
    // Read the ref, not the form state — see formRef comment above for why.
    // Run required-field validation first so the user sees a per-field red
    // border / helper text on Ticket Status, Short Description, and Colour
    // when any of them is blank. Mark all required fields as touched so the
    // errors render even if the user hasn't blurred them yet.
    const reqErrs = validateRequired(formRef.current);
    setRequiredErrors(reqErrs);
    setTouched({ displayName: true, shortDescription: true, bgColor: true });
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
    success(
      editing
        ? (successMessage?.edit ?? 'Status updated successfully')
        : (successMessage?.add ?? 'Status added successfully'),
    );
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
        icon={<RadioButtonChecked sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent='#0369a1'
        title={title}
        subtitle={subtitle}
        submitDisabled={
          !form.displayName ||
          !plainText(form.shortDescription ?? '') ||
          !form.bgColor ||
          Boolean(duplicateAlert)
        }
        submitLabel={editing ? 'Save' : 'Submit'}
        maxWidth='md'
      >
        {/* Duplicate Alert — single dialog-level message. Per spec, only
            Ticket Status and Short Description must be unique. The Alert is
            the only signal; no per-field red borders for duplicates. */}
        {duplicateAlert && (
          <Alert severity='error' variant='outlined' sx={{ mb: 1 }}>
            {duplicateAlert}
          </Alert>
        )}
        <TextField
          label={displayNameLabel}
          size='small'
          value={form.displayName ?? ''}
          onChange={(e) =>
            updateForm((f) => ({ ...f, displayName: e.target.value, name: e.target.value }))
          }
          onBlur={() => setTouched((t) => ({ ...t, displayName: true }))}
          placeholder='e.g. New, In Progress, On Hold'
          inputProps={{ style: { fontFamily: 'monospace', fontWeight: 700 } }}
          error={Boolean(reqError(touched.displayName, requiredErrors.displayName))}
          helperText={reqError(touched.displayName, requiredErrors.displayName)}
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
          <RichTextEditor
            value={parseRichText(form.description ?? '')}
            onChange={(value) =>
              updateForm((f) => ({ ...f, description: serializeRichText(value.segments) }))
            }
            showFooterActions={false}
            title='Description'
          />
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ fontSize: '0.7rem', mt: 0.5, display: 'block' }}
          >
            Describe when this status should be used — optional
          </Typography>
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
          <Box
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}
          >
            <Typography variant='body2' fontWeight={600} color='#0369a1'>
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
                    borderColor: selected ? '#0369a1' : 'transparent',
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
            <ColorLens sx={{ color: '#0369a1', fontSize: '1.1rem' }} />
            <Typography variant='caption' color='text.secondary' sx={{ flex: 1 }}>
              Type a hex value in the field above
            </Typography>
          </Box>
        </Popover>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          <ActivationRow
            label='Status Activation'
            description='Enable this status for use on tickets'
            checked={form.isActive ?? true}
            onChange={(checked) => updateForm((f) => ({ ...f, isActive: checked }))}
          />
          <ActivationRow
            label='SLA Activation'
            description='Track SLA timers for tickets in this status'
            checked={form.slaActive ?? true}
            onChange={(checked) => updateForm((f) => ({ ...f, slaActive: checked }))}
          />
          {!hideFinalStatus && (
            <ActivationRow
              label='Final Status'
              description='Mark this status as a closed/final state'
              checked={form.isFinal ?? false}
              onChange={(checked) => updateForm((f) => ({ ...f, isFinal: checked }))}
            />
          )}
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
            Internal note for this status (not visible to end users) — optional
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
      </ConfigFormDialog>
    </>
  );
};

export default StatusFormDialog;
