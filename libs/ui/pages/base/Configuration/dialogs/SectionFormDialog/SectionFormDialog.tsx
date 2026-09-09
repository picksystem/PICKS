import { useState, useEffect, useMemo, useRef } from 'react';
import { Box, Typography, TextField, Alert } from '@serviceops/component';
import { alpha, Checkbox, Collapse } from '@mui/material';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { useFieldError, useNotification } from '@serviceops/hooks';
import { ConfigFormDialog } from '@serviceops/configdialogs';

const DEFAULT_ACCENT = '#0369a1';
const ALNUM_PATTERN = /[^A-Za-z0-9 _-]/g;
const stripAlphaNumeric = (v: string): string => String(v ?? '').replace(ALNUM_PATTERN, '');

export interface TicketTypeRef {
  type: string;
  name: string;
}

export interface DialogSection {
  id: string;
  title: string;
  fields: string[];
  accessControl?: Record<string, boolean>;
}

interface SectionFormDialogProps {
  open: boolean;
  /** Pass all existing section titles for duplicate detection. */
  existingSections: DialogSection[];
  /** The section being edited. When provided, dialog enters edit mode. */
  editingSection?: DialogSection | null;
  /** Ticket types to show in the Access Control list. */
  ticketTypes: TicketTypeRef[];
  accent?: string;
  defaultTicketType?: string;
  onClose: () => void;
  onSave: (section: DialogSection) => void;
}

const SectionFormDialog = ({
  open,
  existingSections = [],
  editingSection,
  ticketTypes = [],
  accent = DEFAULT_ACCENT,
  defaultTicketType,
  onClose,
  onSave,
}: SectionFormDialogProps) => {
  const { success } = useNotification();
  const reqError = useFieldError();
  const formRef = useRef<Partial<DialogSection>>({});

  const [form, setForm] = useState<Partial<DialogSection>>({});
  const [duplicateAlert, setDuplicateAlert] = useState<string | null>(null);
  const [touched, setTouched] = useState<{
    title?: boolean;
    fieldUse?: boolean;
  }>({});
  const [requiredErrors, setRequiredErrors] = useState<{
    title?: string;
    fieldUse?: string;
  }>({});

  const [fieldUseExpanded, setFieldUseExpanded] = useState(false);

  const isEditMode = !!editingSection;

  // Build empty use-flags map keyed by ticket type `type` string
  const emptyUseFlags = useMemo(() => {
    const m: Record<string, boolean> = {};
    for (const tt of ticketTypes) m[tt.type] = false;
    return m;
  }, [ticketTypes]);

  const updateForm = (
    patch: Partial<DialogSection> | ((f: Partial<DialogSection>) => Partial<DialogSection>),
  ) => {
    formRef.current =
      typeof patch === 'function' ? patch(formRef.current) : { ...formRef.current, ...patch };
    setForm(formRef.current);
  };

  const getCheckedCount = () => ticketTypes.filter((tt) => !!form.accessControl?.[tt.type]).length;

  const getTotalCount = () => ticketTypes.length;

  const handleSelectAllAccessControl = (checked: boolean) => {
    const newFlags: Record<string, boolean> = {};
    for (const tt of ticketTypes) newFlags[tt.type] = checked;
    updateForm((f) => ({ ...f, accessControl: newFlags }));
  };

  // Initialize form state when dialog opens / editing changes
  useEffect(() => {
    if (!open) return;
    setTouched({});
    setRequiredErrors({});
    setDuplicateAlert(null);
    setFieldUseExpanded(false);

    const initial: Partial<DialogSection> = editingSection
      ? {
          id: editingSection.id,
          title: editingSection.title,
          fields: [...editingSection.fields],
          accessControl: editingSection.accessControl
            ? { ...editingSection.accessControl }
            : (() => {
                const flags: Record<string, boolean> = {};
                for (const tt of ticketTypes) flags[tt.type] = false;
                return flags;
              })(),
        }
      : {
          title: '',
          fields: [],
          accessControl: (() => {
            const flags: Record<string, boolean> = {};
            for (const tt of ticketTypes) flags[tt.type] = false;
            return flags;
          })(),
        };

    formRef.current = initial;
    setForm(initial);
  }, [open, editingSection, ticketTypes]);

  const validateRequired = (_f: Partial<DialogSection>): typeof requiredErrors => {
    const errs: typeof requiredErrors = {};
    if (!String(formRef.current.title ?? '').trim()) errs.title = 'required';
    return errs;
  };

  const computeDuplicateMessage = (): string | null => {
    const name = stripAlphaNumeric(String(formRef.current.title ?? ''))
      .trim()
      .toLowerCase();
    if (!name) return null;
    const exists = existingSections.some(
      (s) => stripAlphaNumeric(s.title).trim().toLowerCase() === name,
    );
    // In edit mode, exclude the current section from duplicate check
    if (exists && editingSection) {
      const currentName = stripAlphaNumeric(editingSection.title).trim().toLowerCase();
      if (name === currentName) return null;
    }
    if (exists) return 'Section Name already exists. Please use a different value.';
    return null;
  };

  // Live duplicate check
  useEffect(() => {
    if (!open) return;
    setDuplicateAlert(computeDuplicateMessage());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, open, existingSections, editingSection]);

  const handleSubmit = () => {
    const reqErrs = validateRequired(formRef.current);
    setRequiredErrors(reqErrs);
    setTouched({ title: true, fieldUse: true });
    if (Object.keys(reqErrs).length > 0) return;

    const dup = computeDuplicateMessage();
    if (dup) {
      setDuplicateAlert(dup);
      return;
    }
    setDuplicateAlert(null);

    const result: DialogSection = {
      id: editingSection ? editingSection.id : `custom_${Date.now()}`,
      title: formRef.current.title!.trim(),
      fields: editingSection ? [...editingSection.fields] : [],
      accessControl: formRef.current.accessControl,
    };
    onSave(result);
    success(isEditMode ? 'Section updated successfully' : 'Section added successfully');
  };

  const titleError = reqError(touched.title, requiredErrors.title);

  return (
    <ConfigFormDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      isEdit={isEditMode}
      icon={<ViewModuleIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
      accent={accent}
      title={isEditMode ? 'Edit Custom Section' : 'Custom Section'}
      submitLabel={isEditMode ? 'Update' : 'Submit'}
      maxWidth='lg'
    >
      {duplicateAlert && (
        <Alert severity='error' variant='outlined' sx={{ mb: 1 }}>
          {duplicateAlert}
        </Alert>
      )}

      {/* Section Name — required */}
      <Box>
        <TextField
          label='Section Name'
          placeholder='Enter section name'
          value={form.title ?? ''}
          onChange={(e) => updateForm((f) => ({ ...f, title: e.target.value }))}
          onBlur={() => setTouched((t) => ({ ...t, title: true }))}
          fullWidth
          size='small'
          required
          error={Boolean(titleError)}
          helperText={titleError}
          autoFocus
        />
      </Box>

      {/* ── Access Control ── */}
      <Box
        sx={{
          border: '1px solid',
          borderColor: alpha(accent, 0.3),
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box
          onClick={() => setFieldUseExpanded(!fieldUseExpanded)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1.5,
            cursor: 'pointer',
            bgcolor: alpha(accent, 0.04),
            transition: 'background-color 0.2s',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant='body2'
              color={accent}
              sx={{ fontWeight: 600, fontSize: '0.85rem' }}
            >
              Access Control
            </Typography>
            <Typography variant='caption' color={accent}>
              {getCheckedCount()} of {getTotalCount()} selected
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Checkbox
              size='small'
              checked={getCheckedCount() > 0}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => handleSelectAllAccessControl(getCheckedCount() !== getTotalCount())}
              sx={{
                color: accent,
                '&.Mui-checked': { color: accent },
              }}
            />
            <Typography
              variant='caption'
              sx={{ fontWeight: 500, color: accent, cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectAllAccessControl(getCheckedCount() !== getTotalCount());
              }}
            >
              {getCheckedCount() === getTotalCount() ? 'Unselect All' : 'Select All'}
            </Typography>
          </Box>
        </Box>

        <Collapse in={fieldUseExpanded}>
          <Box sx={{ px: 2, pb: 2 }}>
            {ticketTypes.map((tt) => {
              const checked = !!form.accessControl?.[tt.type];
              return (
                <Box
                  key={tt.type}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    py: 0.75,
                    borderBottom: '1px solid',
                    borderColor: alpha(accent, 0.3),
                    '&:last-child': { borderBottom: 'none' },
                  }}
                >
                  <Checkbox
                    checked={checked}
                    onChange={(e) =>
                      updateForm((f) => ({
                        ...f,
                        accessControl: { ...(f.accessControl ?? {}), [tt.type]: e.target.checked },
                      }))
                    }
                    sx={{
                      color: accent,
                      '&.Mui-checked': { color: accent },
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='body2' sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                      {tt.name}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Collapse>
      </Box>
    </ConfigFormDialog>
  );
};

export default SectionFormDialog;
