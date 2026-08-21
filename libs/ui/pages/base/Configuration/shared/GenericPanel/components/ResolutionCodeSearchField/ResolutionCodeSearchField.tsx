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
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useConfiguration } from '@serviceops/confighooks';

export interface ResolutionCodeSearchFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: boolean;
  helperText?: React.ReactNode;
}

const formatLabel = (raw: string): string =>
  raw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const ResolutionCodeSearchField = ({
  label,
  value,
  onChange,
  required,
  error,
  helperText,
}: ResolutionCodeSearchFieldProps) => {
  const [inputValue, setInputValue] = useState(value ? formatLabel(value) : '');
  const [options, setOptions] = useState<{ id: string; name: string; label: string }[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { reasonCodes, isLoading: configLoading } = useConfiguration();

  const allOptions = useMemo(() => {
    if (!reasonCodes?.resolutionCodes) return [];
    const seen = new Set<string>();
    const opts: { id: string; name: string; label: string }[] = [];
    reasonCodes.resolutionCodes.forEach((rc) => {
      const rawName = String(rc?.name ?? '').trim();
      if (!rawName) return;
      const key = rawName.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      opts.push({ id: rawName, name: rawName, label: formatLabel(rawName) });
    });
    return opts.sort((a, b) => a.label.localeCompare(b.label));
  }, [reasonCodes?.resolutionCodes]);

  const isLoading = configLoading || !reasonCodes;

  useEffect(() => {
    setInputValue(value ? formatLabel(value) : '');
  }, [value]);

  const buildOptions = useCallback(
    (query: string) => {
      if (!query) return allOptions;
      const q = query.toLowerCase();
      return allOptions.filter(
        (a) => a.label.toLowerCase().includes(q) || a.name.toLowerCase().includes(q),
      );
    },
    [allOptions],
  );

  const handleInputChange = useCallback(
    (newInputValue: string) => {
      setInputValue(newInputValue);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        const filtered = buildOptions(newInputValue);
        setOptions(filtered);
        setOpen(filtered.length > 0);
      }, 200);
    },
    [buildOptions],
  );

  const handleSelect = (option: { id: string; name: string }) => {
    setInputValue(formatLabel(option.name));
    setOpen(false);
    setOptions([]);
    onChange(option.name);
  };

  const handleClear = () => {
    setInputValue('');
    setOptions([]);
    setOpen(false);
    onChange('');
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <TextField
        label={label}
        placeholder='Search resolution codes...'
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          handleInputChange(e.target.value);
        }}
        onBlur={() => {
          setTimeout(() => setOpen(false), 200);
        }}
        onFocus={() => {
          const next = buildOptions(inputValue);
          setOptions(next);
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

      {open && options.length > 0 && (
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
              <ListItem key={option.id} disablePadding>
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
                    primary={option.label}
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
