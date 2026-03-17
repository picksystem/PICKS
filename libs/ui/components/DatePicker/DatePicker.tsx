import { SxProps, TextField, Theme } from '@mui/material';
import { useStyles } from './styles';

export interface DSDatePickerProps {
  value?: string | Date | null;
  onChange?: (value: string) => void;
  minDate?: string;
  maxDate?: string;
  className?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  variant?: 'standard' | 'outlined' | 'filled';
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  sx?: SxProps<Theme>;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

const DatePicker: React.FC<DSDatePickerProps> = ({
  value,
  onChange,
  minDate,
  maxDate,
  className,
  label,
  placeholder,
  disabled = false,
  required = false,
  error = false,
  helperText,
  variant = 'outlined',
  size = 'medium',
  fullWidth = true,
  sx,
  onBlur,
  onFocus,
  ...rest
}) => {
  const { cx, classes } = useStyles();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(event.target.value);
    }
  };

  const dateValue = value instanceof Date ? value.toISOString().split('T')[0] : value;

  return (
    <TextField
      type='date'
      value={dateValue || ''}
      onChange={handleChange}
      onBlur={onBlur}
      onFocus={onFocus}
      label={label}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      error={error}
      helperText={helperText}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      InputLabelProps={{
        shrink: true,
      }}
      inputProps={{
        min: minDate,
        max: maxDate,
      }}
      className={cx(classes.root, className)}
      sx={sx}
      {...rest}
    />
  );
};

export default DatePicker;
