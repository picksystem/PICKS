import { Box, TextField, Paper } from '@serviceops/component';
import { alpha } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import InputAdornment from '@mui/material/InputAdornment';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { useState, useEffect, useCallback } from 'react';

export interface UserRoleFilterFieldProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const ROLE_OPTIONS = [
  { id: 'admin', name: 'Admin' },
  { id: 'user', name: 'User' },
  { id: 'consultant', name: 'Consultant' },
];

export const UserRoleFilterField = ({ value, onChange, className }: UserRoleFilterFieldProps) => {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<{ id: string; name: string }[]>([]);
  const [open, setOpen] = useState(false);

  // Keep the displayed text in sync with the selected role, so the field
  // reflects the current filter (and stays blank for the default "all roles").
  useEffect(() => {
    if (!value) {
      setInputValue('');
      return;
    }
    const match = ROLE_OPTIONS.find((opt) => opt.id === value);
    setInputValue(match?.name ?? '');
  }, [value]);

  const buildOptions = useCallback(
    (query: string) =>
      ROLE_OPTIONS.filter((opt) => {
        if (!query) return true;
        return opt.name.toLowerCase().includes(query.toLowerCase());
      }),
    [],
  );

  const handleInputChange = useCallback(
    (newInputValue: string) => {
      setInputValue(newInputValue);
      const filtered = buildOptions(newInputValue);
      setOptions(filtered);
      setOpen(filtered.length > 0);
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

  return (
    <Box className={className} sx={{ position: 'relative' }}>
      <TextField
        placeholder='Filter by role...'
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
                  selected={option.id === value}
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

export default UserRoleFilterField;
