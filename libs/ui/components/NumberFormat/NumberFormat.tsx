import { TextField } from '@mui/material';
import { useStyles } from './styles';

export interface DSNumberFormatProps {
  value?: string | number;
  onChange?: (value: string) => void;
  prefix?: string;
  suffix?: string;
  thousandSeparator?: boolean | string;
  decimalScale?: number;
  fixedDecimalScale?: boolean;
  allowNegative?: boolean;
  allowLeadingZeros?: boolean;
  className?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  variant?: 'standard' | 'outlined' | 'filled';
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

const NumberFormat: React.FC<DSNumberFormatProps> = ({
  value,
  onChange,
  prefix,
  suffix,
  thousandSeparator = true,
  decimalScale = 2,
  fixedDecimalScale = false,
  allowNegative = true,
  allowLeadingZeros = false,
  className,
  label,
  placeholder,
  disabled = false,
  error = false,
  helperText,
  variant = 'outlined',
  size = 'medium',
  fullWidth = true,
  onBlur,
  onFocus,
  ...rest
}) => {
  const { cx, classes } = useStyles();

  const formatNumber = (num: string | number): string => {
    if (num === '' || num === null || num === undefined) return '';

    const numStr = String(num).replace(/[^\d.-]/g, '');
    if (!allowNegative && numStr.startsWith('-')) return numStr.slice(1);

    const parts = numStr.split('.');
    let integerPart = parts[0];
    const decimalPart = parts[1];

    if (!allowLeadingZeros && integerPart.length > 1) {
      integerPart = integerPart.replace(/^0+/, '') || '0';
    }

    if (thousandSeparator) {
      integerPart = integerPart.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        typeof thousandSeparator === 'string' ? thousandSeparator : ',',
      );
    }

    let formatted = integerPart;
    if (decimalScale > 0) {
      const decimal = decimalPart || (fixedDecimalScale ? '0'.repeat(decimalScale) : '');
      formatted += `.${decimal.slice(0, decimalScale).padEnd(fixedDecimalScale ? decimalScale : 0, '0')}`;
    }

    return `${prefix || ''}${formatted}${suffix || ''}`;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value.replace(/[^\d.-]/g, '');
    if (onChange) {
      onChange(rawValue);
    }
  };

  return (
    <TextField
      value={value ? formatNumber(value) : ''}
      onChange={handleChange}
      onBlur={onBlur}
      onFocus={onFocus}
      label={label}
      placeholder={placeholder}
      disabled={disabled}
      error={error}
      helperText={helperText}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      className={cx(classes.root, className)}
      {...rest}
    />
  );
};

export default NumberFormat;
