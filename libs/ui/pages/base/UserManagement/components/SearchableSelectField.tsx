import { Box, TextField, Paper } from '@serviceops/component';
import { alpha } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useState, useEffect } from 'react';

export interface SearchableSelectOption {
  value: string;
  label: string;
}

export interface SearchableSelectFieldProps {
  label: string;
  placeholder?: string;
  value: string;
  options: SearchableSelectOption[];
  onChange: (value: string) => void;
  onBlur?: () => void;
  required?: boolean;
  error?: boolean;
  helperText?: React.ReactNode;
}

export const SearchableSelectField = ({
  label,
  placeholder,
  value,
  options,
  onChange,
  onBlur,
  required,
  error,
  helperText,
}: SearchableSelectFieldProps) => {
  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!value) {
      setInputValue('');
      return;
    }
    const match = options.find((opt) => opt.value === value);
    setInputValue(match?.label ?? '');
  }, [value, options]);

  const filteredOptions = options.filter(
    (opt) => !inputValue.trim() || opt.label.toLowerCase().includes(inputValue.toLowerCase()),
  );

  const handleSelect = (option: SearchableSelectOption) => {
    setInputValue(option.label);
    setOpen(false);
    onChange(option.value);
  };

  const handleClear = () => {
    setInputValue('');
    setOpen(false);
    onChange('');
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <TextField
        label={label}
        placeholder={placeholder ?? `Search ${label.toLowerCase()}...`}
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          onBlur?.();
          setTimeout(() => setOpen(false), 200);
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
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
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

      {open && filteredOptions.length > 0 && (
        <Paper
          elevation={4}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1300,
            mt: 0.5,
            maxHeight: 240,
            overflow: 'auto',
          }}
        >
          <List dense disablePadding>
            {filteredOptions.map((option) => {
              const isActive = option.value === value;
              return (
                <ListItem key={option.value} disablePadding>
                  <ListItemButton
                    onClick={() => handleSelect(option)}
                    sx={{
                      py: 1,
                      px: 1.5,
                      bgcolor: isActive ? alpha('#0369a1', 0.08) : 'transparent',
                      '&:hover': {
                        bgcolor: alpha('#0369a1', 0.12),
                      },
                    }}
                  >
                    <ListItemText
                      primary={option.label}
                      primaryTypographyProps={{
                        fontSize: '0.84rem',
                        fontWeight: isActive ? 700 : 400,
                        noWrap: true,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default SearchableSelectField;
