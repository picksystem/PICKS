import { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, Alert, IconButton, Tooltip } from '@serviceops/component';
import { alpha, Checkbox, Collapse } from '@mui/material';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import { useFieldError, useNotification } from '@serviceops/hooks';
import { ConfigFormDialog } from '@serviceops/configdialogs';
import { SubSectionItem } from '@serviceops/interfaces';

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
  subSections: SubSectionItem[];
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
          subSections: editingSection.subSections ? [...editingSection.subSections] : [],
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
          subSections: [],
          fields: [],
          accessControl: (() => {
            const flags: Record<string, boolean> = {};
            for (const tt of ticketTypes) flags[tt.type] = false;
            if (defaultTicketType && flags.hasOwnProperty(defaultTicketType)) {
              flags[defaultTicketType] = true;
            }
            return flags;
          })(),
        };

    formRef.current = initial;
    setForm(initial);
  }, [open, editingSection, ticketTypes, defaultTicketType]);

  const validateRequired = (_f: Partial<DialogSection>): typeof requiredErrors => {
    const errs: typeof requiredErrors = {};
    if (!String(formRef.current.title ?? '').trim()) errs.title = 'required';
    if (
      !formRef.current.accessControl ||
      Object.values(formRef.current.accessControl).every((v) => !v)
    ) {
      errs.fieldUse = 'Select at least one';
    }
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
    if (exists && editingSection) {
      const currentName = stripAlphaNumeric(editingSection.title).trim().toLowerCase();
      if (name === currentName) return null;
    }
    if (exists) return 'Section Name already exists. Please use a different value.';
    return null;
  };

  useEffect(() => {
    if (!open) return;
    setDuplicateAlert(computeDuplicateMessage());
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
      subSections: (formRef.current.subSections ?? []).filter((s) => s.name.trim()),
      fields: editingSection ? [...editingSection.fields] : [],
      accessControl: formRef.current.accessControl,
    };
    onSave(result);
    success(isEditMode ? 'Section updated successfully' : 'Section added successfully');
  };

  // ── Sub-section handlers (inline, no separate dialog) ────────────

  const handleAddSubSection = () => {
    const id = `sub_${Date.now()}`;
    const newSub: SubSectionItem = { id, name: '' };
    updateForm((f) => ({
      ...f,
      subSections: [...(f.subSections ?? []), newSub],
    }));
  };

  const handleRemoveSubSection = (id: string) => {
    updateForm((f) => ({
      ...f,
      subSections: (f.subSections ?? []).filter((s) => s.id !== id),
    }));
  };

  const handleSubSectionNameChange = (id: string, name: string) => {
    updateForm((f) => ({
      ...f,
      subSections: (f.subSections ?? []).map((s) => (s.id === id ? { ...s, name } : s)),
    }));
  };

  const titleError = reqError(touched.title, requiredErrors.title);
  const currentSubSections = form.subSections ?? [];

  return (
    <ConfigFormDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      isEdit={isEditMode}
      icon={<ViewModuleIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
      accent={accent}
      title={isEditMode ? 'Custom Section' : 'Custom Section'}
      submitLabel={isEditMode ? 'Update' : 'Submit'}
      maxWidth='sm'
    >
      {duplicateAlert && (
        <Alert severity='error' variant='outlined' sx={{ mb: 1 }}>
          {duplicateAlert}
        </Alert>
      )}

      {/* Section Name */}
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
        sx={{ mb: 2 }}
      />

      {/* ── Sub Sections (inline, like Dropdown Options) ── */}
      <Box sx={{ border: `1px solid ${alpha(accent, 0.3)}`, borderRadius: 2, overflow: 'hidden' }}>
        {/* Header */}
        <Box sx={{ px: 2, py: 1.5, bgcolor: alpha(accent, 0.04) }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography
              variant='body2'
              color={accent}
              sx={{ fontWeight: 600, fontSize: '0.85rem' }}
            >
              Sub Sections (Optional)
            </Typography>
            <Tooltip title='Add Sub Section'>
              <IconButton
                size='small'
                onClick={handleAddSubSection}
                sx={{
                  bgcolor: accent,
                  color: '#fff',
                  '&:hover': { bgcolor: accent, opacity: 0.85 },
                  width: 28,
                  height: 28,
                }}
              >
                <AddCircleOutlineIcon sx={{ fontSize: '1.1rem' }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Rows */}
        {currentSubSections.length > 0 && (
          <Box>
            {currentSubSections.map((sub, idx) => (
              <Box
                key={sub.id}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderBottom: idx < currentSubSections.length - 1 ? '1px solid' : 'none',
                  borderColor: alpha(accent, 0.2),
                }}
              >
                {/* Sub-section name row */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 0.75,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      variant='outlined'
                      size='small'
                      fullWidth
                      placeholder='Sub-section name'
                      value={sub.name}
                      onChange={(e) => handleSubSectionNameChange(sub.id, e.target.value)}
                      sx={{ '& .MuiOutlinedInput-root': { mt: 0, mb: 0 } }}
                    />
                  </Box>
                  <Tooltip title='Remove sub section'>
                    <IconButton size='small' onClick={() => handleRemoveSubSection(sub.id)}>
                      <DeleteIcon sx={{ fontSize: '1.1rem' }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {currentSubSections.length === 0 && (
          <Box sx={{ px: 2, py: 1.5, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.78rem', color: 'text.disabled', fontStyle: 'italic' }}>
              No sub sections added. Click "Add Sub Section" to create one.
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── Access Control ── */}
      <Box
        sx={{
          border: '1px solid',
          borderColor: alpha(accent, 0.3),
          borderRadius: 2,
          overflow: 'hidden',
          mt: 2,
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
              Access Control{' '}
              <Box component='span' sx={{ color: '#d32f2f', fontSize: '0.85rem', lineHeight: 1 }}>
                *
              </Box>
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
            <Typography variant='caption' color={accent} sx={{ fontSize: '0.75rem' }}>
              {getCheckedCount()} of {getTotalCount()} selected
            </Typography>
            <Checkbox
              size='small'
              indeterminate={getCheckedCount() > 0 && getCheckedCount() < getTotalCount()}
              checked={getCheckedCount() === getTotalCount()}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => handleSelectAllAccessControl(getCheckedCount() === getTotalCount())}
              sx={{
                color: accent,
                '&.Mui-checked': { color: accent },
                '&.MuiIndeterminate': { color: accent },
              }}
            />
            <Typography
              variant='caption'
              sx={{ fontWeight: 500, color: accent, fontSize: '0.75rem', cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectAllAccessControl(getCheckedCount() !== getTotalCount());
              }}
            >
              Select All
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
                    py: 1,
                    borderBottom: '1px solid',
                    borderColor: 'rgba(0,0,0,0.06)',
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
                    <Typography variant='body2' sx={{ fontWeight: 500, fontSize: '0.84rem' }}>
                      {tt.name}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Collapse>

        {requiredErrors.fieldUse && (
          <Typography
            variant='caption'
            sx={{ color: '#d32f2f', fontSize: '0.7rem', px: 2, pb: 1, display: 'block' }}
          >
            {requiredErrors.fieldUse}
          </Typography>
        )}
      </Box>
    </ConfigFormDialog>
  );
};

export default SectionFormDialog;
