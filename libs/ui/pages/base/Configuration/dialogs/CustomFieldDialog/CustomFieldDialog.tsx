import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Alert,
  Box,
  Typography,
  TextField,
  Paper,
  IconButton,
  Button,
  MenuItem,
} from '@serviceops/component';
import {
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Stack,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import {
  AddCircle,
  AccountTree,
  Clear as ClearIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useFieldError, useNotification } from '@serviceops/hooks';
import { ICustomField, CustomFieldType, IConfigCategorization } from '@serviceops/interfaces';
import { ConfigFormDialog } from '@serviceops/configdialogs';
import { generateCustomFieldKey } from '../../utils/ticketTypeLayoutConfig';

const CF_ACCENT = '#7c3aed';

const FIELD_TYPES: { value: CustomFieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
];

const ALNUM_PATTERN = /[^A-Za-z0-9 _-]/g;
const stripAlphaNumeric = (v: string): string => String(v ?? '').replace(ALNUM_PATTERN, '');

interface PathOption {
  value: string;
  label: string;
  level:
    | 'businessCategory'
    | 'serviceLine'
    | 'application'
    | 'queue'
    | 'applicationCategory'
    | 'applicationSubCategory';
}

interface CustomFieldDialogProps {
  open: boolean;
  editing: ICustomField | null;
  existingFields: ICustomField[];
  categorization?: IConfigCategorization;
  /** Ticket types to show in the Field Use list. Pass `{type, displayName}` tuples. */
  ticketTypes?: { type: string; displayName: string }[];
  onClose: () => void;
  onSave: (field: ICustomField) => void;
  subtitle?: string;
}

const CustomFieldDialog = ({
  open,
  editing,
  existingFields = [],
  categorization,
  ticketTypes = [],
  onClose,
  onSave,
  subtitle,
}: CustomFieldDialogProps) => {
  const { success } = useNotification();
  const reqError = useFieldError();

  const [form, setForm] = useState<Partial<ICustomField>>({});
  const [dropdownOptionInput, setDropdownOptionInput] = useState<string>('');
  const [duplicateAlert, setDuplicateAlert] = useState<string | null>(null);
  const [touched, setTouched] = useState<{
    fieldName?: boolean;
    fieldType?: boolean;
    fieldUse?: boolean;
  }>({});
  const [requiredErrors, setRequiredErrors] = useState<{
    fieldName?: string;
    fieldType?: string;
    fieldUse?: string;
  }>({});

  // Derive an empty use-flags map keyed by the ticket type `type` string.
  // Special keys `__createTicket__` and `__ticketDetails__` are reserved.
  const emptyUseFlags = useMemo(() => {
    const m: Record<string, boolean> = {};
    for (const tt of ticketTypes) m[tt.type] = false;
    return m;
  }, [ticketTypes]);

  const [pathInput, setPathInput] = useState<string>('');
  const [pathOptionsOpen, setPathOptionsOpen] = useState(false);
  const [pathFiltered, setPathFiltered] = useState<PathOption[]>([]);
  const pathDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Field Name searchable state (mirrors path picker exactly)
  const [nameInput, setNameInput] = useState<string>('');
  const [nameOptionsOpen, setNameOptionsOpen] = useState(false);
  const [nameFiltered, setNameFiltered] = useState<string[]>([]);
  const nameDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Type searchable-dropdown state (mirrors path picker exactly)
  const [typeInput, setTypeInput] = useState<string>('');
  const [typeOptionsOpen, setTypeOptionsOpen] = useState(false);
  const [typeFiltered, setTypeFiltered] = useState<typeof FIELD_TYPES>([]);
  const typeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const formRef = useRef<Partial<ICustomField>>({});

  const updateForm = (
    patch: Partial<ICustomField> | ((f: Partial<ICustomField>) => Partial<ICustomField>),
  ) => {
    formRef.current =
      typeof patch === 'function' ? patch(formRef.current) : { ...formRef.current, ...patch };
    setForm(formRef.current);
  };

  const allPathOptions = useMemo<PathOption[]>(() => {
    if (!categorization) return [];
    const opts: PathOption[] = [];
    for (const bc of categorization.businessCategories ?? []) {
      opts.push({ value: bc.name, label: bc.name, level: 'businessCategory' });
    }
    for (const sl of categorization.serviceLines ?? []) {
      opts.push({
        value: `${sl.businessCategoryName} → ${sl.name}`,
        label: `${sl.businessCategoryName} → ${sl.name}`,
        level: 'serviceLine',
      });
    }
    for (const app of categorization.applications ?? []) {
      opts.push({
        value: `${app.serviceLineName} → ${app.name}`,
        label: `${app.serviceLineName} → ${app.name}`,
        level: 'application',
      });
    }
    for (const q of categorization.queues ?? []) {
      opts.push({
        value: `${q.applicationName} → ${q.name}`,
        label: `${q.applicationName} → ${q.name}`,
        level: 'queue',
      });
    }
    for (const cat of categorization.applicationCategories ?? []) {
      opts.push({
        value: `${cat.applicationName} → ${cat.categoryName}`,
        label: `${cat.applicationName} → ${cat.categoryName}`,
        level: 'applicationCategory',
      });
    }
    for (const sub of categorization.applicationSubCategories ?? []) {
      opts.push({
        value: `${sub.applicationCategoryName} → ${sub.subCategoryName}`,
        label: `${sub.applicationCategoryName} → ${sub.subCategoryName}`,
        level: 'applicationSubCategory',
      });
    }
    return opts;
  }, [categorization]);

  useEffect(() => {
    if (!open) return;
    setTouched({});
    setRequiredErrors({});
    setDuplicateAlert(null);
    setDropdownOptionInput('');
    setPathOptionsOpen(false);
    setPathFiltered([]);
    setNameOptionsOpen(false);
    setNameInput('');
    setTypeOptionsOpen(false);
    setTypeInput('');

    const initial: Partial<ICustomField> = editing
      ? {
          id: editing.id,
          fieldKey: editing.fieldKey,
          fieldName: editing.fieldName,
          fieldType: editing.fieldType,
          path: editing.path,
          dropdownOptions: editing.dropdownOptions ? [...editing.dropdownOptions] : [],
          defaultValue: editing.defaultValue,
          fieldUse: { ...editing.fieldUse },
          displayOrder: editing.displayOrder,
        }
      : {
          fieldName: '',
          fieldType: 'text',
          dropdownOptions: [],
          fieldUse: { __createTicket__: true, __ticketDetails__: false, ...emptyUseFlags },
        };
    formRef.current = initial;
    setForm(initial);
    setPathInput(editing?.path ?? '');
    setNameInput(editing?.fieldName ?? '');
    setTypeInput(
      editing ? (FIELD_TYPES.find((ft) => ft.value === editing.fieldType)?.label ?? '') : '',
    );
  }, [open, editing]);

  const searchPaths = (query: string): PathOption[] => {
    const q = query.trim().toLowerCase();
    if (!q) return allPathOptions;
    return allPathOptions.filter((o) => o.label.toLowerCase().includes(q));
  };

  const handlePathInputChange = (value: string) => {
    setPathInput(value);
    if (pathDebounceRef.current) clearTimeout(pathDebounceRef.current);
    pathDebounceRef.current = setTimeout(() => {
      const next = searchPaths(value);
      setPathFiltered(next);
      setPathOptionsOpen(next.length > 0);
    }, 200);
  };

  const handlePathSelect = (opt: PathOption) => {
    setPathInput(opt.label);
    setPathOptionsOpen(false);
    updateForm((f) => ({ ...f, path: opt.value }));
  };

  // ── Field Name search/filter (mirrors path picker) ──────
  const searchNames = (query: string): string[] => {
    const q = query.trim().toLowerCase();
    if (!q) return existingFields.map((f) => f.fieldName);
    return existingFields.map((f) => f.fieldName).filter((n) => n.toLowerCase().includes(q));
  };

  const handleNameInputChange = (value: string) => {
    setNameInput(value);
    if (nameDebounceRef.current) clearTimeout(nameDebounceRef.current);
    nameDebounceRef.current = setTimeout(() => {
      const next = searchNames(value);
      setNameFiltered(next);
      setNameOptionsOpen(next.length > 0);
    }, 200);
  };

  const handleNameSelect = (name: string) => {
    setNameInput(name);
    setNameOptionsOpen(false);
    updateForm((f) => ({ ...f, fieldName: name }));
  };

  const handleNameClear = () => {
    setNameInput('');
    setNameOptionsOpen(false);
    updateForm((f) => ({ ...f, fieldName: '' }));
  };

  // ── Type search/filter (mirrors path picker) ──────────────
  const searchTypes = (query: string): typeof FIELD_TYPES => {
    const q = query.trim().toLowerCase();
    if (!q) return FIELD_TYPES;
    return FIELD_TYPES.filter((t) => t.label.toLowerCase().includes(q));
  };

  const handleTypeInputChange = (value: string) => {
    setTypeInput(value);
    if (typeDebounceRef.current) clearTimeout(typeDebounceRef.current);
    typeDebounceRef.current = setTimeout(() => {
      const next = searchTypes(value);
      setTypeFiltered(next);
      setTypeOptionsOpen(next.length > 0);
    }, 200);
  };

  const handleTypeSelect = (label: string, value: CustomFieldType) => {
    setTypeInput(label);
    setTypeOptionsOpen(false);
    updateForm((f) => ({
      ...f,
      fieldType: value,
      dropdownOptions: value === 'dropdown' ? (f.dropdownOptions ?? []) : [],
    }));
  };

  const handleTypeClear = () => {
    setTypeInput('');
    setTypeOptionsOpen(false);
    updateForm((f) => ({ ...f, fieldType: 'text' }));
  };

  const handlePathClear = () => {
    setPathInput('');
    setPathOptionsOpen(false);
    updateForm((f) => ({ ...f, path: undefined }));
  };

  const validateRequired = (f: Partial<ICustomField>): typeof requiredErrors => {
    const errs: typeof requiredErrors = {};
    if (!String(f.fieldName ?? '').trim()) errs.fieldName = 'required';
    if (!f.fieldType) errs.fieldType = 'required';
    if (!f.fieldUse || Object.values(f.fieldUse).every((v) => !v)) {
      errs.fieldUse = 'Select at least one';
    }
    return errs;
  };

  const computeDuplicateMessage = (f: Partial<ICustomField>): string | null => {
    const myId = editing?.id;
    const others = existingFields.filter((cf) => cf.id !== myId);
    const name = stripAlphaNumeric(String(f.fieldName ?? ''))
      .trim()
      .toLowerCase();
    if (!name) return null;
    if (others.some((cf) => stripAlphaNumeric(cf.fieldName).trim().toLowerCase() === name)) {
      return 'Field Name already exists. Please use a different value.';
    }
    return null;
  };

  useEffect(() => {
    if (!open) return;
    setDuplicateAlert(computeDuplicateMessage(formRef.current));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, open, editing, existingFields]);

  const handleSubmit = () => {
    const reqErrs = validateRequired(formRef.current);
    setRequiredErrors(reqErrs);
    setTouched({ fieldName: true, fieldType: true, fieldUse: true });
    if (Object.keys(reqErrs).length > 0) return;

    const dup = computeDuplicateMessage(formRef.current);
    if (dup) {
      setDuplicateAlert(dup);
      return;
    }

    const id = editing?.id ?? `cf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const fieldKey = editing?.fieldKey ?? generateCustomFieldKey(id);
    const displayOrder = editing?.displayOrder ?? existingFields.length;

    const result: ICustomField = {
      id,
      fieldKey,
      fieldName: formRef.current.fieldName!,
      fieldType: formRef.current.fieldType!,
      path: formRef.current.path,
      dropdownOptions:
        formRef.current.fieldType === 'dropdown' ? formRef.current.dropdownOptions : undefined,
      defaultValue: formRef.current.defaultValue,
      fieldUse: formRef.current.fieldUse!,
      displayOrder,
    };

    onSave(result);
    success(editing ? 'Custom field updated successfully' : 'Custom field added successfully');
  };

  const fieldNameError = reqError(touched.fieldName, requiredErrors.fieldName);
  const fieldTypeError = reqError(touched.fieldType, requiredErrors.fieldType);
  const fieldUseError = reqError(touched.fieldUse, requiredErrors.fieldUse);

  const handleAddDropdownOption = () => {
    const v = dropdownOptionInput.trim();
    if (!v) return;
    const current = formRef.current.dropdownOptions ?? [];
    if (current.includes(v)) {
      setDropdownOptionInput('');
      return;
    }
    updateForm((f) => ({ ...f, dropdownOptions: [...(f.dropdownOptions ?? []), v] }));
    setDropdownOptionInput('');
  };

  const handleRemoveDropdownOption = (idx: number) => {
    updateForm((f) => ({
      ...f,
      dropdownOptions: (f.dropdownOptions ?? []).filter((_, i) => i !== idx),
    }));
  };

  const isDropdown = form.fieldType === 'dropdown';

  const typeDisplayValue = (form.fieldType || 'text') as string;

  return (
    <ConfigFormDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      isEdit={!!editing}
      icon={<AccountTree sx={{ color: '#fff', fontSize: '1.1rem' }} />}
      accent={CF_ACCENT}
      title='Custom Field'
      subtitle={subtitle}
      submitDisabled={false}
      submitLabel={editing ? 'Save' : 'Submit'}
      maxWidth='md'
    >
      {duplicateAlert && (
        <Alert severity='error' variant='outlined' sx={{ mb: 1 }}>
          {duplicateAlert}
        </Alert>
      )}

      <Box sx={{ mt: 1, position: 'relative' }}>
        <TextField
          label='Field Name'
          placeholder='Type or select a field name...'
          value={nameInput}
          onChange={(e) => handleNameInputChange(e.target.value)}
          onFocus={() => {
            const next = searchNames(nameInput);
            setNameFiltered(next);
            if (next.length > 0) setNameOptionsOpen(true);
          }}
          onBlur={() => setTimeout(() => setNameOptionsOpen(false), 200)}
          fullWidth
          size='small'
          required
          error={Boolean(fieldNameError)}
          helperText={fieldNameError}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {nameInput ? (
                    <ClearIcon
                      onClick={handleNameClear}
                      sx={{ fontSize: 18, color: 'text.primary', cursor: 'pointer' }}
                    />
                  ) : (
                    <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  )}
                </Box>
              </InputAdornment>
            ),
          }}
        />
        {nameOptionsOpen && nameFiltered.length > 0 && (
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
              {nameFiltered.map((name) => (
                <ListItem key={name} disablePadding>
                  <ListItemButton
                    onClick={() => handleNameSelect(name)}
                    sx={{
                      py: 1,
                      px: 1.5,
                      '&:hover': { bgcolor: 'rgba(124,58,237,0.08)' },
                    }}
                  >
                    <ListItemText
                      primary={name}
                      primaryTypographyProps={{ fontSize: '0.84rem', noWrap: true }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Box>

      <Box sx={{ mt: 1, position: 'relative' }}>
        <TextField
          label='Type'
          placeholder='Select type...'
          value={typeInput}
          onChange={(e) => handleTypeInputChange(e.target.value)}
          onFocus={() => {
            const next = searchTypes(typeInput);
            setTypeFiltered(next);
            if (next.length > 0) setTypeOptionsOpen(true);
          }}
          onBlur={() => setTimeout(() => setTypeOptionsOpen(false), 200)}
          fullWidth
          size='small'
          required
          error={Boolean(fieldTypeError)}
          helperText={fieldTypeError}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {typeInput ? (
                    <ClearIcon
                      onClick={handleTypeClear}
                      sx={{ fontSize: 18, color: 'text.primary', cursor: 'pointer' }}
                    />
                  ) : (
                    <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  )}
                </Box>
              </InputAdornment>
            ),
          }}
        />
        {typeOptionsOpen && typeFiltered.length > 0 && (
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
              {typeFiltered.map((ft) => (
                <ListItem key={ft.value} disablePadding>
                  <ListItemButton
                    onClick={() => handleTypeSelect(ft.label, ft.value)}
                    sx={{
                      py: 1,
                      px: 1.5,
                      '&:hover': { bgcolor: 'rgba(124,58,237,0.08)' },
                    }}
                  >
                    <ListItemText
                      primary={ft.label}
                      primaryTypographyProps={{ fontSize: '0.84rem', noWrap: true }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Box>

      {isDropdown && (
        <Box>
          <Typography variant='body2' sx={{ fontWeight: 600, mb: 0.5, mt: 1 }}>
            Dropdown Options
          </Typography>
          <Stack direction='row' spacing={1} sx={{ mb: 1 }}>
            <TextField
              size='small'
              fullWidth
              value={dropdownOptionInput}
              onChange={(e) => setDropdownOptionInput(e.target.value)}
              inputProps={{
                onKeyDown: (e: any) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddDropdownOption();
                  }
                },
              }}
              placeholder='Add option and press Enter'
            />
            <Button
              variant='outlined'
              startIcon={<AddCircle />}
              onClick={handleAddDropdownOption}
              sx={{ flexShrink: 0 }}
            >
              Add
            </Button>
          </Stack>
          {form.dropdownOptions && form.dropdownOptions.length > 0 && (
            <Paper variant='outlined' sx={{ p: 1 }}>
              {form.dropdownOptions.map((opt, idx) => (
                <Stack
                  key={`${opt}-${idx}`}
                  direction='row'
                  alignItems='center'
                  justifyContent='space-between'
                  sx={{
                    py: 0.5,
                    px: 1,
                    borderBottom: idx < form.dropdownOptions!.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant='body2'>{opt}</Typography>
                  <IconButton size='small' onClick={() => handleRemoveDropdownOption(idx)}>
                    <DeleteIcon fontSize='small' />
                  </IconButton>
                </Stack>
              ))}
            </Paper>
          )}
        </Box>
      )}

      {!isDropdown && (
        <TextField
          label='Default Value (optional)'
          size='small'
          value={form.defaultValue ?? ''}
          onChange={(e) => updateForm((f) => ({ ...f, defaultValue: e.target.value }))}
          placeholder='Default value for new tickets'
          fullWidth
          sx={{ mt: 1 }}
        />
      )}

      <Box sx={{ mt: 1, position: 'relative' }}>
        <TextField
          label='Path (optional)'
          placeholder='Search hierarchy...'
          value={pathInput}
          onChange={(e) => handlePathInputChange(e.target.value)}
          onFocus={() => {
            const next = searchPaths(pathInput);
            setPathFiltered(next);
            if (next.length > 0) setPathOptionsOpen(true);
          }}
          onBlur={() => setTimeout(() => setPathOptionsOpen(false), 200)}
          fullWidth
          size='small'
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {pathInput ? (
                    <ClearIcon
                      onClick={handlePathClear}
                      sx={{ fontSize: 18, color: 'text.primary', cursor: 'pointer' }}
                    />
                  ) : (
                    <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  )}
                </Box>
              </InputAdornment>
            ),
          }}
        />
        {pathOptionsOpen && pathFiltered.length > 0 && (
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
              {pathFiltered.map((opt) => (
                <ListItem key={`${opt.level}-${opt.value}`} disablePadding>
                  <ListItemButton
                    onClick={() => handlePathSelect(opt)}
                    sx={{
                      py: 1,
                      px: 1.5,
                      '&:hover': { bgcolor: 'rgba(124,58,237,0.08)' },
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
        )}
      </Box>

      <Box sx={{ mt: 1 }}>
        <Typography variant='body2' sx={{ fontWeight: 600, mb: 0.5 }}>
          Field Use <span style={{ color: '#d32f2f' }}>*</span>
        </Typography>

        {/* Global flags: Create Ticket / Ticket Details */}
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={!!form.fieldUse?.__createTicket__}
                onChange={(e) =>
                  updateForm((f) => ({
                    ...f,
                    fieldUse: { ...(f.fieldUse ?? {}), __createTicket__: e.target.checked },
                  }))
                }
                sx={{ color: CF_ACCENT, '&.Mui-checked': { color: CF_ACCENT } }}
              />
            }
            label='Create Ticket'
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={!!form.fieldUse?.__ticketDetails__}
                onChange={(e) =>
                  updateForm((f) => ({
                    ...f,
                    fieldUse: { ...(f.fieldUse ?? {}), __ticketDetails__: e.target.checked },
                  }))
                }
                sx={{ color: CF_ACCENT, '&.Mui-checked': { color: CF_ACCENT } }}
              />
            }
            label='Ticket Details'
          />
        </Box>

        {/* Per-ticket-type checkboxes */}
        {ticketTypes.length > 0 && (
          <>
            <Typography
              variant='caption'
              sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
            >
              Ticket Types
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              {ticketTypes.map((tt) => {
                const checked = !!form.fieldUse?.[tt.type];
                return (
                  <FormControlLabel
                    key={tt.type}
                    control={
                      <Checkbox
                        checked={checked}
                        onChange={(e) =>
                          updateForm((f) => ({
                            ...f,
                            fieldUse: {
                              ...(f.fieldUse ?? {}),
                              [tt.type]: e.target.checked,
                            },
                          }))
                        }
                        sx={{ color: CF_ACCENT, '&.Mui-checked': { color: CF_ACCENT } }}
                      />
                    }
                    label={tt.displayName || tt.type}
                  />
                );
              })}
            </Box>
          </>
        )}

        {fieldUseError && (
          <Typography
            variant='caption'
            sx={{ color: '#d32f2f', fontSize: '0.7rem', mt: 0.5, display: 'block' }}
          >
            {fieldUseError}
          </Typography>
        )}
      </Box>
    </ConfigFormDialog>
  );
};

export default CustomFieldDialog;
