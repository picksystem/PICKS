import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Box,
  Typography,
  TextField,
  Checkbox,
  DatePicker,
  Button,
  CloudUploadIcon,
} from '@serviceops/component';
import {
  alpha,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import FilePresent from '@mui/icons-material/FilePresent';
import { CustomFieldType } from '@serviceops/interfaces';
import {
  parseRichText,
  RichTextEditor,
  serializeRichText,
} from '@serviceops/pages/base/Configuration/shared/RichTextEditor';

export interface DynamicFieldProps {
  fieldKey: string;
  fieldLabel: string;
  fieldType: CustomFieldType;
  value: string | boolean;
  onChange: (value: string | boolean) => void;
  error?: boolean;
  errorText?: string | React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  dropdownOptions?: { value: string; label: string }[];
  fullWidth?: boolean;
  rows?: number;
  helperText?: string;
  attachedFiles?: File[];
  onFilesChange?: (files: File[]) => void;
}

/**
 * Renders a single form field based on its type.
 * Styling and interaction patterns mirror the ApprovedEstimateFormDialog
 * for visual consistency across all configuration and ticket forms.
 *
 * Supported types:
 *  - dropdown   → searchable dropdown (MUI Paper + List with debounce, portal-rendered)
 *  - textarea   → multi-line TextField
 *  - number     → numeric TextField
 *  - date       → project DatePicker component (MUI type='date' input)
 *  - checkbox   → project Checkbox component (single) or editable text fields grid (with options)
 *  - text       → standard TextField (default)
 *  - attachment → drag-and-drop file upload zone
 */
export const DynamicFieldRenderer = ({
  fieldKey: _fieldKey,
  fieldLabel,
  fieldType,
  value,
  onChange,
  error,
  errorText,
  dropdownOptions,
  fullWidth,
  rows: _rows = 3,
  helperText,
  disabled,
  required,
  attachedFiles,
  onFilesChange,
}: DynamicFieldProps) => {
  const theme = useTheme();
  // ── Dropdown state (mirrors ApprovedEstimateFormDialog pattern) ──────
  const [ddInput, setDdInput] = useState('');
  const [ddOpen, setDdOpen] = useState(false);
  const [ddFiltered, setDdFiltered] = useState<{ value: string; label: string }[]>([]);
  const [menuRect, setMenuRect] = useState<{ top: number; left: number; width: number } | null>(
    null,
  );
  const ddDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  // File input ref for attachment field (always declared at top level for Rules of Hooks)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Sync input when parent value changes
  useEffect(() => {
    const stored = String(value ?? '');
    if (stored !== ddInput) setDdInput(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Update menu position on scroll/resize
  useEffect(() => {
    if (!ddOpen) return;
    const updatePosition = () => {
      if (!anchorRef.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      setMenuRect({ top: rect.bottom, left: rect.left, width: rect.width });
    };
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [ddOpen]);

  const handleDdSelect = useCallback(
    (opt: { value: string; label: string }) => {
      if (ddDebounceRef.current) clearTimeout(ddDebounceRef.current);
      setDdInput(opt.label ?? opt.value);
      onChange(opt.value);
      setDdOpen(false);
      setDdFiltered([]);
      setMenuRect(null);
    },
    [onChange],
  );

  const handleDdClear = useCallback(() => {
    if (ddDebounceRef.current) clearTimeout(ddDebounceRef.current);
    setDdInput('');
    onChange('');
    setDdOpen(false);
    setDdFiltered([]);
    setMenuRect(null);
  }, [onChange]);

  const handleDdChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setDdInput(val);
      if (ddDebounceRef.current) clearTimeout(ddDebounceRef.current);
      ddDebounceRef.current = setTimeout(() => {
        const q = val.trim().toLowerCase();
        const next = q
          ? (dropdownOptions ?? []).filter((o) => o.label.toLowerCase().includes(q))
          : (dropdownOptions ?? []);
        setDdFiltered(next);
        if (next.length > 0 && anchorRef.current) {
          const rect = anchorRef.current.getBoundingClientRect();
          setMenuRect({ top: rect.bottom, left: rect.left, width: rect.width });
          setDdOpen(true);
        } else {
          setDdOpen(false);
        }
      }, 200);
    },
    [dropdownOptions],
  );

  const handleDdFocus = useCallback(() => {
    if (ddOpen) return;
    const q = ddInput.trim().toLowerCase();
    const next = q
      ? (dropdownOptions ?? []).filter((o) => o.label.toLowerCase().includes(q))
      : (dropdownOptions ?? []);
    setDdFiltered(next);
    if (next.length > 0 && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setMenuRect({ top: rect.bottom, left: rect.left, width: rect.width });
      setDdOpen(true);
    }
  }, [ddInput, dropdownOptions, ddOpen]);

  const handleDdBlur = useCallback(() => {
    if (ddDebounceRef.current) clearTimeout(ddDebounceRef.current);
    setTimeout(() => {
      setDdOpen(false);
      setDdFiltered([]);
      setMenuRect(null);
    }, 200);
  }, []);

  const handleItemMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    if (!ddOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDdOpen(false);
        setDdFiltered([]);
        setMenuRect(null);
        anchorRef.current?.querySelector('input')?.blur();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [ddOpen]);

  const hasDropdownItems = ddFiltered.length > 0;

  // ── Render per field type ────────────────────────────────────────────
  switch (fieldType) {
    // ── Searchable dropdown ──────────────────────────────────────────
    case 'dropdown': {
      const portalContent =
        ddOpen && hasDropdownItems && menuRect ? (
          <Paper
            ref={optionsRef}
            elevation={4}
            sx={{
              position: 'fixed',
              top: menuRect.top,
              left: menuRect.left,
              width: menuRect.width,
              zIndex: 1400,
              maxHeight: 280,
              overflow: 'auto',
            }}
          >
            <List dense disablePadding>
              {ddFiltered.map((opt) => (
                <ListItem key={opt.value} disablePadding>
                  <ListItemButton
                    onClick={() => handleDdSelect(opt)}
                    onMouseDown={handleItemMouseDown}
                    sx={{
                      py: 1,
                      px: 1.5,
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <ListItemText
                      primary={opt.label}
                      slotProps={{ primary: { sx: { fontSize: '0.84rem' } } }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        ) : null;

      return (
        <Box sx={{ position: 'relative' }} ref={anchorRef}>
          <TextField
            label={fieldLabel}
            placeholder={`Search or select ${fieldLabel.toLowerCase()}...`}
            value={ddInput}
            onChange={handleDdChange}
            onFocus={handleDdFocus}
            onBlur={handleDdBlur}
            fullWidth
            disabled={disabled}
            required={required}
            error={error}
            helperText={error ? (errorText as string) : helperText}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position='end'>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {ddInput ? (
                        <ClearIcon
                          onClick={handleDdClear}
                          sx={{
                            fontSize: 18,
                            color: 'text.primary',
                            cursor: 'pointer',
                          }}
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
          {portalContent ? createPortal(portalContent, document.body) : null}
        </Box>
      );
    }

    // ── Textarea ─────────────────────────────────────────────────────
    case 'textarea':
      return (
        <Box sx={{ gridColumn: fullWidth ? undefined : '1 / -1' }}>
          <RichTextEditor
            value={parseRichText(String(value ?? ''))}
            onChange={(richVal) => onChange(serializeRichText(richVal.segments))}
            title={fieldLabel}
            error={error}
            showFooterActions={false}
          />
          {error && errorText ? <Box sx={{ mt: 0.5, ml: 1.5 }}>{errorText}</Box> : null}
        </Box>
      );

    // ── Number ────────────────────────────────────────────────────────
    case 'number':
      return (
        <TextField
          label={fieldLabel}
          value={value !== null && value !== undefined ? String(value) : ''}
          onChange={(e) => {
            const v = e.target.value;
            if (v === '') onChange('');
            else {
              const num = Number(v);
              onChange(Number.isNaN(num) ? '' : String(num));
            }
          }}
          type='number'
          fullWidth
          disabled={disabled}
          required={required}
          error={error}
          errorText={errorText as string | undefined}
        />
      );

    // ── Date ──────────────────────────────────────────────────────────
    case 'date':
      return (
        <DatePicker
          label={fieldLabel}
          value={String(value ?? '')}
          onChange={(val: string) => onChange(val)}
          fullWidth={fullWidth}
          disabled={disabled}
          error={error}
          helperText={error ? (errorText as string) : helperText}
        />
      );

    // ── Checkbox ──────────────────────────────────────────────────────
    case 'checkbox': {
      const options = dropdownOptions ?? [];

      // With options: show "Can't find in the list? Update manually" toggle
      if (options.length > 0) {
        return (
          <CheckboxWithManualUpdate
            fieldLabel={fieldLabel}
            options={options}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            error={error}
            errorText={errorText}
            fullWidth={fullWidth}
          />
        );
      }

      // Single checkbox (no options)
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            pt: 0.5,
            opacity: disabled ? 0.5 : 1,
            pointerEvents: disabled ? 'none' : 'auto',
          }}
        >
          <Checkbox
            label={fieldLabel}
            checked={!!value}
            onChange={(_, checked) => onChange(checked)}
            disabled={disabled}
          />
          {error && errorText ? (
            <Typography variant='caption' color='error' sx={{ ml: 1, mt: 0.25 }}>
              {errorText as string}
            </Typography>
          ) : null}
        </Box>
      );
    }

    // ── Attachment (drag-and-drop + file picker) ──────────────────────────
    case 'attachment': {
      const files = attachedFiles ?? [];

      const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
      };

      const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) setIsDragOver(true);
      };

      const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
      };

      const handleDrop = (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        if (disabled) return;

        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length > 0 && onFilesChange) {
          const combined = [...files, ...droppedFiles];
          onFilesChange(combined);
        }
        onChange?.('');
      };

      const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length > 0 && onFilesChange) {
          const combined = [...files, ...selectedFiles];
          onFilesChange(combined);
        }
        e.target.value = '';
        onChange?.('');
      };

      const handleBrowseClick = () => {
        if (!disabled) fileInputRef.current?.click();
      };

      const handleRemoveFile = (index: number) => {
        if (onFilesChange) {
          const next = files.filter((_, i) => i !== index);
          onFilesChange(next);
        }
      };

      return (
        <Box sx={{ gridColumn: fullWidth ? undefined : '1 / -1' }}>
          <Box
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
            sx={{
              position: 'relative',
              border: '2px dashed',
              borderColor: isDragOver ? 'primary.main' : 'divider',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              cursor: disabled ? 'not-allowed' : 'pointer',
              bgcolor: isDragOver ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
              transition: 'all 0.2s ease',
              '&:hover': !disabled
                ? {
                    borderColor: 'primary.main',
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                  }
                : {},
              opacity: disabled ? 0.5 : 1,
            }}
          >
            <input
              ref={fileInputRef}
              type='file'
              multiple
              accept='*/*'
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
              disabled={disabled}
            />
            <CloudUploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              Drop files here or click to browse
            </Typography>
            <Typography
              variant='caption'
              sx={{ color: 'text.disabled', mt: 0.5, display: 'block' }}
            >
              Supports all file types
            </Typography>
          </Box>

          {/* Attached files list */}
          {files.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography
                variant='caption'
                sx={{
                  fontWeight: 600,
                  color: 'text.secondary',
                  display: 'block',
                  mb: 1,
                }}
              >
                Attached Files ({files.length})
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.75,
                }}
              >
                {files.map((file, index) => (
                  <Box
                    key={`${file.name}-${index}`}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      px: 1.5,
                      py: 1,
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                    }}
                  >
                    <FilePresent sx={{ fontSize: 20, color: 'primary.main', flexShrink: 0 }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant='body2'
                        sx={{
                          fontWeight: 500,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {file.name}
                      </Typography>
                      <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                        {formatFileSize(file.size)}
                      </Typography>
                    </Box>
                    <Box
                      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                        e.stopPropagation();
                        handleRemoveFile(index);
                      }}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 28,
                        height: 28,
                        borderRadius: 1,
                        cursor: 'pointer',
                        color: 'text.secondary',
                        flexShrink: 0,
                        '&:hover': {
                          bgcolor: alpha(theme.palette.error.main, 0.08),
                          color: 'error.main',
                        },
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: 18 }} />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {error && errorText ? (
            <Typography variant='caption' color='error' sx={{ mt: 1, display: 'block', ml: 0.5 }}>
              {errorText as string}
            </Typography>
          ) : null}
        </Box>
      );
    }

    // ── Text (default) ────────────────────────────────────────────────
    default:
      return (
        <TextField
          label={fieldLabel}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          fullWidth
          disabled={disabled}
          required={required}
          error={error}
          errorText={errorText as string | undefined}
          helperText={helperText}
        />
      );
  }
};

// ── Sub-component: Checkbox field with "Update manually" toggle ───────────
// Extracted to its own component so that useState/useCallback hooks are not
// conditionally called inside a switch-case (which would violate Rules of Hooks).

interface CheckboxWithManualUpdateProps {
  fieldLabel: string;
  options: { value: string; label: string }[];
  value: string | boolean;
  onChange: (val: string | boolean) => void;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  errorText?: string | React.ReactNode;
  fullWidth?: boolean;
}

const CheckboxWithManualUpdate = ({
  fieldLabel: _fieldLabel,
  options,
  value,
  onChange,
  disabled,
  required,
  error,
  errorText,
  fullWidth,
}: CheckboxWithManualUpdateProps) => {
  const [manualMode, setManualMode] = useState(false);
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  const theme = useTheme();

  // Sync draft when entering manual mode from current value
  const handleToggleMode = () => {
    if (!manualMode) {
      const current = String(value ?? '');
      const map: Record<string, string> = {};
      options.forEach((opt) => {
        if (
          current
            .split(',')
            .map((v) => v.trim())
            .includes(opt.value)
        ) {
          map[opt.value] = opt.value;
        } else {
          map[opt.value] = '';
        }
      });
      setDraftValues(map);
    }
    setManualMode((prev) => !prev);
  };

  const handleFieldChange = (optValue: string, fieldValue: string) => {
    setDraftValues((prev) => ({ ...prev, [optValue]: fieldValue }));
  };

  const handleUpdate = () => {
    const selected = Object.entries(draftValues)
      .filter(([, v]) => v.trim())
      .map(([, v]) => v.trim())
      .join(',');
    onChange(selected || '');
    setManualMode(false);
  };

  const handleCancel = () => {
    setManualMode(false);
    setDraftValues({});
  };

  return (
    <Box sx={{ gridColumn: fullWidth ? undefined : '1 / -1' }}>
      {/* "Can't find in the list? Update manually" toggle */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: manualMode ? 1.5 : 0,
          opacity: disabled ? 0.5 : 1,
          pointerEvents: disabled ? 'none' : 'auto',
        }}
      >
        <Checkbox
          label={`Can't find in the list? Update manually`}
          checked={manualMode}
          onChange={(_, checked) => {
            if (checked) handleToggleMode();
            else handleCancel();
          }}
          disabled={disabled}
        />
      </Box>

      {/* Manual update form with Cancel/Update buttons inside the bordered box */}
      {manualMode && (
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            bgcolor: 'background.paper',
            opacity: disabled ? 0.5 : 1,
            pointerEvents: disabled ? 'none' : 'auto',
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 1.5,
              p: 2,
            }}
          >
            {options.map((opt) => (
              <TextField
                key={opt.value}
                label={opt.label}
                value={draftValues[opt.value] ?? ''}
                onChange={(e) => handleFieldChange(opt.value, e.target.value)}
                disabled={disabled}
                required={required}
                variant='outlined'
              />
            ))}
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 1,
              pr: 2,
              pb: 2,
            }}
          >
            <Button
              variant='outlined'
              size='small'
              onClick={handleCancel}
              disabled={disabled}
              sx={{
                borderColor: 'error.main',
                color: 'error.main',
                '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.08) },
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              CANCEL
            </Button>
            <Button
              variant='contained'
              size='small'
              onClick={handleUpdate}
              disabled={disabled}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              UPDATE
            </Button>
          </Box>
        </Box>
      )}

      {error && errorText ? (
        <Typography variant='caption' color='error' sx={{ mt: 1, display: 'block', ml: 0.5 }}>
          {errorText as string}
        </Typography>
      ) : null}
    </Box>
  );
};

export default DynamicFieldRenderer;
