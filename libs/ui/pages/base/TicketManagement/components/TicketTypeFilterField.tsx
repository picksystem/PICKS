import { useState, useEffect, useCallback } from 'react';
import { Box, TextField, Paper } from '@serviceops/component';
import { alpha } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import InputAdornment from '@mui/material/InputAdornment';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';

export interface TicketTypeFilterFieldProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  className?: string;
}

export const TicketTypeFilterField = ({
  value,
  options,
  onChange,
  className,
}: TicketTypeFilterFieldProps) => {
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [open, setOpen] = useState(false);

  // Keep the displayed text in sync with the selected ticket type, so the field
  // reflects the current filter (and stays blank for the default "all types").
  useEffect(() => {
    if (!value) {
      setInputValue('');
      return;
    }
    const match = options.find((opt) => opt.value === value);
    setInputValue(match?.label ?? '');
  }, [value, options]);

  const buildOptions = useCallback(
    (query: string) =>
      options.filter((opt) => {
        if (!query) return true;
        return opt.label.toLowerCase().includes(query.toLowerCase());
      }),
    [options],
  );

  const handleInputChange = useCallback(
    (newInputValue: string) => {
      setInputValue(newInputValue);
      const next = buildOptions(newInputValue);
      setFilteredOptions(next);
      setOpen(next.length > 0);
    },
    [buildOptions],
  );

  const handleSelect = (option: { value: string; label: string }) => {
    setInputValue(option.label);
    setOpen(false);
    onChange(option.value);
  };

  const handleClear = () => {
    setInputValue('');
    setFilteredOptions(options);
    setOpen(false);
    onChange('');
  };

  return (
    <Box className={className} sx={{ position: 'relative' }}>
      <TextField
        placeholder='Filter by ticket type...'
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
          setFilteredOptions(next);
          if (next.length > 0) setOpen(true);
        }}
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
                        color: 'text.primary',
                        cursor: 'pointer',
                        '&:hover': { color: 'text.primary' },
                      }}
                    />
                  ) : (
                    <FilterListIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  )}
                </Box>
              </InputAdornment>
            ),
          },
        }}
      />

      {open && filteredOptions.length > 0 && (
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
            {filteredOptions.map((option) => (
              <ListItem key={option.value} disablePadding>
                <ListItemButton
                  selected={option.value === value}
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

export default TicketTypeFilterField;
