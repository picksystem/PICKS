import {
  Box,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@serviceops/component';
import { alpha, ListItemButton, ListSubheader } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useState, useRef, useEffect } from 'react';
import { getIconComponent } from '../../../utils/ticketTypeIcons';

export interface DropdownOption {
  value: string;
  label?: string;
  category?: string;
  color?: string;
}

interface CustomDropdownProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: DropdownOption[];
  selectedColor?: string;
  gradient?: string;
  error?: boolean;
  helperText?: React.ReactNode;
  required?: boolean;
  placeholder?: string;
  showIconInSelect?: boolean;
  disabled?: boolean;
}

export const CustomDropdown = ({
  label,
  value,
  onChange,
  onBlur,
  options,
  selectedColor,
  gradient,
  error,
  helperText,
  required,
  placeholder = 'Search...',
  showIconInSelect = false,
  disabled = false,
}: CustomDropdownProps) => {
  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Resolve the displayed text from the stored value
  useEffect(() => {
    if (!value) {
      setInputValue('');
      return;
    }
    const match = options.find((opt) => opt.value === value || opt.label === value);
    setInputValue(match?.label ?? match?.value ?? '');
  }, [value, options]);

  const filteredOptions = (() => {
    if (!inputValue.trim()) return options;
    const search = inputValue.toLowerCase();
    return options.filter(
      (opt) =>
        opt.value.toLowerCase().includes(search) || opt.label?.toLowerCase().includes(search),
    );
  })();

  const handleSelect = (opt: DropdownOption) => {
    setInputValue(opt.label ?? opt.value);
    setOpen(false);
    onChange(opt.value);
  };

  const handleClear = () => {
    setInputValue('');
    setOpen(false);
    onChange('');
  };

  const selectedOption = options.find((opt) => opt.value === value || opt.label === value);

  // Group options by category
  const getGroupedOptions = () => {
    const groups: { [key: string]: DropdownOption[] } = {};
    const ungrouped: DropdownOption[] = [];

    filteredOptions.forEach((opt) => {
      if (opt.category) {
        if (!groups[opt.category]) groups[opt.category] = [];
        groups[opt.category].push(opt);
      } else {
        ungrouped.push(opt);
      }
    });

    const result: Array<
      | { type: 'ungrouped'; items: DropdownOption[] }
      | { type: 'grouped'; category: string; items: DropdownOption[] }
    > = [];

    if (ungrouped.length > 0) {
      result.push({ type: 'ungrouped', items: ungrouped });
    }

    Object.keys(groups).forEach((cat) => {
      if (groups[cat].length > 0) {
        result.push({ type: 'grouped', category: cat.toUpperCase(), items: groups[cat] });
      }
    });

    return result;
  };

  const groupedOptions = getGroupedOptions();
  const hasNoResults = filteredOptions.length === 0;

  return (
    <Box ref={containerRef}>
      <Box sx={{ position: 'relative' }}>
        <TextField
          label={label}
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => !disabled && setOpen(true)}
          onBlur={() => {
            // Delay closing so the click on a list item registers
            setTimeout(() => setOpen(false), 200);
            onBlur?.();
          }}
          required={required}
          error={error}
          disabled={disabled}
          fullWidth
          size='small'
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: disabled ? 'action.hover' : undefined,
              cursor: disabled ? 'not-allowed' : undefined,
            },
          }}
          slotProps={{
            input: {
              startAdornment:
                showIconInSelect && selectedOption ? (
                  <InputAdornment position='start'>
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: 1,
                        background: gradient || alpha(selectedColor || '#0369a1', 0.08),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        mr: 0.5,
                      }}
                    >
                      {getIconComponent(selectedOption.value, {
                        fontSize: '0.95rem',
                        color: '#fff',
                      })}
                    </Box>
                  </InputAdornment>
                ) : selectedOption?.color ? (
                  <InputAdornment position='start'>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: selectedOption.color,
                        flexShrink: 0,
                      }}
                    />
                  </InputAdornment>
                ) : undefined,
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

        {open && (
          <Paper
            elevation={4}
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 1300,
              mt: 0,
              maxHeight: 280,
              overflow: 'auto',
            }}
          >
            {hasNoResults ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant='body2' fontWeight={500} color='text.primary'>
                  No options available
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Please select a different option
                </Typography>
              </Box>
            ) : (
              <List dense disablePadding>
                {groupedOptions.map((group) => {
                  if (group.type === 'ungrouped') {
                    return group.items.map((opt) => {
                      const isActive = opt.value === value || opt.label === value;
                      return (
                        <ListItem key={opt.value} disablePadding>
                          <ListItemButton
                            onClick={() => handleSelect(opt)}
                            sx={{
                              py: 1,
                              px: 1.5,
                              bgcolor: isActive
                                ? selectedColor
                                  ? alpha(selectedColor, 0.08)
                                  : 'action.selected'
                                : 'transparent',
                              '&:hover': {
                                bgcolor: selectedColor
                                  ? alpha(selectedColor, 0.12)
                                  : 'action.hover',
                              },
                            }}
                          >
                            {opt.color && (
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: '50%',
                                  bgcolor: opt.color,
                                  mr: 1.5,
                                  flexShrink: 0,
                                  border: isActive ? `2px solid ${opt.color}` : 'none',
                                  outline: isActive ? `2px solid ${alpha(opt.color, 0.3)}` : 'none',
                                }}
                              />
                            )}
                            <ListItemText
                              primary={opt.label || opt.value}
                              primaryTypographyProps={{
                                fontSize: '0.84rem',
                                fontWeight: isActive ? 700 : 400,
                                noWrap: true,
                                sx: { color: isActive && opt.color ? opt.color : 'text.primary' },
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    });
                  }
                  return (
                    <Box key={group.category}>
                      <ListSubheader
                        sx={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: 'text.secondary',
                          bgcolor: alpha(selectedColor || '#0369a1', 0.04),
                          py: 0.75,
                          px: 2,
                          lineHeight: 1.5,
                        }}
                      >
                        {group.category}
                      </ListSubheader>
                      {group.items.map((opt) => {
                        const isActive = opt.value === value || opt.label === value;
                        return (
                          <ListItem key={opt.value} disablePadding>
                            <ListItemButton
                              onClick={() => handleSelect(opt)}
                              sx={{
                                py: 1,
                                px: 1.5,
                                bgcolor: isActive
                                  ? selectedColor
                                    ? alpha(selectedColor, 0.08)
                                    : 'action.selected'
                                  : 'transparent',
                                '&:hover': {
                                  bgcolor: selectedColor
                                    ? alpha(selectedColor, 0.12)
                                    : 'action.hover',
                                },
                              }}
                            >
                              <Box
                                sx={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: 1,
                                  background:
                                    isActive && gradient
                                      ? gradient
                                      : alpha(selectedColor || '#0369a1', 0.08),
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  mr: 1.5,
                                  flexShrink: 0,
                                }}
                              >
                                {getIconComponent(opt.value, {
                                  fontSize: '0.85rem',
                                  color: isActive ? '#fff' : selectedColor || '#0369a1',
                                })}
                              </Box>
                              <ListItemText
                                primary={opt.label || opt.value}
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
                    </Box>
                  );
                })}
              </List>
            )}
          </Paper>
        )}
      </Box>

      {helperText && !open && (
        <Typography
          variant='caption'
          sx={{
            color: error ? '#d32f2f' : 'text.secondary',
            fontSize: '0.7rem',
            mt: 0.5,
          }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

export default CustomDropdown;
