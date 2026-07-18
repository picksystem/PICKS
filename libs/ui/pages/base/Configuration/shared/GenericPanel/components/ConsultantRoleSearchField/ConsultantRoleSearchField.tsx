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
import { useSharedConsultantRoles } from '../../../../hooks/useSharedConsultantRoles';

export interface ConsultantRoleSearchFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** The currently selected Application on the same form — options are
   * scoped to roles defined for that application only. */
  applicationValue: string;
  required?: boolean;
  error?: boolean;
  helperText?: React.ReactNode;
}

/**
 * Search field for the "Consultant Roles" field on the Add Consultant
 * Profile dialog — options are scoped to roles specific to the currently
 * selected Application, sourced from Config > Consultant Roles > Define
 * consultant roles (User Management > Consultant Roles > Consultant Roles
 * field).
 */
export const ConsultantRoleSearchField = ({
  label,
  value,
  onChange,
  applicationValue,
  required,
  error,
  helperText,
}: ConsultantRoleSearchFieldProps) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [options, setOptions] = useState<{ id: string; name: string }[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { options: allRoleOptions, isLoading } = useSharedConsultantRoles();

  const appKey = applicationValue.trim().toLowerCase();

  const allOptions = useMemo(() => {
    if (!appKey) return [];
    const seen = new Set<string>();
    const opts: { id: string; name: string }[] = [];
    allRoleOptions.forEach((r) => {
      if (r.application.trim().toLowerCase() !== appKey) return;
      const name = r.consultantRole.trim();
      if (name && !seen.has(name)) {
        seen.add(name);
        opts.push({ id: name, name });
      }
    });
    return opts.sort((a, b) => a.name.localeCompare(b.name));
  }, [allRoleOptions, appKey]);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const buildOptions = useCallback(
    (query: string) =>
      allOptions.filter((r) => {
        if (!query) return true;
        return r.name.toLowerCase().includes(query.toLowerCase());
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
        placeholder={appKey ? 'Search consultant roles...' : 'Select an application first'}
        value={inputValue}
        disabled={!appKey}
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

export default ConsultantRoleSearchField;
