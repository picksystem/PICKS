import { useState, useEffect, useRef, useCallback } from 'react';
import { Box, TextField, Paper } from '@serviceops/component';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ClickAwayListener,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

export interface SearchableFieldProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  onBlur?: React.FocusEventHandler;
  error?: boolean;
  errorText?: React.ReactNode;
  label: string;
  required?: boolean;
  maxLength?: number;
  helperText?: string;
}

/**
 * Reusable searchable text field with a dropdown of options.
 * - Shows ClearIcon (X) when the field has a value
 * - Shows SearchIcon when the field is empty
 * - Dropdown opens on focus; clicking an option closes it
 * - onBlur defers closing so click events on dropdown items fire first
 */
export const SearchableField = ({
  value,
  options,
  onChange,
  onBlur,
  error,
  errorText,
  label,
  required,
  maxLength = 50,
  helperText,
}: SearchableFieldProps) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local input state when the parent value prop changes
  useEffect(() => {
    if (!value) {
      setInputValue('');
      return;
    }
    const match = options.find((opt) => opt.value === value || opt.label === value);
    setInputValue(match?.label ?? match?.value ?? value);
  }, [value, options]);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(inputValue.toLowerCase()),
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setInputValue(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChange(next);
      setIsOpen(true);
    }, 200);
  };

  const handleSelect = useCallback(
    (opt: { value: string; label: string }) => {
      // Cancel pending blur timeout so it doesn't run after selection.
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
        blurTimeoutRef.current = null;
      }
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setInputValue(opt.label ?? opt.value);
      onChange(opt.value);
      setIsOpen(false);
    },
    [onChange],
  );

  const handleClear = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setInputValue('');
    onChange('');
    setIsOpen(false);
  };

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleItemMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  const handleTextFieldBlur = useCallback(() => {
    // Defer close so click events on dropdown items fire first.
    blurTimeoutRef.current = setTimeout(() => {
      // If focus is still inside this component (including a dropdown
      // item), keep the dropdown open — handleSelect will close it.
      if (anchorRef.current && anchorRef.current.contains(document.activeElement)) {
        return;
      }
      setIsOpen(false);
    }, 150);
  }, []);

  return (
    <Box sx={{ position: 'relative' }} ref={anchorRef}>
      <TextField
        label={label}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleTextFieldBlur}
        onFocus={() => setIsOpen(true)}
        inputProps={{ maxLength }}
        required={required}
        error={error}
        errorText={errorText}
        helperText={helperText}
        fullWidth
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
      {isOpen && filteredOptions.length > 0 && (
        <ClickAwayListener onClickAway={handleClose}>
          <Paper
            elevation={4}
            sx={{
              position: 'absolute',
              top: 'calc(100% + 1px)',
              left: 0,
              right: 0,
              zIndex: 1300,
              maxHeight: 240,
              overflow: 'auto',
            }}
          >
            <List dense disablePadding>
              {filteredOptions.map((opt) => (
                <ListItem key={opt.value} disablePadding>
                  <ListItemButton
                    onClick={() => handleSelect(opt)}
                    onMouseDown={handleItemMouseDown}
                  >
                    <ListItemText
                      primary={opt.label || opt.value}
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
        </ClickAwayListener>
      )}
    </Box>
  );
};

export default SearchableField;
