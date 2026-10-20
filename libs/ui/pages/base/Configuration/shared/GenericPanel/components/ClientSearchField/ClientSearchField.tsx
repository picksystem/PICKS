import { Box, TextField, Paper } from '@serviceops/component';
import { alpha } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useSharedClients } from '../../../../hooks/useSharedClients';

export interface ClientSearchFieldProps {
  label?: string;
  /** The currently selected client's display name. */
  value: string;
  /** Called when a client is picked (or the field is cleared). */
  onChange: (clientName: string, clientId?: string) => void;
  required?: boolean;
  disabled?: boolean;
  /** The currently selected client's id, kept in sync with the paired id
   * field when used inside a GenericPanel form. */
  clientIdValue?: string;
  error?: boolean;
  helperText?: React.ReactNode;
  sx?: Record<string, unknown>;
}

/**
 * Searchable client field for the Projects form (Clients & Projects >
 * Projects accordion) and the Timesheet lines table. Options are sourced
 * from the Clients & Projects > Clients accordion via the shared
 * `useSharedClients` hook (cached configuration document) — the same UX as
 * the other *SearchField components: a debounced input + absolute MUI Paper
 * dropdown list.
 *
 * When used inside a GenericPanel form (via the `clientSearch` field type),
 * `clientIdValue` tells the picker which client is currently selected so it
 * can stay in sync; when used standalone (e.g. Timesheet.tsx) it can be
 * omitted.
 */
export const ClientSearchField = ({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  clientIdValue,
  error,
  helperText,
  sx,
}: ClientSearchFieldProps) => {
  const { options: allClientOptions, isLoading } = useSharedClients();
  const [inputValue, setInputValue] = useState(value || '');
  const [options, setOptions] = useState<{ clientId: string; clientName: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external value changes
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (options.length === 0) return;
      setOptions([]);
      setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [options.length]);

  const buildOptions = useCallback(
    (query: string) => {
      const q = query.trim().toLowerCase();
      const matches = q
        ? allClientOptions.filter(
            (c) =>
              c.clientName.toLowerCase().includes(q) ||
              (c.clientId ? c.clientId.toLowerCase().includes(q) : false),
          )
        : allClientOptions;

      // Keep the already-selected client visible even if it no longer
      // matches the current filter text, so the paired id field stays
      // consistent.
      const selected =
        clientIdValue !== undefined
          ? allClientOptions.find((c) => c.clientId === clientIdValue && c.clientId !== '')
          : undefined;

      const seen = new Set<string>();
      const opts: { clientId: string; clientName: string }[] = [];
      [...(selected ? [selected] : []), ...matches].forEach((c) => {
        if (c.clientName && !seen.has(c.clientName)) {
          seen.add(c.clientName);
          opts.push({ clientId: c.clientId, clientName: c.clientName });
        }
      });
      return opts.sort((a, b) => a.clientName.localeCompare(b.clientName));
    },
    [allClientOptions, clientIdValue],
  );

  const handleInputChange = useCallback(
    (newInputValue: string) => {
      setInputValue(newInputValue);
      setLoading(true);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const filtered = buildOptions(newInputValue);
        setOptions(filtered);
        setLoading(false);
        setOpen(filtered.length > 0);
      }, 200);
    },
    [buildOptions],
  );

  const handleSelect = useCallback(
    (option: { clientId: string; clientName: string }) => {
      setInputValue(option.clientName);
      setOptions([]);
      setOpen(false);
      onChange(option.clientName, option.clientId);
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    setInputValue('');
    setOptions([]);
    setOpen(false);
    onChange('', undefined);
  }, [onChange]);

  const handleFocus = useCallback(() => {
    const next = buildOptions(inputValue);
    setOptions(next);
    if (next.length > 0) setOpen(true);
  }, [buildOptions, inputValue]);

  const handleBlur = useCallback(() => {
    setTimeout(() => setOpen(false), 200);
  }, []);

  return (
    <Box sx={{ position: 'relative', ...sx }}>
      <TextField
        required={required}
        disabled={disabled}
        placeholder={disabled ? '' : 'Search clients...'}
        value={inputValue}
        onChange={(e) => {
          if (!disabled) handleInputChange(e.target.value);
        }}
        onFocus={() => !disabled && handleFocus()}
        onBlur={handleBlur}
        error={error}
        helperText={helperText}
        fullWidth
        size='small'
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position='end'>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {isLoading ? (
                    <CircularProgress size={16} />
                  ) : inputValue ? (
                    <ClearIcon
                      onClick={handleClear}
                      sx={{
                        fontSize: 18,
                        color: 'text.secondary',
                        cursor: 'pointer',
                        '&:hover': { color: 'text.primary' },
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

      {open && options.length > 0 && !disabled && (
        <Paper
          elevation={4}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            mt: 0.5,
            maxHeight: 280,
            overflow: 'auto',
          }}
        >
          <List dense disablePadding>
            {options.map((option) => (
              <ListItem key={option.clientName} disablePadding>
                <ListItemButton
                  onClick={() => handleSelect(option)}
                  sx={{
                    py: 1,
                    px: 1.5,
                    '&:hover': {
                      bgcolor: alpha('#0369a1', 0.08),
                    },
                  }}
                >
                  <ListItemText
                    primary={option.clientName}
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
      )}
    </Box>
  );
};

export default ClientSearchField;
