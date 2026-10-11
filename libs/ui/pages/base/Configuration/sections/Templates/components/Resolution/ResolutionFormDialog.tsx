import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, TextField, Button, FormControlLabel } from '@serviceops/component';
import {
  alpha,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  darken,
  Dialog,
  DialogContent,
  DialogActions,
  Divider,
  Switch,
} from '@mui/material';
import { Clear as ClearIcon, Search as SearchIcon } from '@mui/icons-material';
import { RichTextEditor, parseRichText } from '@serviceops/richtexteditor';
import type { IConfigResolutionTemplate } from '@serviceops/interfaces';
import { useFieldError } from '@serviceops/hooks';
import ChecklistIcon from '@mui/icons-material/Checklist';

interface ResolutionFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'select';
  initialData?: IConfigResolutionTemplate | null;
  onSave: (data: Record<string, unknown>) => void;
  accent?: string;
  statusOptions?: { value: string; label: string }[];
  applicationOptions?: { value: string; label: string }[];
  categoryOptions?: { value: string; label: string }[];
  subCategoryOptions?: { value: string; label: string }[];
  resolutionCodeOptions?: { value: string; label: string }[];
}

const createEmptyForm = () => ({
  name: '',
  description: '',
  active: true,
  ticketStatus: '',
  application: '',
  applicationCategory: '',
  applicationSubCategory: '',
  receivedCustomerInformation: false,
  recurringIssue: false,
  rootCauseIdentified: false,
  workaroundIdentified: false,
  rootCause: '',
  resolutionCode: '',
  rootCauseId: '',
  workaroundId: '',
  resolution: '',
  resolutionInternalNote: '',
});

interface FormState {
  name: string;
  description: string;
  active: boolean;
  ticketStatus: string;
  application: string;
  applicationCategory: string;
  applicationSubCategory: string;
  receivedCustomerInformation: boolean;
  recurringIssue: boolean;
  rootCauseIdentified: boolean;
  workaroundIdentified: boolean;
  rootCause: string;
  resolutionCode: string;
  rootCauseId: string;
  workaroundId: string;
  resolution: string;
  resolutionInternalNote: string;
}

export const ResolutionFormDialog = ({
  open,
  onClose,
  mode,
  initialData,
  onSave,
  accent = '#0369a1',
  statusOptions = [],
  applicationOptions = [],
  categoryOptions = [],
  subCategoryOptions = [],
  resolutionCodeOptions = [],
}: ResolutionFormDialogProps) => {
  const [form, setForm] = useState<FormState>(createEmptyForm());
  const [touched, setTouched] = useState<{
    name?: boolean;
    ticketStatus?: boolean;
    description?: boolean;
    application?: boolean;
    applicationCategory?: boolean;
    applicationSubCategory?: boolean;
    resolutionCode?: boolean;
    rootCauseId?: boolean;
    workaroundId?: boolean;
    rootCause?: boolean;
    resolution?: boolean;
    resolutionInternalNote?: boolean;
  }>({});
  const [requiredErrors, setRequiredErrors] = useState<{
    name?: string;
    ticketStatus?: string;
    description?: string;
    application?: string;
    applicationCategory?: string;
    applicationSubCategory?: string;
    resolutionCode?: string;
    rootCauseId?: string;
    workaroundId?: string;
    rootCause?: string;
    resolution?: string;
    resolutionInternalNote?: string;
  }>({});

  const reqError = useFieldError();

  // ── Searchable field state ──────────────────────────────────────────
  const [tsInput, setTsInput] = useState<string>('');
  const [tsOpen, setTsOpen] = useState(false);
  const [tsFiltered, setTsFiltered] = useState<{ value: string; label: string }[]>([]);
  const tsDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [appInput, setAppInput] = useState<string>('');
  const [appOpen, setAppOpen] = useState(false);
  const [appFiltered, setAppFiltered] = useState<{ value: string; label: string }[]>([]);
  const appDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [catInput, setCatInput] = useState<string>('');
  const [catOpen, setCatOpen] = useState(false);
  const [catFiltered, setCatFiltered] = useState<{ value: string; label: string }[]>([]);
  const catDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [subInput, setSubInput] = useState<string>('');
  const [subOpen, setSubOpen] = useState(false);
  const [subFiltered, setSubFiltered] = useState<{ value: string; label: string }[]>([]);
  const subDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [rcInput, setRcInput] = useState<string>('');
  const [rcOpen, setRcOpen] = useState(false);
  const [rcFiltered, setRcFiltered] = useState<{ value: string; label: string }[]>([]);
  const rcDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local inputs with form values
  useEffect(() => {
    const stored = String(form.ticketStatus ?? '');
    if (stored !== tsInput) setTsInput(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.ticketStatus]);

  useEffect(() => {
    const stored = String(form.application ?? '');
    if (stored !== appInput) setAppInput(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.application]);

  useEffect(() => {
    const stored = String(form.applicationCategory ?? '');
    if (stored !== catInput) setCatInput(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.applicationCategory]);

  useEffect(() => {
    const stored = String(form.applicationSubCategory ?? '');
    if (stored !== subInput) setSubInput(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.applicationSubCategory]);

  useEffect(() => {
    const stored = String(form.resolutionCode ?? '');
    if (stored !== rcInput) setRcInput(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.resolutionCode]);

  // ── Searchable field helpers ───────────────────────────────────────
  const useSearchableField = (
    input: string,
    setInput: (v: string) => void,
    open: boolean,
    setOpen: (v: boolean) => void,
    filtered: { value: string; label: string }[],
    setFiltered: (v: { value: string; label: string }[]) => void,
    debounceRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
    options: { value: string; label: string }[],
    formField: keyof FormState,
  ) => {
    const handleSelect = useCallback(
      (opt: { value: string; label: string }) => {
        setInput(opt.label);
        setOpen(false);
        setFiltered([]);
        setForm((prev) => ({ ...prev, [formField]: opt.value }));
      },
      [setInput, setOpen, setFiltered, formField],
    );

    const handleClear = useCallback(() => {
      setInput('');
      setFiltered([]);
      setOpen(false);
      setForm((prev) => ({ ...prev, [formField]: '' }));
    }, [setInput, setFiltered, setOpen, formField]);

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInput(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          const q = val.trim().toLowerCase();
          const next = q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
          setFiltered(next);
          setOpen(next.length > 0);
        }, 150);
      },
      [options, debounceRef, setInput, setFiltered, setOpen],
    );

    const handleFocus = useCallback(() => {
      const q = input.trim().toLowerCase();
      const next = q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
      setFiltered(next);
      if (next.length > 0) setOpen(true);
    }, [input, options, setFiltered, setOpen]);

    const handleBlur = useCallback(() => {
      setTimeout(() => setOpen(false), 150);
    }, [setOpen]);

    const renderDropdown = () =>
      open && filtered.length > 0 ? (
        <Paper
          elevation={4}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            mt: 0,
            maxHeight: 280,
            overflow: 'auto',
          }}
        >
          <List dense disablePadding>
            {filtered.map((opt) => (
              <ListItem key={opt.value} disablePadding>
                <ListItemButton
                  onClick={() => handleSelect(opt)}
                  sx={{
                    py: 1,
                    px: 1.5,
                    '&:hover': { bgcolor: alpha(accent, 0.08) },
                  }}
                >
                  <ListItemText
                    primary={opt.label}
                    primaryTypographyProps={{ fontSize: '0.84rem', noWrap: true }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      ) : null;

    const endAdornment = input ? (
      <InputAdornment position='end'>
        <ClearIcon
          onClick={handleClear}
          sx={{ fontSize: 18, color: 'text.primary', cursor: 'pointer' }}
        />
      </InputAdornment>
    ) : (
      <InputAdornment position='end'>
        <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
      </InputAdornment>
    );

    return { handleInputChange, handleFocus, handleBlur, renderDropdown, endAdornment };
  };

  const tsSearch = useSearchableField(
    tsInput,
    setTsInput,
    tsOpen,
    setTsOpen,
    tsFiltered,
    setTsFiltered,
    tsDebounceRef,
    statusOptions,
    'ticketStatus',
  );
  const appSearch = useSearchableField(
    appInput,
    setAppInput,
    appOpen,
    setAppOpen,
    appFiltered,
    setAppFiltered,
    appDebounceRef,
    applicationOptions,
    'application',
  );
  const catSearch = useSearchableField(
    catInput,
    setCatInput,
    catOpen,
    setCatOpen,
    catFiltered,
    setCatFiltered,
    catDebounceRef,
    categoryOptions,
    'applicationCategory',
  );
  const subSearch = useSearchableField(
    subInput,
    setSubInput,
    subOpen,
    setSubOpen,
    subFiltered,
    setSubFiltered,
    subDebounceRef,
    subCategoryOptions,
    'applicationSubCategory',
  );
  const rcSearch = useSearchableField(
    rcInput,
    setRcInput,
    rcOpen,
    setRcOpen,
    rcFiltered,
    setRcFiltered,
    rcDebounceRef,
    resolutionCodeOptions,
    'resolutionCode',
  );

  const validateRequired = (f: FormState) => {
    const errs: typeof requiredErrors = {};
    if (!String(f.name ?? '').trim()) errs.name = 'required';
    if (!String(f.ticketStatus ?? '').trim()) errs.ticketStatus = 'required';
    if (!String(f.description ?? '').trim()) errs.description = 'required';
    if (!String(f.application ?? '').trim()) errs.application = 'required';
    if (!String(f.applicationCategory ?? '').trim()) errs.applicationCategory = 'required';
    if (!String(f.applicationSubCategory ?? '').trim()) errs.applicationSubCategory = 'required';
    if (!String(f.resolutionCode ?? '').trim()) errs.resolutionCode = 'required';
    if (!String(f.rootCauseId ?? '').trim()) errs.rootCauseId = 'required';
    if (!String(f.workaroundId ?? '').trim()) errs.workaroundId = 'required';
    if (!String(f.rootCause ?? '').trim()) errs.rootCause = 'required';
    if (!String(f.resolution ?? '').trim()) errs.resolution = 'required';
    if (!String(f.resolutionInternalNote ?? '').trim()) errs.resolutionInternalNote = 'required';
    return errs;
  };

  useEffect(() => {
    if (!open) return;
    setTouched({});
    setRequiredErrors({});
    setTsInput('');
    setTsOpen(false);
    setTsFiltered([]);
    setAppInput('');
    setAppOpen(false);
    setAppFiltered([]);
    setCatInput('');
    setCatOpen(false);
    setCatFiltered([]);
    setSubInput('');
    setSubOpen(false);
    setSubFiltered([]);
    setRcInput('');
    setRcOpen(false);
    setRcFiltered([]);

    if (initialData) {
      setForm({
        name: initialData.name,
        description: initialData.description,
        active: initialData.active,
        ticketStatus: initialData.ticketStatus,
        application: initialData.application,
        applicationCategory: initialData.applicationCategory,
        applicationSubCategory: initialData.applicationSubCategory,
        receivedCustomerInformation: initialData.receivedCustomerInformation,
        recurringIssue: initialData.recurringIssue,
        rootCauseIdentified: initialData.rootCauseIdentified,
        workaroundIdentified: (initialData as any).workaroundIdentified ?? false,
        rootCause: initialData.rootCause,
        resolutionCode: initialData.resolutionCode,
        rootCauseId: (initialData as any).rootCauseId ?? '',
        workaroundId: (initialData as any).workaroundId ?? '',
        resolution: initialData.resolution,
        resolutionInternalNote: initialData.resolutionInternalNote,
      });
    } else {
      setForm(createEmptyForm());
    }
  }, [open, initialData]);

  const handleChange = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    setTouched({
      name: true,
      ticketStatus: true,
      description: true,
      application: true,
      applicationCategory: true,
      applicationSubCategory: true,
      resolutionCode: true,
      rootCauseId: true,
      workaroundId: true,
      rootCause: true,
      resolution: true,
      resolutionInternalNote: true,
    });
    const errs = validateRequired(form);
    setRequiredErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const template: Record<string, unknown> = { ...form };
    if (initialData?.id) {
      template.id = initialData.id;
    }
    onSave(template);
  };

  const nameError = reqError(touched.name, requiredErrors.name);
  const ticketStatusError = reqError(touched.ticketStatus, requiredErrors.ticketStatus);
  const descriptionError = reqError(touched.description, requiredErrors.description);
  const applicationError = reqError(touched.application, requiredErrors.application);
  const applicationCategoryError = reqError(
    touched.applicationCategory,
    requiredErrors.applicationCategory,
  );
  const applicationSubCategoryError = reqError(
    touched.applicationSubCategory,
    requiredErrors.applicationSubCategory,
  );
  const resolutionCodeError = reqError(touched.resolutionCode, requiredErrors.resolutionCode);
  const rootCauseIdError = reqError(touched.rootCauseId, requiredErrors.rootCauseId);
  const workaroundIdError = reqError(touched.workaroundId, requiredErrors.workaroundId);
  const rootCauseError = reqError(touched.rootCause, requiredErrors.rootCause);
  const resolutionError = reqError(touched.resolution, requiredErrors.resolution);
  const resolutionInternalNoteError = reqError(
    touched.resolutionInternalNote,
    requiredErrors.resolutionInternalNote,
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
      disableEscapeKeyDown
      TransitionProps={{ unmountOnExit: true }}
      PaperProps={{ sx: { borderRadius: 2, overflow: 'hidden' } }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 2,
          background: `linear-gradient(135deg, ${darken(accent, 0.15)} 0%, ${accent} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 1,
              bgcolor: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChecklistIcon sx={{ fontSize: '1rem', color: '#fff' }} />
          </Box>
          <Box>
            <Typography
              sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', lineHeight: 1.2 }}
            >
              {mode === 'edit' ? 'Edit Resolution Template' : 'Add Resolution Template'}
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', mt: 0.2 }}>
              Define reusable resolution templates with root cause and resolution details
            </Typography>
          </Box>
        </Box>
      </Box>

      <DialogContent dividers sx={{ p: 0 }}>
        <Box sx={{ px: 2.5, py: 2 }}>
          {/* Row 1: Template Name + Ticket Status side-by-side */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
            <Box>
              <TextField
                label='Template Name'
                size='small'
                fullWidth
                value={form.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange('name', e.target.value)
                }
                required
                placeholder='Enter template name'
                inputProps={{ maxLength: 40 }}
                error={Boolean(nameError)}
                helperText={nameError}
              />
            </Box>
            <Box sx={{ position: 'relative' }}>
              <TextField
                label='Ticket Status'
                size='small'
                fullWidth
                value={tsInput}
                onChange={tsSearch.handleInputChange}
                onFocus={tsSearch.handleFocus}
                onBlur={tsSearch.handleBlur}
                placeholder='Search ticket status...'
                required
                error={Boolean(ticketStatusError)}
                helperText={ticketStatusError}
                slotProps={{ input: { endAdornment: tsSearch.endAdornment } }}
              />
              {tsSearch.renderDropdown()}
            </Box>
          </Box>

          {/* Row 2: Description (RichTextEditor) */}
          <Box sx={{ mb: 2 }}>
            <RichTextEditor
              value={parseRichText(form.description)}
              onChange={(value: { segments: Array<{ text: string }> }) => {
                const text = value.segments.map((s) => s.text).join('');
                handleChange('description', text);
              }}
              accent={accent}
              title='Description'
              placeholder='Enter description...'
              showFooterActions={false}
              required
            />
            {descriptionError && (
              <Typography sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                {descriptionError}
              </Typography>
            )}
          </Box>

          {/* Row 3: Application + Application Category side-by-side */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
            <Box sx={{ position: 'relative' }}>
              <TextField
                label='Application'
                size='small'
                fullWidth
                value={appInput}
                onChange={appSearch.handleInputChange}
                onFocus={appSearch.handleFocus}
                onBlur={appSearch.handleBlur}
                placeholder='Search application...'
                required
                error={Boolean(applicationError)}
                helperText={applicationError}
                slotProps={{ input: { endAdornment: appSearch.endAdornment } }}
              />
              {appSearch.renderDropdown()}
            </Box>
            <Box sx={{ position: 'relative' }}>
              <TextField
                label='Application Category'
                size='small'
                fullWidth
                value={catInput}
                onChange={catSearch.handleInputChange}
                onFocus={catSearch.handleFocus}
                onBlur={catSearch.handleBlur}
                placeholder='Search category...'
                required
                error={Boolean(applicationCategoryError)}
                helperText={applicationCategoryError}
                slotProps={{ input: { endAdornment: catSearch.endAdornment } }}
              />
              {catSearch.renderDropdown()}
            </Box>
          </Box>

          {/* Row 4: Application Sub-Category + Resolution Code side-by-side */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
            <Box sx={{ position: 'relative' }}>
              <TextField
                label='Application Sub-Category'
                size='small'
                fullWidth
                value={subInput}
                onChange={subSearch.handleInputChange}
                onFocus={subSearch.handleFocus}
                onBlur={subSearch.handleBlur}
                placeholder='Search sub-category...'
                required
                error={Boolean(applicationSubCategoryError)}
                helperText={applicationSubCategoryError}
                slotProps={{ input: { endAdornment: subSearch.endAdornment } }}
              />
              {subSearch.renderDropdown()}
            </Box>
            <Box sx={{ position: 'relative' }}>
              <TextField
                label='Resolution Code'
                size='small'
                fullWidth
                value={rcInput}
                onChange={rcSearch.handleInputChange}
                onFocus={rcSearch.handleFocus}
                onBlur={rcSearch.handleBlur}
                placeholder='Search resolution code...'
                required
                error={Boolean(resolutionCodeError)}
                helperText={resolutionCodeError}
                slotProps={{ input: { endAdornment: rcSearch.endAdornment } }}
              />
              {rcSearch.renderDropdown()}
            </Box>
          </Box>

          {/* Row 5: Root Cause ID + Workaround ID side-by-side */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
            <Box>
              <TextField
                label='Root Cause ID'
                size='small'
                fullWidth
                value={form.rootCauseId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange('rootCauseId', e.target.value)
                }
                placeholder='Enter root cause ID'
                required
                error={Boolean(rootCauseIdError)}
                helperText={rootCauseIdError}
                inputProps={{ maxLength: 40 }}
              />
            </Box>
            <Box>
              <TextField
                label='Workaround ID'
                size='small'
                fullWidth
                value={form.workaroundId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange('workaroundId', e.target.value)
                }
                placeholder='Enter workaround ID'
                required
                error={Boolean(workaroundIdError)}
                helperText={workaroundIdError}
                inputProps={{ maxLength: 40 }}
              />
            </Box>
          </Box>

          {/* Row 6: Root Cause (RichTextEditor) */}
          <Box sx={{ mb: 2 }}>
            <RichTextEditor
              value={parseRichText(form.rootCause)}
              onChange={(value: { segments: Array<{ text: string }> }) => {
                const text = value.segments.map((s) => s.text).join('');
                handleChange('rootCause', text);
              }}
              accent={accent}
              title='Root Cause'
              placeholder='Enter root cause...'
              showFooterActions={false}
              required
            />
            {rootCauseError && (
              <Typography sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                {rootCauseError}
              </Typography>
            )}
          </Box>

          {/* Row 7: Resolution (RichTextEditor) */}
          <Box sx={{ mb: 2 }}>
            <RichTextEditor
              value={parseRichText(form.resolution)}
              onChange={(value: { segments: Array<{ text: string }> }) => {
                const text = value.segments.map((s) => s.text).join('');
                handleChange('resolution', text);
              }}
              accent={accent}
              title='Resolution'
              placeholder='Enter resolution...'
              showFooterActions={false}
              required
            />
            {resolutionError && (
              <Typography sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                {resolutionError}
              </Typography>
            )}
          </Box>

          {/* Row 8: Internal Note (RichTextEditor) */}
          <Box sx={{ mb: 2 }}>
            <RichTextEditor
              value={parseRichText(form.resolutionInternalNote)}
              onChange={(value: { segments: Array<{ text: string }> }) => {
                const text = value.segments.map((s) => s.text).join('');
                handleChange('resolutionInternalNote', text);
              }}
              accent={accent}
              title='Internal Note'
              placeholder='Enter internal note...'
              showFooterActions={false}
              required
            />
            {resolutionInternalNoteError && (
              <Typography sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                {resolutionInternalNoteError}
              </Typography>
            )}
          </Box>

          {/* Row 9: All Switches at the bottom */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Divider />
            <Box
              sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 2 }}
            >
              {[
                { key: 'active', label: 'Active' },
                { key: 'receivedCustomerInformation', label: 'Received Customer Confirmation' },
                { key: 'recurringIssue', label: 'Recurring Issue' },
                { key: 'rootCauseIdentified', label: 'Root Cause Identified' },
                { key: 'workaroundIdentified', label: 'Workaround Identified' },
              ].map(({ key, label }) => (
                <FormControlLabel
                  key={key}
                  labelPlacement='start'
                  control={
                    <Switch
                      checked={form[key as keyof FormState] as boolean}
                      onChange={(e) => handleChange(key as keyof FormState, e.target.checked)}
                      size='small'
                    />
                  }
                  label={label}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{ px: 2.5, py: 1.5, borderTop: '1px solid', borderColor: 'divider', gap: 1 }}
      >
        <Button onClick={onClose} variant='outlined'>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant='contained'>
          {mode === 'edit' ? 'Update' : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
