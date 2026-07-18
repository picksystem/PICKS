import { Box, TextField, Paper } from '@serviceops/component';
import { alpha } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useState, useRef, useEffect, useCallback } from 'react';

export interface OptionsSearchFieldOption {
  value: string;
  label: string;
}

export interface OptionsSearchFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Pre-built option list (e.g. the unique values of another field on the
   * same table) — unlike the other *SearchField components, this one takes
   * its options directly instead of fetching from a shared hook, since the
   * source list is local to the table being edited. */
  options: OptionsSearchFieldOption[];
  placeholder?: string;
  required?: boolean;
  error?: boolean;
  helperText?: React.ReactNode;
}

export const OptionsSearchField = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
  error,
  helperText,
}: OptionsSearchFieldProps) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [filtered, setFiltered] = useState<OptionsSearchFieldOption[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const buildOptions = useCallback(
    (query: string) => {
      const q = query.trim().toLowerCase();
      if (!q) return options;
      return options.filter((o) => o.label.toLowerCase().includes(q));
    },
    [options],
  );

  const handleInputChange = useCallback(
    (newInputValue: string) => {
      setInputValue(newInputValue);
      onChange(newInputValue);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const next = buildOptions(newInputValue);
        setFiltered(next);
        setOpen(next.length > 0);
      }, 200);
    },
    [buildOptions, onChange],
  );

  const handleSelect = (option: OptionsSearchFieldOption) => {
    setInputValue(option.label);
    setOpen(false);
    setFiltered([]);
    onChange(option.value);
  };

  const handleClear = () => {
    setInputValue('');
    setFiltered([]);
    setOpen(false);
    onChange('');
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <TextField
        label={label}
        placeholder={placeholder ?? 'Search...'}
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onBlur={() => {
          setTimeout(() => setOpen(false), 200);
        }}
        onFocus={() => {
          const next = buildOptions(inputValue);
          setFiltered(next);
          if (next.length > 0) setOpen(true);
        }}
        required={required}
        error={error}
        helperText={helperText}
        fullWidth
        size='small'
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position='end'>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {inputValue ? (
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

      {open && filtered.length > 0 && (
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
            {filtered.map((option) => (
              <ListItem key={option.value} disablePadding>
                <ListItemButton
                  onClick={() => handleSelect(option)}
                  sx={{
                    py: 1,
                    px: 1.5,
                    '&:hover': { bgcolor: alpha('#0369a1', 0.08) },
                  }}
                >
                  <ListItemText
                    primary={option.label}
                    primaryTypographyProps={{ fontSize: '0.84rem', noWrap: true }}
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

export default OptionsSearchField;
