import { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Paper, InputAdornment, TextField, CircularProgress } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { IConfigUrgencyLevel } from '@serviceops/interfaces';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';

interface UrgencySearchFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  sx?: Record<string, unknown>;
}

const UrgencySearchField = ({
  label = 'Urgency',
  value,
  onChange,
  required = false,
  disabled = false,
  sx,
}: UrgencySearchFieldProps) => {
  const { priorities } = useConfiguration();
  const [inputValue, setInputValue] = useState(value);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<{ id: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const urgencyLevels: IConfigUrgencyLevel[] =
    priorities?.urgencyLevels?.filter((u) => u.isActive) ?? [];

  // Sync external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOptionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const buildOptions = useCallback(
    (query: string) => {
      const q = query.trim().toLowerCase();
      const options = q
        ? urgencyLevels
            .filter(
              (u) => u.displayName.toLowerCase().includes(q) || u.name.toLowerCase().includes(q),
            )
            .map((u) => ({ id: u.name, label: u.displayName }))
        : urgencyLevels.map((u) => ({ id: u.name, label: u.displayName }));
      setFilteredOptions(options);
      return options;
    },
    [urgencyLevels],
  );

  const handleInputChange = useCallback(
    (newValue: string) => {
      setInputValue(newValue);
      setLoading(true);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        buildOptions(newValue);
        setLoading(false);
        setOptionsOpen(true);
      }, 150);
    },
    [buildOptions],
  );

  const handleSelect = useCallback(
    (opt: { id: string; label: string }) => {
      setInputValue(opt.label);
      onChange(opt.id);
      setOptionsOpen(false);
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    setInputValue('');
    onChange('');
    setFilteredOptions([]);
    setOptionsOpen(false);
  }, [onChange]);

  const handleFocus = useCallback(() => {
    buildOptions(inputValue);
    setOptionsOpen(true);
  }, [buildOptions, inputValue]);

  const handleBlur = useCallback(() => {
    setTimeout(() => setOptionsOpen(false), 200);
  }, []);

  return (
    <Box ref={containerRef} sx={{ position: 'relative', ...sx }}>
      <TextField
        label={label}
        required={required}
        disabled={disabled}
        placeholder={loading ? 'Loading...' : 'Search urgency levels...'}
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        fullWidth
        size='small'
        InputProps={{
          endAdornment: (
            <InputAdornment position='end'>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {loading ? (
                  <CircularProgress size={16} sx={{ color: 'text.secondary' }} />
                ) : inputValue ? (
                  <ClearIcon
                    onClick={handleClear}
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
      {optionsOpen && filteredOptions.length > 0 && !disabled && (
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
          {filteredOptions.map((opt) => (
            <Box
              key={opt.id}
              onMouseDown={() => handleSelect(opt)}
              sx={{
                px: 1.5,
                py: 1,
                cursor: 'pointer',
                fontSize: '0.84rem',
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': { borderBottom: 'none' },
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              {opt.label}
            </Box>
          ))}
        </Paper>
      )}
    </Box>
  );
};

export { UrgencySearchField };
