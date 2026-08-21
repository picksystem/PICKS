import { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Paper, InputAdornment, TextField } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';

interface ReasonCodeSearchFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  sx?: Record<string, unknown>;
}

const ReasonCodeSearchField = ({
  label = 'Reason Code',
  value,
  onChange,
  required = false,
  disabled = false,
  sx,
}: ReasonCodeSearchFieldProps) => {
  const { reasonCodes } = useConfiguration();
  const [inputValue, setInputValue] = useState(value);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<{ id: string; label: string }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Show all reason codes, matching the PriorityChangeSection (which shows
  // every row regardless of activate state).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const reasonCodeList =
    reasonCodes?.priorityChangeReasonCodes?.map((c) => ({
      id: c.name,
      label: c.name,
    })) ?? [];

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
        ? reasonCodeList
            .filter((c) => c.label.toLowerCase().includes(q))
            .map((c) => ({ id: c.id, label: c.label }))
        : reasonCodeList.map((c) => ({ id: c.id, label: c.label }));
      setFilteredOptions(options);
      return options;
    },
    [reasonCodeList],
  );

  const handleInputChange = useCallback(
    (newValue: string) => {
      setInputValue(newValue);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        buildOptions(newValue);
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
        placeholder='Search reason codes...'
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        fullWidth
        size='small'
        InputProps={{
          endAdornment: (
            <InputAdornment position='end'>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {inputValue ? (
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

export { ReasonCodeSearchField };
