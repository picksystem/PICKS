import { useState, useRef } from 'react';
import { Box, TextField } from '@serviceops/component';
import { Popper, MenuList, MenuItem, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export interface SearchableFieldProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  onBlur?: React.FocusEventHandler;
  error?: boolean;
  errorText?: React.ReactNode;
  label: string;
  required?: boolean;
  icon?: React.ReactNode;
  maxLength?: number;
  helperText?: string;
}

/**
 * Reusable searchable text field with a dropdown of options.
 * Used both for free-text-with-suggestions (caller/client) and as the
 * dropdown primitive for custom fields of type `dropdown`.
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
  icon,
  maxLength = 50,
  helperText,
}: SearchableFieldProps) => {
  const [searchText, setSearchText] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchText.toLowerCase()),
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setSearchText(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChange(next);
      setIsOpen(true);
    }, 200);
  };

  const handleOptionSelect = (selected: string) => {
    setSearchText(selected);
    onChange(selected);
    setIsOpen(false);
  };

  return (
    <Box sx={{ position: 'relative' }} ref={anchorRef}>
      <TextField
        label={required ? `${label} *` : label}
        value={searchText}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        onBlur={(e) => {
          setTimeout(() => setIsOpen(false), 150);
          onBlur?.(e);
        }}
        inputProps={{ maxLength }}
        error={error}
        errorText={errorText}
        helperText={helperText}
        InputProps={{
          startAdornment: icon ?? <SearchIcon sx={{ fontSize: 18, color: 'text.secondary', mr: 0.5 }} />,
        }}
      />
      <Popper open={isOpen && filteredOptions.length > 0} anchorEl={anchorRef.current} placement='bottom-start' style={{ zIndex: 1300, width: anchorRef.current?.offsetWidth }}>
        <Paper elevation={3} sx={{ mt: 0.5, maxHeight: 240, overflow: 'auto' }}>
          <MenuList>
            {filteredOptions.map((opt) => (
              <MenuItem key={opt.value} onClick={() => handleOptionSelect(opt.value)}>
                {opt.label}
              </MenuItem>
            ))}
          </MenuList>
        </Paper>
      </Popper>
    </Box>
  );
};

export default SearchableField;
