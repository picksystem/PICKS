import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Alert,
  Box,
  Typography,
  TextField,
  Paper,
  IconButton,
  Button,
} from '@serviceops/component';
import {
  alpha,
  Checkbox,
  Collapse,
  Stack,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Switch,
  Tooltip,
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
import { useConfiguration } from '@serviceops/confighooks';
import ConfigPathPicker from '../CustomFieldDialog/ConfigPathPicker';
import { generateCustomFieldKey } from '../../utils/ticketTypeLayoutConfig';

const DEFAULT_ACCENT = '#0369a1';

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

interface CustomFieldFormDialogProps {
  open: boolean;
  editing: ICustomField | null;
  existingFields: ICustomField[];
  categorization?: IConfigCategorization;
  /** Ticket types to show in the Field Use list. Pass `{type, displayName, name}` tuples. */
  ticketTypes?: { type: string; displayName: string; name: string }[];
  /** Accent color for the header, buttons, and interactive elements. Defaults to `#0369a1`. */
  accent?: string;
  /** The ticket type `type` string to pre-check in Field Use when creating a new field. */
  defaultTicketType?: string;
  /** Which field-use flag should default to `true` for new fields.
   *  Pass `'__createTicket__'` or `'__ticketDetails__'`. Defaults to `'__createTicket__'`. */
  defaultFieldUseFlag?: '__createTicket__' | '__ticketDetails__';
  onClose: () => void;
  onSave: (field: ICustomField) => void;
  subtitle?: string;
}

const CustomFieldFormDialog = ({
  open,
  editing,
  existingFields = [],
  categorization,
  ticketTypes = [],
  accent = DEFAULT_ACCENT,
  defaultTicketType,
  defaultFieldUseFlag = '__createTicket__',
  onClose,
  onSave,
  subtitle,
}: CustomFieldFormDialogProps) => {
  const { success } = useNotification();
  const reqError = useFieldError();
  const { data: configData } = useConfiguration();

  const [form, setForm] = useState<Partial<ICustomField>>({});
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

  // Checkbox options: per-row entries shown when fieldType === 'checkbox'
  interface CheckboxOptionEntry {
    id: string;
    fieldName: string;
    fieldType: string;
    path: string;
  }
  const [checkboxOptions, setCheckboxOptions] = useState<CheckboxOptionEntry[]>([]);
  const [openTypeEntryId, setOpenTypeEntryId] = useState<string | null>(null);

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

  // Config Path Picker dialog state
  const [configPickerOpen, setConfigPickerOpen] = useState(false);
  // Tracks which checkbox option's path is being picked via ConfigPathPicker
  const [editingOptionPathId, setEditingOptionPathId] = useState<string | null>(null);

  // Field Use section expand/collapse
  const [fieldUseExpanded, setFieldUseExpanded] = useState(false);

  // Field Name state
  const [nameInput, setNameInput] = useState<string>('');

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
    return opts.sort((a, b) => a.label.localeCompare(b.label));
  }, [categorization]);

  useEffect(() => {
    if (!open) return;
    setTouched({});
    setRequiredErrors({});
    setDuplicateAlert(null);
    setPathOptionsOpen(false);
    setPathFiltered([]);
    setTypeOptionsOpen(false);
    setTypeInput('');
    setOpenTypeEntryId(null);

    const initial: Partial<ICustomField> = editing
      ? {
          id: editing.id,
          fieldKey: editing.fieldKey,
          fieldName: editing.fieldName,
          fieldType: editing.fieldType,
          path: editing.path,
          dropdownOptions: editing.dropdownOptions ? [...editing.dropdownOptions] : [],
          defaultValue: editing.defaultValue,
          isRequired: editing.isRequired ?? false,
          fieldUse: { ...emptyUseFlags, ...editing.fieldUse },
          displayOrder: editing.displayOrder,
        }
      : {
          fieldName: '',
          fieldType: 'text',
          dropdownOptions: [],
          isRequired: false,
          fieldUse: (() => {
            const flags: Record<string, boolean> = {
              __createTicket__: false,
              __ticketDetails__: false,
              ...emptyUseFlags,
            };
            flags[defaultFieldUseFlag] = true;
            if (
              defaultTicketType &&
              defaultTicketType !== defaultFieldUseFlag &&
              defaultTicketType !== '__createTicket__' &&
              defaultTicketType !== '__ticketDetails__'
            ) {
              flags[defaultTicketType] = true;
            }
            return flags;
          })(),
        };
    formRef.current = initial;
    setForm(initial);
    setPathInput(editing?.path ?? '');
    setNameInput(editing?.fieldName ?? '');
    setTypeInput(
      editing ? (FIELD_TYPES.find((ft) => ft.value === editing.fieldType)?.label ?? '') : '',
    );
  }, [open, editing, emptyUseFlags, defaultTicketType]);

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

  const handleNameClear = () => {
    setNameInput('');
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
      isRequired: formRef.current.isRequired ?? false,
      fieldUse: formRef.current.fieldUse!,
      displayOrder,
    };

    onSave(result);
    success(editing ? 'Custom field updated successfully' : 'Custom field added successfully');
  };

  const fieldNameError = reqError(touched.fieldName, requiredErrors.fieldName);
  const fieldTypeError = reqError(touched.fieldType, requiredErrors.fieldType);
  const fieldUseError = reqError(touched.fieldUse, requiredErrors.fieldUse);

  const handleAddBlankDropdownOption = () => {
    updateForm((f) => ({
      ...f,
      dropdownOptions: [...(f.dropdownOptions ?? []), ''],
    }));
  };

  const handleRemoveDropdownOption = (idx: number) => {
    updateForm((f) => ({
      ...f,
      dropdownOptions: (f.dropdownOptions ?? []).filter((_, i) => i !== idx),
    }));
  };

  // ── Checkbox option rows (shown when fieldType === 'checkbox') ──

  // Field Use helpers — only ticket types (not __createTicket__ / __ticketDetails__)
  const ticketTypeKeys = useMemo(() => ticketTypes.map((tt) => tt.type), [ticketTypes]);

  const getCheckedCount = () => ticketTypeKeys.filter((key) => !!form.fieldUse?.[key]).length;

  const getTotalCount = () => ticketTypeKeys.length;

  const handleSelectAllFieldUse = (checked: boolean) => {
    const newFlags: Record<string, boolean> = { ...(form.fieldUse ?? {}) };
    for (const key of ticketTypeKeys) newFlags[key] = checked;
    updateForm((f) => ({ ...f, fieldUse: newFlags }));
  };

  const handleAddCheckboxOption = () => {
    const entry: CheckboxOptionEntry = {
      id: `cb_${Date.now()}`,
      fieldName: '',
      fieldType: '',
      path: '',
    };
    setCheckboxOptions((prev) => [...prev, entry]);
  };

  const handleRemoveCheckboxOption = (id: string) => {
    setCheckboxOptions((prev) => prev.filter((e) => e.id !== id));
  };

  const handleCheckboxOptionChange = (id: string, patch: Partial<CheckboxOptionEntry>) => {
    setCheckboxOptions((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };

  const isDropdown = form.fieldType === 'dropdown';
  const isCheckbox = form.fieldType === 'checkbox';

  // Close row type dropdown when clicking outside it
  useEffect(() => {
    if (!openTypeEntryId) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-type-dropdown]')) {
        setOpenTypeEntryId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openTypeEntryId]);

  return (
    <ConfigFormDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      isEdit={!!editing}
      icon={<AccountTree sx={{ color: '#fff', fontSize: '1.1rem' }} />}
      accent={accent}
      title='Custom Field'
      subtitle={subtitle}
      submitDisabled={false}
      submitLabel={editing ? 'Save' : 'Submit'}
      maxWidth='lg'
    >
      {duplicateAlert && (
        <Alert severity='error' variant='outlined' sx={{ mb: 1 }}>
          {duplicateAlert}
        </Alert>
      )}

      <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
        {/* Field Name */}
        <Box sx={{ flex: 1 }}>
          <TextField
            label='Field Name'
            placeholder='Enter field name'
            value={nameInput}
            onChange={(e) => {
              setNameInput(e.target.value);
              updateForm((f) => ({ ...f, fieldName: e.target.value }));
            }}
            onBlur={() => {
              const current = formRef.current.fieldName ?? '';
              const dup = computeDuplicateMessage({ ...formRef.current, fieldName: current });
              if (dup) setDuplicateAlert(dup);
            }}
            fullWidth
            size='small'
            required
            error={Boolean(fieldNameError)}
            helperText={fieldNameError}
            slotProps={{
              input: {
                endAdornment: nameInput ? (
                  <InputAdornment position='end'>
                    <ClearIcon
                      onClick={handleNameClear}
                      sx={{ fontSize: 18, color: 'text.primary', cursor: 'pointer' }}
                    />
                  </InputAdornment>
                ) : undefined,
              },
            }}
          />
        </Box>

        {/* Type */}
        <Box sx={{ flex: 1, position: 'relative' }}>
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
            slotProps={{
              input: {
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
              },
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
                        '&:hover': { bgcolor: alpha(accent, 0.08) },
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
      </Box>

      {isDropdown && (
        <Box sx={{ border: `1px solid ${accent}`, borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ px: 2, py: 1.5, bgcolor: alpha(accent, 0.04) }}>
            <Stack direction='row' alignItems='center' justifyContent='space-between'>
              <Typography
                variant='body2'
                color={accent}
                sx={{ fontWeight: 600, fontSize: '0.85rem' }}
              >
                Dropdown Options
              </Typography>
              <Button
                variant='outlined'
                size='small'
                startIcon={<AddCircle />}
                onClick={handleAddBlankDropdownOption}
                sx={{ textTransform: 'none', fontSize: '0.75rem' }}
              >
                Add Option
              </Button>
            </Stack>
          </Box>

          {form.dropdownOptions && form.dropdownOptions.length > 0 && (
            <Box>
              {form.dropdownOptions.map((opt, idx) => (
                <Stack
                  key={`${opt}-${idx}`}
                  direction='row'
                  alignItems='center'
                  spacing={1}
                  sx={{
                    px: 2,
                    py: 0.75,
                    borderBottom: idx < form.dropdownOptions!.length - 1 ? '1px solid' : 'none',
                    borderColor: alpha(accent, 0.3),
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      variant='outlined'
                      size='small'
                      fullWidth
                      sx={{ '& .MuiOutlinedInput-root': { mt: 0, mb: 0 } }}
                      placeholder='Option name'
                      value={opt}
                      onChange={(e) => {
                        const { value } = e.target;
                        updateForm((f) => {
                          const next = [...(f.dropdownOptions ?? [])];
                          next[idx] = value;
                          return { ...f, dropdownOptions: next };
                        });
                      }}
                    />
                  </Box>
                  <Tooltip title='Remove option'>
                    <IconButton size='small' onClick={() => handleRemoveDropdownOption(idx)}>
                      <DeleteIcon fontSize='small' />
                    </IconButton>
                  </Tooltip>
                </Stack>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* ── Checkbox Options (shown when Type = Checkbox) ── */}
      {isCheckbox && (
        <Box
          sx={{
            border: '1px solid',
            borderColor: alpha(accent, 0.3),
            borderRadius: 2,
            overflow: 'visible',
          }}
        >
          <Box sx={{ px: 2, py: 1.5, bgcolor: alpha(accent, 0.04) }}>
            <Stack direction='row' alignItems='center' justifyContent='space-between'>
              <Typography
                variant='body2'
                color={accent}
                sx={{ fontWeight: 600, fontSize: '0.85rem' }}
              >
                Checkbox Options
              </Typography>
              <Button
                variant='outlined'
                size='small'
                startIcon={<AddCircle />}
                onClick={handleAddCheckboxOption}
                sx={{ textTransform: 'none', fontSize: '0.75rem' }}
              >
                Add Option
              </Button>
            </Stack>
          </Box>

          {checkboxOptions.map((entry) => {
            const typeLabel = FIELD_TYPES.find((ft) => ft.value === entry.fieldType)?.label ?? '';
            return (
              <Stack
                key={entry.id}
                data-type-dropdown
                direction='row'
                alignItems='center'
                spacing={1}
                sx={{
                  px: 2,
                  py: 0.75,
                  borderBottom: '1px solid',
                  borderColor: alpha(accent, 0.3),
                  '&:last-child': { borderBottom: 'none' },
                }}
              >
                {/* Field Name */}
                <Box sx={{ flex: 1 }}>
                  <TextField
                    variant='outlined'
                    size='small'
                    fullWidth
                    sx={{ '& .MuiOutlinedInput-root': { mt: 0, mb: 0 } }}
                    placeholder='Field Name'
                    value={entry.fieldName}
                    onChange={(e) =>
                      handleCheckboxOptionChange(entry.id, { fieldName: e.target.value })
                    }
                  />
                </Box>

                {/* Type */}
                <Box sx={{ flex: 1, position: 'relative' }}>
                  <TextField
                    variant='outlined'
                    size='small'
                    fullWidth
                    sx={{ '& .MuiOutlinedInput-root': { mt: 0, mb: 0 } }}
                    placeholder='Select type...'
                    value={typeLabel}
                    onFocus={() => setOpenTypeEntryId(entry.id)}
                    slotProps={{
                      input: {
                        readOnly: true,
                        endAdornment: (
                          <InputAdornment position='end'>
                            {typeLabel ? (
                              <ClearIcon
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleCheckboxOptionChange(entry.id, { fieldType: '' });
                                  setOpenTypeEntryId(null);
                                }}
                                sx={{ fontSize: 18, color: 'text.primary', cursor: 'pointer' }}
                              />
                            ) : (
                              <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                            )}
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                  {openTypeEntryId === entry.id && (
                    <Paper
                      elevation={4}
                      sx={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 1000,
                        mt: 0,
                        maxHeight: 200,
                        overflow: 'auto',
                      }}
                    >
                      <List dense disablePadding>
                        {FIELD_TYPES.map((ft) => (
                          <ListItem key={ft.value} disablePadding>
                            <ListItemButton
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleCheckboxOptionChange(entry.id, { fieldType: ft.value });
                                setOpenTypeEntryId(null);
                              }}
                              sx={{
                                py: 1,
                                px: 1.5,
                                '&:hover': { bgcolor: alpha(accent, 0.08) },
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

                {/* Path — opens picker dialog on click */}
                <Box sx={{ flex: 1, position: 'relative' }}>
                  <TextField
                    variant='outlined'
                    size='small'
                    fullWidth
                    sx={{ '& .MuiOutlinedInput-root': { mt: 0, mb: 0 } }}
                    placeholder='Path (optional)'
                    value={entry.path}
                    slotProps={{
                      input: {
                        readOnly: true,
                        endAdornment: (
                          <InputAdornment position='end'>
                            {entry.path ? (
                              <ClearIcon
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCheckboxOptionChange(entry.id, { path: '' });
                                }}
                                sx={{ fontSize: 18, color: 'text.primary', cursor: 'pointer' }}
                              />
                            ) : (
                              <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                            )}
                          </InputAdornment>
                        ),
                      },
                      htmlInput: {
                        onClick: () => {
                          setEditingOptionPathId(entry.id);
                          setConfigPickerOpen(true);
                        },
                      },
                    }}
                  />
                </Box>

                {/* Delete */}
                <Box sx={{ flex: '0 0 32px', display: 'flex', justifyContent: 'center' }}>
                  <Tooltip title='Remove option'>
                    <IconButton
                      size='small'
                      onClick={() => handleRemoveCheckboxOption(entry.id)}
                      sx={{ padding: '6px' }}
                    >
                      <DeleteIcon sx={{ fontSize: '1.25rem' }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Stack>
            );
          })}
        </Box>
      )}

      {!isDropdown && (
        <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
          <Box sx={{ flex: 1 }}>
            <TextField
              label='Default Value (optional)'
              size='small'
              value={form.defaultValue ?? ''}
              onChange={(e) => updateForm((f) => ({ ...f, defaultValue: e.target.value }))}
              placeholder='Default value for new tickets'
              fullWidth
            />
          </Box>
          <Box sx={{ flex: 1, position: 'relative' }}>
            <TextField
              label='Path (optional)'
              placeholder='e.g. Configuration > Priorities > Incident'
              value={pathInput}
              onChange={(e) => handlePathInputChange(e.target.value)}
              fullWidth
              size='small'
              slotProps={{
                input: {
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position='end'>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {pathInput ? (
                          <ClearIcon
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePathClear();
                            }}
                            sx={{ fontSize: 18, color: 'text.primary', cursor: 'pointer' }}
                          />
                        ) : (
                          <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                        )}
                      </Box>
                    </InputAdornment>
                  ),
                },
                htmlInput: {
                  onClick: () => setConfigPickerOpen(true),
                },
              }}
            />
          </Box>
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          borderRadius: 1.5,
          border: '1px solid',
          borderColor: alpha(accent, 0.3),
          bgcolor: form.isRequired ? alpha(accent, 0.04) : 'transparent',
          transition: 'all 0.2s ease',
        }}
      >
        <Box>
          <Typography variant='body2' color={accent} fontWeight={600}>
            Required
          </Typography>
          <Typography variant='caption' sx={{ color: accent }}>
            {form.isRequired ? 'This field is required' : 'This field is optional'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Switch
            checked={!!form.isRequired}
            onChange={(e) => updateForm((f) => ({ ...f, isRequired: e.target.checked }))}
            color='success'
          />
          <Typography
            variant='body2'
            fontWeight={700}
            sx={{ color: form.isRequired ? 'success.main' : 'text.secondary' }}
          >
            {form.isRequired ? 'Active' : 'Inactive'}
          </Typography>
        </Box>
      </Box>

      {/* ── Field Use ── */}
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
          <Typography variant='body2' color={accent} sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
            Access Control <span style={{ color: '#d32f2f' }}>*</span>
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant='caption' color={accent}>
              {getCheckedCount()} of {getTotalCount()} selected
            </Typography>
            <Checkbox
              size='small'
              checked={getCheckedCount() > 0}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => handleSelectAllFieldUse(getCheckedCount() !== getTotalCount())}
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
                handleSelectAllFieldUse(getCheckedCount() !== getTotalCount());
              }}
            >
              {getCheckedCount() === getTotalCount() ? 'Unselect All' : 'Select All'}
            </Typography>
          </Box>
        </Box>

        <Collapse in={fieldUseExpanded}>
          <Box sx={{ px: 2, pb: 2 }}>
            {ticketTypes.map((tt) => {
              const checked = !!form.fieldUse?.[tt.type];
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
                        fieldUse: { ...(f.fieldUse ?? {}), [tt.type]: e.target.checked },
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

        {fieldUseError && (
          <Typography
            variant='caption'
            sx={{ color: '#d32f2f', fontSize: '0.7rem', px: 2, pb: 1, display: 'block' }}
          >
            {fieldUseError}
          </Typography>
        )}
      </Box>

      {/* ── Config Path Picker (opened by Path field's Browse button or
           by clicking the Field Name / Path inputs in checkbox options) ─── */}
      <ConfigPathPicker
        open={configPickerOpen}
        onClose={() => {
          setConfigPickerOpen(false);
          setEditingOptionPathId(null);
        }}
        onSelect={(label, value) => {
          if (editingOptionPathId) {
            handleCheckboxOptionChange(editingOptionPathId, { path: value });
            setEditingOptionPathId(null);
          } else {
            setPathInput(value);
            updateForm((f) => ({ ...f, path: value }));
          }
        }}
      />
    </ConfigFormDialog>
  );
};

export default CustomFieldFormDialog;
