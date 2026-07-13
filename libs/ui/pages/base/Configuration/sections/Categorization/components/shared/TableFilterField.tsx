import { useCallback, useEffect, useState } from 'react';
import { Box, TextField, Paper } from '@serviceops/component';
import { alpha } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import InputAdornment from '@mui/material/InputAdornment';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';

// Mirrors UserRoleFilterField (User Management's "Filter by role" field) so
// every GenericPanel `toolbarExtra` filter across the Categorization dialogs
// (Service Lines' Approvals/Timesheet/Expenses, Applications' Approvals/
// Timesheet/Expenses/Support Lines/Billing Codes, ...) matches that
// reference exactly: a typeahead text field with a filter icon that opens a
// popover list of matching options, generalized to any string-valued
// column. Sized to match GenericPanel's own `tableSearchField` (see
// GenericPanel.styles.shared.ts) so it always lines up with the search box
// next to it.
export interface TableFilterFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  className?: string;
}

export const TableFilterField = ({
  label,
  value,
  onChange,
  options,
  className,
}: TableFilterFieldProps) => {
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setInputValue(value ?? '');
  }, [value]);

  const buildOptions = useCallback(
    (query: string) =>
      options.filter((opt) => !query || opt.toLowerCase().includes(query.toLowerCase())),
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

  const handleSelect = (option: string) => {
    setInputValue(option);
    setOpen(false);
    setFilteredOptions([]);
    onChange(option);
  };

  const handleClear = () => {
    setInputValue('');
    setFilteredOptions([]);
    setOpen(false);
    onChange('');
  };

  return (
    <Box className={className} sx={{ position: 'relative', flexShrink: 0 }}>
      <TextField
        placeholder={`Filter by ${label.toLowerCase()}...`}
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onBlur={() => {
          setTimeout(() => setOpen(false), 200);
        }}
        onFocus={() => {
          const next = buildOptions(inputValue);
          setFilteredOptions(next);
          if (next.length > 0) setOpen(true);
        }}
        size='small'
        sx={{
          // Matches GenericPanel's own `tableSearchField` style exactly
          // (see GenericPanel.styles.shared.ts) so the filter fields and
          // the panel's search box are the same height/width.
          flexShrink: 0,
          width: '210px',
          '& .MuiOutlinedInput-root': {
            height: '30px',
            fontSize: '0.8rem',
            backgroundColor: 'common.white',
            borderRadius: '6px',
          },
          '& .MuiInputBase-input': {
            padding: '4px 6px',
            fontSize: '0.8rem',
          },
          '& .MuiInputBase-input::placeholder': {
            opacity: 0.7,
          },
        }}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position='end'>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {inputValue ? (
                    <ClearIcon
                      onClick={handleClear}
                      sx={{
                        fontSize: '1.1rem',
                        color: 'text.secondary',
                        cursor: 'pointer',
                        '&:hover': { color: 'text.primary' },
                      }}
                    />
                  ) : (
                    <FilterListIcon sx={{ fontSize: '1.1rem', color: 'text.secondary' }} />
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
              <ListItem key={option} disablePadding>
                <ListItemButton
                  selected={option === value}
                  onClick={() => handleSelect(option)}
                  sx={{
                    py: 1,
                    px: 1.5,
                    '&:hover': { bgcolor: alpha('#0369a1', 0.08) },
                  }}
                >
                  <ListItemText
                    primary={option}
                    primaryTypographyProps={{ fontSize: '0.84rem', noWrap: true }}
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

export default TableFilterField;
