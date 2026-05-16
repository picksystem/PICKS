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
  icon?: React.ReactNode;
  iconAlignment?: 'left' | 'right';
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  size?: 'small' | 'medium';
  sx?: Record<string, unknown>;
  InputProps?: Record<string, unknown>;
  InputLabelProps?: Record<string, unknown>;
  slotProps?: {
    input?: Record<string, unknown>;
    inputLabel?: Record<string, unknown>;
    htmlInput?: Record<string, unknown>;
    root?: Record<string, unknown>;
    formHelperText?: Record<string, unknown>;
  };
  autoFocus?: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;
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
  iconAlignment = 'left',
  inputProps,
  size,
  sx,
  InputProps: externalInputProps,
  InputLabelProps,
  slotProps,
  autoFocus,
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

  const mergedInputProps = {
    ...iconAdornments,
    ...(multiline && icon ? { sx: { alignItems: 'flex-start' } } : {}),
    ...externalInputProps,
    ...slotProps?.input,
  };

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
      slotProps={{
        htmlInput: slotProps?.htmlInput,
        root: slotProps?.root,
        inputLabel: slotProps?.inputLabel,
        formHelperText: slotProps?.formHelperText,
      }}
      autoFocus={autoFocus}
      sx={sx}
      {...rest}
    />
  );
};

export default TextField;
