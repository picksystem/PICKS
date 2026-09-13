import { Box, Typography, TextField, Checkbox } from '@serviceops/component';
import { SearchableField } from './SearchableField';
import { CustomFieldType } from '@serviceops/interfaces';

export interface DynamicFieldProps {
  fieldKey: string;
  fieldLabel: string;
  fieldType: CustomFieldType;
  value: string | boolean;
  onChange: (value: string | boolean) => void;
  error?: boolean;
  errorText?: string | React.ReactNode;
  required?: boolean;
  dropdownOptions?: { value: string; label: string }[];
  fullWidth?: boolean;
  rows?: number;
  helperText?: string;
}

/**
 * Renders a single form field based on its type.
 * Used by CreateTicketDetail to render fields dynamically
 * from the Ticket Screen Layout configuration.
 *
 * Note: 'attachment' type is handled directly in CreateTicketDetail
 * because UploadFile uses a FileList | null callback, not string | boolean.
 */
export const DynamicFieldRenderer = ({
  fieldLabel,
  fieldType,
  value,
  onChange,
  error,
  errorText,
  required,
  dropdownOptions,
  fullWidth,
  rows = 3,
  helperText,
}: DynamicFieldProps) => {
  switch (fieldType) {
    // ── Searchable dropdown ──────────────────────────────────────
    case 'dropdown':
      return (
        <SearchableField
          label={fieldLabel}
          value={value as string}
          onChange={(val) => onChange(val)}
          options={dropdownOptions ?? []}
          error={error}
          errorText={errorText}
          required={required}
          helperText={helperText}
        />
      );

    // ── Textarea ──────────────────────────────────────────────────
    case 'textarea':
      return (
        <TextField
          label={fieldLabel}
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          multiline
          rows={rows}
          fullWidth={fullWidth}
          required={required}
          error={error}
          errorText={errorText}
          helperText={helperText}
        />
      );

    // ── Number ────────────────────────────────────────────────────
    case 'number':
      return (
        <TextField
          label={fieldLabel}
          value={value !== null && value !== undefined ? String(value) : ''}
          onChange={(e) => {
            const v = e.target.value;
            if (v === '') onChange('');
            else {
              const num = Number(v);
              onChange(Number.isNaN(num) ? '' : String(num));
            }
          }}
          type='number'
          fullWidth={fullWidth}
          required={required}
          error={error}
          errorText={errorText}
        />
      );

    // ── Date ──────────────────────────────────────────────────────
    case 'date':
      return (
        <TextField
          label={fieldLabel}
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          type='date'
          fullWidth={fullWidth}
          required={required}
          error={error}
          errorText={errorText}
          InputLabelProps={{ shrink: true }}
        />
      );

    // ── Checkbox ──────────────────────────────────────────────────
    case 'checkbox':
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', pt: 0.5 }}>
          <Checkbox
            label={fieldLabel}
            checked={!!value}
            onChange={(_, checked) => onChange(checked)}
          />
        </Box>
      );

    // ── Text (default) ────────────────────────────────────────────
    default:
      return (
        <TextField
          label={fieldLabel}
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          fullWidth={fullWidth}
          required={required}
          error={error}
          errorText={errorText}
          helperText={helperText}
        />
      );
  }
};

export default DynamicFieldRenderer;
