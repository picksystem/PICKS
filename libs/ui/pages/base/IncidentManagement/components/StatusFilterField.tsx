import { useState, useEffect, useCallback } from 'react';
import { Box, TextField, Paper } from '@serviceops/component';
import { alpha } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import InputAdornment from '@mui/material/InputAdornment';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DraftsIcon from '@mui/icons-material/Drafts';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { IncidentStatus } from '../../../../../entities/interfaces';

export interface StatusOption {
  value: string;
  label: string;
  icon: React.ReactNode;
}

const STATUS_OPTIONS: StatusOption[] = [
  { value: 'all', label: 'All', icon: <AssignmentIcon /> },
  { value: IncidentStatus.NEW, label: 'New', icon: <FiberNewIcon /> },
  {
    value: 'in_progress',
    label: 'In Progress',
    icon: <AutorenewIcon />,
  },
  { value: IncidentStatus.ON_HOLD, label: 'On Hold', icon: <PauseCircleIcon /> },
  { value: IncidentStatus.RESOLVED, label: 'Resolved', icon: <CheckCircleIcon /> },
  { value: IncidentStatus.DRAFT, label: 'Drafts', icon: <DraftsIcon /> },
];

export interface StatusFilterFieldProps {
  value: string;
  options: StatusOption[];
  onChange: (value: string) => void;
  className?: string;
}

export const StatusFilterField = ({
  value,
  options,
  onChange,
  className,
}: StatusFilterFieldProps) => {
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [open, setOpen] = useState(false);

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

  const handleSelect = (option: StatusOption) => {
    setInputValue(option.label);
    setOpen(false);
    onChange(option.value);
  };

  const handleClear = () => {
    setInputValue('');
    setFilteredOptions(options);
    setOpen(false);
    onChange('all');
  };

  return (
    <Box className={className} sx={{ position: 'relative' }}>
      <TextField
        placeholder='Filter by status...'
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
                      bgcolor: alpha('#2563eb', 0.08),
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Box sx={{ fontSize: 18, color: 'text.secondary', display: 'flex' }}>
                      {option.icon}
                    </Box>
                  </ListItemIcon>
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

export default StatusFilterField;
