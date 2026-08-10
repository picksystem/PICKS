import { useState, useEffect, useRef, useCallback } from 'react';
import { Box, TextField, Checkbox, Select, MenuItem } from '@serviceops/component';
import { FormControl, InputLabel, Typography } from '@mui/material';
import { ICustomField } from '@serviceops/interfaces';

export interface CustomFieldRendererProps {
  field: ICustomField;
  value: string | boolean;
  onChange: (value: string | boolean) => void;
  error?: boolean;
  errorText?: string | React.ReactNode;
}

const CustomFieldRenderer = ({ field, value, onChange, error, errorText }: CustomFieldRendererProps) => {
  const [searchText, setSearchText] = useState(value as string);
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSearchText(value as string);
  }, [value]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSelect = useCallback(
    (val: string) => {
      setSearchText(val);
      onChange(val);
      setIsOpen(false);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    [onChange],
  );

  switch (field.fieldType) {
    case 'textarea':
      return (
        <Box sx={{ gridColumn: '1 / -1' }}>
          <TextField
            label={field.fieldName}
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
            multiline
            rows={3}
            error={error}
                        errorText={errorText as string | undefined}
          />
        </Box>
      );
    case 'number':
      return (
        <TextField
          label={field.fieldName}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          type='number'
          error={error}
                      errorText={errorText as string | undefined}
        />
      );
    case 'date':
      return (
        <TextField
          label={field.fieldName}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          type='date'
          InputLabelProps={{ shrink: true }}
          error={error}
                      errorText={errorText as string | undefined}
        />
      );
    case 'dropdown': {
      const opts = field.dropdownOptions ?? [];
      return (
        <Box sx={{ position: 'relative' }} ref={anchorRef}>
          <TextField
            label={field.fieldName}
            value={searchText}
            onChange={(e) => {
              const next = e.target.value;
              setSearchText(next);
              if (debounceRef.current) clearTimeout(debounceRef.current);
              debounceRef.current = setTimeout(() => {
                setIsOpen(next.length > 0 && opts.length > 0);
              }, 200);
            }}
            onFocus={() => {
              if (opts.length > 0) setIsOpen(true);
            }}
            onBlur={() => {
              setTimeout(handleClose, 150);
            }}
            placeholder={`Search or select ${field.fieldName.toLowerCase()}`}
            error={error}
                        errorText={errorText as string | undefined}
          />
          {isOpen && opts.length > 0 && (
            <Box
              sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 1300,
                mt: 0.5,
                maxHeight: 240,
                overflow: 'auto',
                background: 'background.paper',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                borderRadius: 1,
              }}
            >
              {opts
                .filter((o) => o.toLowerCase().includes(searchText.toLowerCase()))
                .map((opt) => (
                  <Box
                    key={opt}
                    sx={{
                      px: 2,
                      py: 1,
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'action.hover' },
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                    onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
                    onClick={() => handleSelect(opt)}
                  >
                    {opt}
                  </Box>
                ))}
            </Box>
          )}
        </Box>
      );
    }
    case 'checkbox':
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', pt: 1 }}>
          <Checkbox
            label={field.fieldName}
            checked={!!value}
            onChange={(_, checked) => onChange(checked)}
          />
        </Box>
      );
    case 'text':
    default:
      return (
        <TextField
          label={field.fieldName}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          error={error}
          errorText={errorText}
        />
      );
  }
};

export default CustomFieldRenderer;
