import { Box, TextField, Paper } from '@serviceops/component';
import { alpha } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useState, useRef, useCallback } from 'react';

export interface ControlSearchFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: boolean;
  helperText?: React.ReactNode;
}

const CONTROL_OPTIONS = [
  { id: 'Public Holiday/Bank holiday', name: 'Public Holiday/Bank holiday' },
  { id: 'Working day', name: 'Working day' },
  { id: 'Non-working day', name: 'Non-working day' },
  { id: 'Leave', name: 'Leave' },
];

export const ControlSearchField = ({
  label,
  value,
  onChange,
  required,
  error,
  helperText,
}: ControlSearchFieldProps) => {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<{ id: string; name: string }[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Resolve the displayed text from the stored id
  useState(() => {
    if (!value) {
      setInputValue('');
    } else {
      const match = CONTROL_OPTIONS.find((opt) => opt.id === value);
      setInputValue(match?.name ?? '');
    }
  });

  const buildOptions = useCallback(
    (query: string) =>
      CONTROL_OPTIONS.filter((opt) => {
        if (!query) return true;
        return opt.name.toLowerCase().includes(query.toLowerCase());
      }),
    [],
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
    setInputValue(option.name);
    setOpen(false);
    setOptions([]);
    onChange(option.id);
  };

  const handleClear = () => {
    setInputValue('');
    setOptions([]);
    setOpen(false);
    onChange('');
  };

  const displayValue = value
    ? CONTROL_OPTIONS.find((opt) => opt.id === value)?.name ?? inputValue
    : inputValue;

  return (
    <Box sx={{ position: 'relative' }}>
      <TextField
        label={label}
        placeholder='Search control types...'
        value={displayValue}
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
                    primary={option.name}
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

export default ControlSearchField;
