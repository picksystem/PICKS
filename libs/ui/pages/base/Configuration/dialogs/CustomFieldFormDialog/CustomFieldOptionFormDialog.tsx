import { useState, useEffect, useRef } from 'react';
import { Button, Box, Typography, TextField, IconButton, Switch } from '@serviceops/component';
import { AddCircle, Clear as ClearIcon, Search as SearchIcon } from '@mui/icons-material';
import { useFieldError, useNotification } from '@serviceops/hooks';
import { ConfigFormDialog } from '@serviceops/configdialogs';
import ConfigPathPicker from '../CustomFieldDialog/ConfigPathPicker';
import { alpha, InputAdornment } from '@mui/material';
import { CustomFieldType } from '@serviceops/interfaces';

export interface OptionEntry {
  id: string;
  fieldName: string;
  fieldType: CustomFieldType;
  path: string;
  isRequired: boolean;
  isDisabled: boolean;
}

interface CustomFieldOptionFormDialogProps {
  open: boolean;
  editing: OptionEntry | null;
  onClose: () => void;
  onSave: (entry: OptionEntry) => void;
  accent?: string;
}

const DEFAULT_ACCENT = '#0369a1';

const FIELD_TYPES: { value: CustomFieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'attachment', label: 'Attachment' },
];

const CustomFieldOptionFormDialog = ({
  open,
  editing,
  onClose,
  onSave,
  accent = DEFAULT_ACCENT,
}: CustomFieldOptionFormDialogProps) => {
  const { success } = useNotification();
  const reqError = useFieldError();

  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState<CustomFieldType>('text');
  const [typeSelected, setTypeSelected] = useState(false);
  const [pathInput, setPathInput] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [touched, setTouched] = useState({ fieldName: false, type: false });
  const [errors, setErrors] = useState({ fieldName: '', type: '' });
  const [pathPickerOpen, setPathPickerOpen] = useState(false);
  const [typeInput, setTypeInput] = useState('');
  const [typeOptionsOpen, setTypeOptionsOpen] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setTouched({ fieldName: false, type: false });
    setErrors({ fieldName: '', type: '' });
    setTypeSelected(false);
    setPathPickerOpen(false);
    setTypeOptionsOpen(false);

    if (editing) {
      setFieldName(editing.fieldName);
      setFieldType(editing.fieldType);
      setPathInput(editing.path);
      setIsRequired(editing.isRequired);
      setIsDisabled(editing.isDisabled);
      setTypeInput(FIELD_TYPES.find((ft) => ft.value === editing.fieldType)?.label ?? '');
      setTypeSelected(true);
    } else {
      setFieldName('');
      setFieldType('text');
      setPathInput('');
      setIsRequired(false);
      setIsDisabled(false);
      setTypeInput('');
      setTypeSelected(false);
    }
  }, [open, editing]);

  useEffect(() => {
    if (open && !editing) {
      setTimeout(() => nameRef.current?.focus(), 150);
    }
  }, [open, editing]);

  const validate = () => {
    const errs: typeof errors = { fieldName: '', type: '' };
    if (!fieldName.trim()) errs.fieldName = 'Field name is required';
    if (!typeSelected) errs.type = 'Type is required';
    setErrors(errs);
    setTouched({ fieldName: true, type: true });
    return Object.values(errs).every((v) => !v);
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const result: OptionEntry = {
      id: editing?.id || `opt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      fieldName: fieldName.trim(),
      fieldType,
      path: pathInput.trim(),
      isRequired,
      isDisabled,
    };

    onSave(result);
    success(editing ? 'Option updated successfully' : 'Option added successfully');
    handleClose();
  };

  const handleClose = () => {
    setFieldName('');
    setFieldType('text');
    setPathInput('');
    setIsRequired(false);
    setIsDisabled(false);
    setTouched({ fieldName: false, type: false });
    setErrors({ fieldName: '', type: '' });
    setTypeSelected(false);
    setTypeInput('');
    onClose();
  };

  const handleTypeSelect = (_label: string, value: CustomFieldType) => {
    setFieldType(value);
    setTypeInput(FIELD_TYPES.find((ft) => ft.value === value)?.label ?? '');
    setTypeOptionsOpen(false);
    setTypeSelected(true);
  };

  const handlePathSelect = (_label: string, value: string) => {
    setPathInput(value);
    setPathPickerOpen(false);
  };

  const searchTypes = (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return FIELD_TYPES;
    return FIELD_TYPES.filter((t) => t.label.toLowerCase().includes(q));
  };

  return (
    <>
      <ConfigFormDialog
        open={open}
        onClose={handleClose}
        onSubmit={handleSubmit}
        isEdit={!!editing}
        icon={<AddCircle sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={accent}
        title={editing ? 'Option' : 'Option'}
        subtitle={editing ? 'Update the option details below' : 'Fill in the option details below'}
        submitDisabled={false}
        submitLabel={editing ? 'Save' : 'Add'}
        maxWidth='sm'
      >
        {/* Field Name */}
        <Box sx={{ mt: 1 }}>
          <TextField
            label='Field Name'
            placeholder='Enter option name'
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, fieldName: true }))}
            fullWidth
            size='small'
            required
            error={touched.fieldName && Boolean(errors.fieldName)}
            helperText={reqError(touched.fieldName, errors.fieldName)}
            inputRef={nameRef}
            slotProps={{
              input: {
                endAdornment: fieldName ? (
                  <InputAdornment position='end'>
                    <IconButton
                      size='small'
                      onClick={() => {
                        setFieldName('');
                        setTouched((t) => ({ ...t, fieldName: true }));
                      }}
                      sx={{ padding: 0 }}
                    >
                      <ClearIcon sx={{ fontSize: 18, color: 'text.primary' }} />
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
              },
            }}
          />
        </Box>

        {/* Type — after Field Name */}
        <Box sx={{ mt: 2, position: 'relative' }}>
          <TextField
            label='Type'
            placeholder='Select type'
            value={typeInput}
            onChange={(e) => setTypeInput(e.target.value)}
            onFocus={() => {
              setTouched((t) => ({ ...t, type: true }));
              const filtered = searchTypes(typeInput);
              setTypeOptionsOpen(filtered.length > 0);
            }}
            onBlur={() => {
              setTimeout(() => setTypeOptionsOpen(false), 150);
            }}
            fullWidth
            size='small'
            required
            error={touched.type && Boolean(errors.type)}
            helperText={reqError(touched.type, errors.type)}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position='end'>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {typeInput ? (
                        <IconButton
                          size='small'
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.stopPropagation();
                            setTypeInput('');
                            setFieldType('text');
                            setTypeSelected(false);
                          }}
                          sx={{ padding: 0 }}
                        >
                          <ClearIcon sx={{ fontSize: 18, color: 'text.primary' }} />
                        </IconButton>
                      ) : (
                        <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      )}
                    </Box>
                  </InputAdornment>
                ),
              },
            }}
          />
          {typeOptionsOpen && (
            <Box
              sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 10,
                mt: 0.5,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                boxShadow: 3,
                maxHeight: 200,
                overflow: 'auto',
              }}
            >
              {searchTypes(typeInput).map((ft) => (
                <Box
                  key={ft.value}
                  onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
                  onClick={() => handleTypeSelect(ft.label, ft.value)}
                  sx={{
                    px: 2,
                    py: 1,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: alpha(accent, 0.08) },
                    ...(fieldType === ft.value && {
                      bgcolor: alpha(accent, 0.12),
                      '&:hover': { bgcolor: alpha(accent, 0.16) },
                    }),
                  }}
                >
                  <Typography variant='body2'>{ft.label}</Typography>
                </Box>
              ))}
              {searchTypes(typeInput).length === 0 && (
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                    No types found
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* Path (optional) */}
        <Box sx={{ mt: 2, position: 'relative' }}>
          <TextField
            label='Path (optional)'
            placeholder='e.g. Configuration > Priorities > Incident'
            value={pathInput}
            onChange={(e) => setPathInput(e.target.value)}
            fullWidth
            size='small'
            slotProps={{
              input: {
                readOnly: true,
                endAdornment: (
                  <InputAdornment position='end'>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {pathInput ? (
                        <IconButton
                          size='small'
                          onClick={(e) => {
                            e.stopPropagation();
                            setPathInput('');
                          }}
                          sx={{ padding: 0 }}
                        >
                          <ClearIcon sx={{ fontSize: 18, color: 'text.primary' }} />
                        </IconButton>
                      ) : (
                        <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      )}
                    </Box>
                  </InputAdornment>
                ),
              },
              htmlInput: {
                onClick: () => setPathPickerOpen(true),
              },
            }}
          />
        </Box>

        {/* Required toggle */}
        <Box
          sx={{
            mt: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1.5,
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: alpha(accent, 0.3),
            bgcolor: isRequired ? alpha(accent, 0.04) : 'transparent',
            transition: 'all 0.2s ease',
          }}
        >
          <Box>
            <Typography variant='body2' color={accent} fontWeight={600}>
              Required
            </Typography>
            <Typography variant='caption' sx={{ color: accent }}>
              {isRequired ? 'This option is required' : 'This option is optional'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Switch
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
              color='success'
            />
            <Typography
              variant='body2'
              fontWeight={700}
              sx={{ color: isRequired ? 'success.main' : 'text.secondary' }}
            >
              {isRequired ? 'Active' : 'Inactive'}
            </Typography>
          </Box>
        </Box>

        {/* Disabled toggle */}
        <Box
          sx={{
            mt: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1.5,
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: alpha(accent, 0.3),
            bgcolor: isDisabled ? alpha(accent, 0.04) : 'transparent',
            transition: 'all 0.2s ease',
          }}
        >
          <Box>
            <Typography variant='body2' color={accent} fontWeight={600}>
              Disabled
            </Typography>
            <Typography variant='caption' sx={{ color: accent }}>
              {isDisabled ? 'This option is disabled' : 'This option is enabled'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Switch
              checked={isDisabled}
              onChange={(e) => setIsDisabled(e.target.checked)}
              color='default'
            />
            <Typography
              variant='body2'
              fontWeight={700}
              sx={{ color: isDisabled ? 'text.secondary' : 'success.main' }}
            >
              {isDisabled ? 'Active' : 'Inactive'}
            </Typography>
          </Box>
        </Box>
      </ConfigFormDialog>

      {/* Config Path Picker */}
      <ConfigPathPicker
        open={pathPickerOpen}
        onClose={() => setPathPickerOpen(false)}
        onSelect={handlePathSelect}
      />
    </>
  );
};

export default CustomFieldOptionFormDialog;
