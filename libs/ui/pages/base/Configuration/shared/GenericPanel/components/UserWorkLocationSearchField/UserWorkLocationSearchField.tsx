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
import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { useSharedUserWorkLocations } from '../../../../hooks/useSharedUserWorkLocations';

export interface UserWorkLocationSearchFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Fired with the selected work location's defaults (Working Calendar /
   * Holiday Calendar) so the caller can auto-fill sibling fields. */
  onLocationSelect?: (defaults: { workingCalendar: string; holidayCalendar: string }) => void;
  required?: boolean;
  error?: boolean;
  helperText?: React.ReactNode;
}

/**
 * Search field for the "Work Location" field on the Add Consultant Profile
 * dialog — options are sourced from User Management > Work Locations > Work
 * Location, matching the same shared-list pattern as ConsultantSearchField /
 * ConsultantRoleSearchField.
 */
export const UserWorkLocationSearchField = ({
  label,
  value,
  onChange,
  onLocationSelect,
  required,
  error,
  helperText,
}: UserWorkLocationSearchFieldProps) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [options, setOptions] = useState<{ id: string; name: string }[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { options: allLocationOptions, isLoading } = useSharedUserWorkLocations();

  // Keyed by work location name so a selection can look up that location's
  // Working Calendar / Holiday Calendar defaults for `onLocationSelect`.
  const defaultsByName = useMemo(() => {
    const map = new Map<string, { workingCalendar: string; holidayCalendar: string }>();
    allLocationOptions.forEach((l) => {
      const name = l.workLocation.trim();
      if (name && !map.has(name)) {
        map.set(name, { workingCalendar: l.workingCalendar, holidayCalendar: l.holidayCalendar });
      }
    });
    return map;
  }, [allLocationOptions]);

  const allOptions = useMemo(() => {
    const seen = new Set<string>();
    const opts: { id: string; name: string }[] = [];
    allLocationOptions.forEach((l) => {
      const name = l.workLocation.trim();
      if (name && !seen.has(name)) {
        seen.add(name);
        opts.push({ id: name, name });
      }
    });
    return opts.sort((a, b) => a.name.localeCompare(b.name));
  }, [allLocationOptions]);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const buildOptions = useCallback(
    (query: string) =>
      allOptions.filter((l) => {
        if (!query) return true;
        return l.name.toLowerCase().includes(query.toLowerCase());
      }),
    [allOptions],
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
    onChange(option.name);
    const defaults = defaultsByName.get(option.name);
    if (defaults) onLocationSelect?.(defaults);
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
        placeholder='Search work locations...'
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
                  {isLoading ? (
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

export default UserWorkLocationSearchField;
