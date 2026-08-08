import { Box, TextField, Checkbox } from '@serviceops/component';
import { FormControl, InputLabel, Select, MenuItem, FormControlLabel } from '@mui/material';
import { ICustomField } from '@serviceops/interfaces';

interface CustomFieldRendererProps {
  field: ICustomField;
  value: unknown;
  onChange: (value: unknown) => void;
  size?: 'small' | 'medium';
}

/**
 * Renders a single custom field based on its type. Returns `null` when the
 * field type is unknown so callers can safely render arbitrary arrays of
 * ICustomField definitions.
 */
export const CustomFieldRenderer = ({
  field,
  value,
  onChange,
  size = 'small',
}: CustomFieldRendererProps) => {
  switch (field.fieldType) {
    case 'text':
    case 'textarea':
      return (
        <TextField
          label={field.fieldName}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          size={size}
          fullWidth
          multiline={field.fieldType === 'textarea'}
          rows={field.fieldType === 'textarea' ? 3 : undefined}
          placeholder={field.defaultValue as string | undefined}
        />
      );

    case 'number':
      return (
        <TextField
          label={field.fieldName}
          value={value !== null ? String(value) : ''}
          onChange={(e) => {
            const v = e.target.value;
            if (v === '') onChange('');
            else {
              const num = Number(v);
              onChange(Number.isNaN(num) ? v : num);
            }
          }}
          size={size}
          fullWidth
          type='number'
        />
      );

    case 'date':
      return (
        <TextField
          label={field.fieldName}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          size={size}
          fullWidth
          type='date'
          InputLabelProps={{ shrink: true }}
        />
      );

    case 'dropdown':
      return (
        <FormControl fullWidth size={size}>
          <InputLabel id={`cf-${field.id}-label`}>{field.fieldName}</InputLabel>
          <Select
            labelId={`cf-${field.id}-label`}
            label={field.fieldName}
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
          >
            {field.dropdownOptions?.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );

    case 'checkbox':
      return (
        <Box>
          <FormControlLabel
            control={<Checkbox checked={!!value} onChange={(e) => onChange(e.target.checked)} />}
            label={field.fieldName}
          />
        </Box>
      );

    default:
      return null;
  }
};

export default CustomFieldRenderer;
