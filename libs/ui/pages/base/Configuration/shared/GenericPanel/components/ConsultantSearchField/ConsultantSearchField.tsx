import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Paper,
  Tooltip,
  Checkbox,
  Typography,
  Button,
} from '@serviceops/component';
import { ListItemIcon, List, ListItem, ListItemButton, ListItemText, alpha } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { createPortal } from 'react-dom';
import { IConfigUserConsultantProfile } from '@serviceops/interfaces';
import { useGetConfigurationQuery } from '@serviceops/services';

export interface ConsultantSearchFieldProps {
  label: string;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: React.ReactNode;
  tooltipField?: keyof Pick<IConfigUserConsultantProfile, 'shortDescription' | 'internalNote'>;
  primaryIndex?: number;
  onPrimaryChange?: (index: number) => void;
}

const MAX_SELECTION = 3;

const getSelectedSet = (val: string | string[]): Set<string> => {
  if (!val) return new Set();
  return new Set(Array.isArray(val) ? val : [val]);
};

const formatMultipleValue = (val: string | string[]): string => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return val.join(', ');
};

export const ConsultantSearchField = ({
  label,
  value,
  onChange,
  multiple = false,
  required,
  error,
  helperText,
  tooltipField = 'shortDescription',
  primaryIndex = 0,
  onPrimaryChange,
}: ConsultantSearchFieldProps) => {
  const isMulti = Boolean(multiple);
  const selectedSet = useMemo(() => getSelectedSet(value), [value]);
  const selectedArray = useMemo(
    () => (Array.isArray(value) ? value : value ? [value] : []),
    [value],
  );
  const [inputValue, setInputValue] = useState<string>('');
  const [options, setOptions] = useState<IConfigUserConsultantProfile[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: configData, isLoading } = useGetConfigurationQuery();

  const allProfiles = useMemo(
    () => configData?.data?.userManagement?.consultantProfiles ?? [],
    [configData],
  );

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleItemMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      // Check if click is outside both the field container and the dropdown portal
      const isOutsideField = containerRef.current && !containerRef.current.contains(target);
      const dropdownEl = document.querySelector('[data-consultant-dropdown]');
      const isOutsideDropdown = !dropdownEl || !dropdownEl.contains(target);

      if (isOutsideField && isOutsideDropdown) {
        setIsOpen(false);
      }
    };

    // Use mousedown instead of click to fire before blur
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    setInputValue(isMulti ? '' : String(value || ''));
  }, [value, isMulti]);

  const updateDropdownPosition = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 1,
        left: rect.left,
        width: rect.width,
      });
    }
  }, []);

  const buildOptions = useCallback(
    (query: string) => {
      if (!query) return allProfiles;
      const q = query.toLowerCase();
      return allProfiles.filter((p) => p.consultantName.toLowerCase().includes(q));
    },
    [allProfiles],
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
        setIsOpen(filtered.length > 0);
      }, 200);
    },
    [buildOptions],
  );

  const handleSelect = (option: IConfigUserConsultantProfile) => {
    const name = option.consultantName;
    if (isMulti) {
      const isAlreadySelected = selectedSet.has(name);
      if (!isAlreadySelected && selectedSet.size >= MAX_SELECTION) {
        return; // Block selection beyond the limit
      }
      const next = new Set(selectedSet);
      if (isAlreadySelected) {
        next.delete(name);
      } else {
        next.add(name);
      }
      onChange(Array.from(next));
    } else {
      setInputValue(name);
      setIsOpen(false);
      setOptions([]);
      onChange(name);
    }
  };

  const handleClear = () => {
    setInputValue('');
    setOptions([]);
    setIsOpen(false);
    onChange(isMulti ? [] : '');
  };

  const handleSetPrimary = (index: number) => {
    if (onPrimaryChange) {
      onPrimaryChange(index);
    }
  };

  const displayValue = isMulti ? formatMultipleValue(value) : String(value || '');

  const handleFocus = useCallback(() => {
    if (isMulti) {
      setInputValue('');
    }
    const next = buildOptions(isMulti ? '' : inputValue);
    setOptions(next);
    if (next.length > 0) {
      setIsOpen(true);
      updateDropdownPosition();
    }
  }, [isMulti, inputValue, buildOptions, updateDropdownPosition]);

  const dropdown =
    isOpen && options.length > 0 && dropdownPos ? (
      <Paper
        elevation={4}
        data-consultant-dropdown
        sx={{
          position: 'fixed',
          top: dropdownPos.top,
          left: dropdownPos.left,
          width: dropdownPos.width,
          zIndex: 1300,
          maxHeight: 240,
          overflow: 'auto',
        }}
      >
        <List dense disablePadding>
          {options.map((option) => {
            const tooltipContent = option[tooltipField];
            const isChecked = selectedSet.has(option.consultantName);
            return (
              <ListItem key={option.id} disablePadding>
                <Tooltip title={tooltipContent || ''} arrow placement='left' enterDelay={300}>
                  <ListItemButton
                    onClick={() => handleSelect(option)}
                    onMouseDown={handleItemMouseDown}
                    sx={{
                      py: 1,
                      px: 1.5,
                      '&:hover': {
                        bgcolor: alpha('#0369a1', 0.08),
                      },
                    }}
                  >
                    {isMulti && (
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Checkbox size='small' checked={isChecked} sx={{ padding: '2px' }} />
                      </ListItemIcon>
                    )}
                    <ListItemText
                      primary={option.consultantName}
                      primaryTypographyProps={{
                        fontSize: '0.84rem',
                        noWrap: true,
                      }}
                    />
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            );
          })}
        </List>
      </Paper>
    ) : null;

  return (
    <Box sx={{ position: 'relative' }} ref={containerRef}>
      <TextField
        label={label}
        placeholder='Search consultants...'
        value={displayValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          handleInputChange(e.target.value);
        }}
        onFocus={handleFocus}
        required={required}
        error={error}
        helperText={helperText}
        fullWidth
        size='small'
        slotProps={{
          input: {
            readOnly: isMulti,
            endAdornment: (
              <InputAdornment position='end'>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {isLoading ? (
                    <CircularProgress size={16} />
                  ) : isMulti && selectedSet.size > 0 ? (
                    <ClearIcon
                      onClick={handleClear}
                      sx={{
                        fontSize: 18,
                        color: 'text.secondary',
                        cursor: 'pointer',
                        '&:hover': { color: 'text.primary' },
                      }}
                    />
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

      {isMulti && selectedArray.length > 0 && (
        <Box
          sx={{
            mt: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography
              sx={{
                fontSize: '0.72rem',
                fontWeight: 500,
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Selected Resources ({selectedArray.length}/{MAX_SELECTION})
            </Typography>
            <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
              {primaryIndex + 1} Primary &middot; {selectedArray.length - primaryIndex - 1}{' '}
              Secondary
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
              maxHeight: 180,
              overflow: 'auto',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
            }}
          >
            {selectedArray.map((name, idx) => (
              <Box
                key={name}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1.5,
                  py: 0.75,
                  bgcolor: idx === primaryIndex ? alpha('#0369a1', 0.08) : 'transparent',
                  '&:hover': {
                    bgcolor: idx === primaryIndex ? alpha('#0369a1', 0.12) : alpha('#0369a1', 0.04),
                  },
                  borderRadius: 0.5,
                }}
              >
                <Typography
                  sx={{
                    flex: 1,
                    fontSize: '0.84rem',
                    fontWeight: idx === primaryIndex ? 600 : 400,
                    color: idx === primaryIndex ? '#0369a1' : 'text.primary',
                  }}
                >
                  {name}
                </Typography>
                {idx === primaryIndex ? (
                  <Typography
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: '#0369a1',
                      bgcolor: alpha('#0369a1', 0.1),
                      px: 0.75,
                      py: 0.25,
                      borderRadius: 0.5,
                      textTransform: 'uppercase',
                      letterSpacing: 0.3,
                    }}
                  >
                    Primary
                  </Typography>
                ) : (
                  <Button
                    variant='text'
                    size='small'
                    onClick={() => handleSetPrimary(idx)}
                    sx={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: '#0369a1',
                      textTransform: 'none',
                      minWidth: 'auto',
                      py: 0.25,
                      px: 1,
                      '&:hover': {
                        bgcolor: alpha('#0369a1', 0.08),
                      },
                    }}
                  >
                    Make Primary
                  </Button>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {dropdown ? createPortal(dropdown, document.body) : null}
    </Box>
  );
};

export default ConsultantSearchField;
