import { TextField as MUITextField, InputAdornment } from '@mui/material';
import { useStyles } from './styles';
import React from 'react';

export interface DSTextFieldProps {
  id?: string;
  name?: string;
  variant?: 'outlined' | 'filled' | 'standard';
  helperText?: React.ReactNode;
  errorText?: React.ReactNode;
  error?: boolean;
  className?: string;
  label?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  type?: string;
  multiline?: boolean;
  rows?: number;
  minRows?: number;
  maxRows?: number;
  fullWidth?: boolean;
  icon?: React.ReactNode; // Optional icon to display
  iconAlignment?: 'left' | 'right'; // Alignment for the icon
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>; // Native input props like maxLength
  size?: 'small' | 'medium';
  sx?: Record<string, unknown>;
  InputProps?: Record<string, unknown>;
  InputLabelProps?: Record<string, unknown>;
}

const TextField: React.FC<DSTextFieldProps> = ({
  variant = 'outlined',
  helperText,
  errorText,
  error,
  className,
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  disabled,
  required,
  type,
  multiline,
  rows,
  minRows: minRowsProp,
  maxRows: maxRowsProp,
  fullWidth = true,
  icon,
  iconAlignment = 'left', // Default alignment to left
  inputProps,
  size,
  sx,
  InputProps: externalInputProps,
  InputLabelProps,
  ...rest
}) => {
  const { cx, classes } = useStyles();

  const iconAdornments: Record<string, unknown> = {};
  if (icon && iconAlignment === 'left') {
    iconAdornments.startAdornment = <InputAdornment position='start'>{icon}</InputAdornment>;
  }
  if (icon && iconAlignment === 'right') {
    iconAdornments.endAdornment = <InputAdornment position='end'>{icon}</InputAdornment>;
  }

  // Top-align the adornment when the field is multiline so the icon sits at the first line
  const mergedInputProps = {
    ...iconAdornments,
    ...(multiline && icon ? { sx: { alignItems: 'flex-start' } } : {}),
    ...externalInputProps,
  };

  // Auto-stretch: when multiline is true and rows is not explicitly set, use minRows/maxRows
  const minRows = rows ? undefined : (minRowsProp ?? (multiline ? 2 : undefined));
  const maxRows = rows ? undefined : (maxRowsProp ?? (multiline ? 10 : undefined));

  return (
    <MUITextField
      variant={variant}
      error={error || Boolean(errorText)}
      helperText={errorText || helperText}
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
      disabled={disabled}
      required={required}
      type={type}
      multiline={multiline}
      rows={rows}
      minRows={minRows}
      maxRows={maxRows}
      fullWidth={fullWidth}
      size={size}
      className={cx(classes.root, className)}
      inputProps={inputProps}
      InputProps={mergedInputProps}
      InputLabelProps={InputLabelProps as any}
      sx={sx}
      {...rest}
    />
  );
};

export default TextField;
