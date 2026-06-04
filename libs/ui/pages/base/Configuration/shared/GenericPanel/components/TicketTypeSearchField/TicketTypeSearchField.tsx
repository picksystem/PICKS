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
import { useSharedTicketTypes } from '../../../../hooks/useSharedTicketTypes';

export interface TicketTypeSearchFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

export const TicketTypeSearchField = ({
  label,
  value,
  onChange,
  required,
  error,
  helperText,
}: TicketTypeSearchFieldProps) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [options, setOptions] = useState<{ id: string; displayName: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const { ticketTypes, isLoading } = useSharedTicketTypes();

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleInputChange = useCallback(
    (newInputValue: string) => {
      setInputValue(newInputValue);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (newInputValue.length < 1) {
        setOptions([]);
        setOpen(false);
        return;
      }

      debounceRef.current = setTimeout(() => {
        setLoading(true);

        // Filter ticket types based on input
        const filtered = (ticketTypes ?? [])
          .filter((tt) => {
            const searchLower = newInputValue.toLowerCase();
            return (
              tt.displayName?.toLowerCase().includes(searchLower) ||
              tt.name.toLowerCase().includes(searchLower) ||
              tt.type.toLowerCase().includes(searchLower)
            );
          })
          .map((tt) => ({
            id: tt.type,
            displayName: tt.displayName || tt.name,
            name: tt.name,
          }));

        setOptions(filtered);
        setOpen(filtered.length > 0);
        setLoading(false);
      }, 200);
    },
    [ticketTypes],
  );

  const handleSelect = (ticketType: { id: string; displayName: string }) => {
    setInputValue(ticketType.displayName);
    setOpen(false);
    setOptions([]);
    onChange(ticketType.id);
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
        placeholder='Search ticket types...'
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          handleInputChange(e.target.value);
        }}
        onBlur={() => {
          setTimeout(() => setOpen(false), 200);
        }}
        onFocus={() => {
          if (inputValue.length >= 1 && options.length > 0) {
            setOpen(true);
          }
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
                  {loading || isLoading ? (
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
                    primary={option.displayName}
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

export default TicketTypeSearchField;
