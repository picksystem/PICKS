import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Box, Typography, TextField, Checkbox, DatePicker } from '@serviceops/component';
import { InputAdornment, List, ListItem, ListItemButton, ListItemText, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { CustomFieldType } from '@serviceops/interfaces';

export interface DynamicFieldProps {
  fieldKey: string;
  fieldLabel: string;
  fieldType: CustomFieldType;
  value: string | boolean;
  onChange: (value: string | boolean) => void;
  error?: boolean;
  errorText?: string | React.ReactNode;
  required?: boolean;
  dropdownOptions?: { value: string; label: string }[];
  fullWidth?: boolean;
  rows?: number;
  helperText?: string;
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
 *  - checkbox   → project Checkbox component
 *  - text       → standard TextField (default)
 *
 * Note: 'attachment' type is handled directly in CreateTicketDetail
 * because UploadFile uses a FileList | null callback, not string | boolean.
 */
export const DynamicFieldRenderer = ({
  fieldLabel,
  fieldType,
  value,
  onChange,
  error,
  errorText,
  dropdownOptions,
  fullWidth,
  rows = 3,
  helperText,
}: DynamicFieldProps) => {
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
                      primaryTypographyProps={{
                        fontSize: '0.84rem',
                        noWrap: true,
                      }}
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
        <TextField
          label={fieldLabel}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          multiline
          rows={rows}
          fullWidth
          error={error}
          errorText={errorText as string | undefined}
          helperText={helperText}
        />
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
          error={error}
          helperText={error ? (errorText as string) : helperText}
        />
      );

    // ── Checkbox ──────────────────────────────────────────────────────
    case 'checkbox':
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', pt: 0.5 }}>
          <Checkbox
            label={fieldLabel}
            checked={!!value}
            onChange={(_, checked) => onChange(checked)}
          />
          {error && errorText ? (
            <Typography variant='caption' color='error' sx={{ ml: 1, mt: 0.25 }}>
              {errorText as string}
            </Typography>
          ) : null}
        </Box>
      );

    // ── Text (default) ────────────────────────────────────────────────
    default:
      return (
        <TextField
          label={fieldLabel}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          fullWidth
          error={error}
          errorText={errorText as string | undefined}
          helperText={helperText}
        />
      );
  }
};

export default DynamicFieldRenderer;
