import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Box, TextField } from '@serviceops/component';
import {
  Popper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  InputAdornment,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';

export interface CommentTypeFilterFieldProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  className?: string;
}

export const CommentTypeFilterField = ({
  value,
  options,
  onChange,
  className,
}: CommentTypeFilterFieldProps) => {
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const popperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!value) {
      setInputValue('');
      return;
    }
    const match = options.find((opt) => opt.value === value);
    setInputValue(match?.label ?? '');
  }, [value, options]);

  const buildOptions = useMemo(
    () => (query: string) =>
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

  const handleSelect = useCallback(
    (option: { value: string; label: string }) => {
      setInputValue(option.label);
      setOpen(false);
      onChange(option.value);
    },
    [onChange],
  );

  const handleItemMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInputValue('');
    setFilteredOptions(options);
    setOpen(false);
    onChange('');
  };

  const handleFocus = useCallback(() => {
    const next = buildOptions(inputValue);
    setFilteredOptions(next);
    if (next.length > 0) setOpen(true);
  }, [buildOptions, inputValue]);

  useEffect(() => {
    if (!open) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (anchorRef.current?.contains(target)) return;
      if (popperRef.current?.contains(target)) return;
      setOpen(false);
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [open]);

  return (
    <Box ref={anchorRef} sx={{ position: 'relative' }}>
      <TextField
        className={className}
        placeholder='Filter by type...'
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          handleInputChange(e.target.value);
        }}
        onFocus={handleFocus}
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

      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement='bottom-start'
        disablePortal={false}
        modifiers={[
          { name: 'flip', enabled: false },
          { name: 'preventOverflow', enabled: false },
        ]}
        sx={{ zIndex: 2000 }}
      >
        <Box
          ref={popperRef}
          sx={{
            width: anchorRef.current ? anchorRef.current.offsetWidth : undefined,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            boxShadow: 4,
            maxHeight: 280,
            overflow: 'auto',
          }}
        >
          <List dense disablePadding>
            {filteredOptions.map((option) => (
              <ListItem key={option.value} disablePadding>
                <ListItemButton
                  selected={option.value === value}
                  onMouseDown={handleItemMouseDown}
                  onClick={() => handleSelect(option)}
                  sx={{
                    py: 1,
                    px: 1.5,
                    '&:hover': {
                      bgcolor: 'rgba(3,105,161,0.08)',
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
        </Box>
      </Popper>
    </Box>
  );
};

export default CommentTypeFilterField;
