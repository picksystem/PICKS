import {
  FormControl,
  InputLabel,
  Select as MUISelect,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { useStyles } from './styles';

export interface DSSelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface DSSelectProps extends Omit<React.ComponentProps<typeof MUISelect>, 'children'> {
  options?: DSSelectOption[];
  label?: string;
  variant?: 'outlined' | 'filled' | 'standard';
  helperText?: React.ReactNode;
  errorText?: React.ReactNode;
  error?: boolean;
  fullWidth?: boolean;
  className?: string;
  value?: string | number | (string | number)[];
  onChange?: (event: any) => void;
  onBlur?: (event: any) => void;
  onFocus?: (event: any) => void;
  disabled?: boolean;
  required?: boolean;
  multiple?: boolean;
  placeholder?: string;
  size?: 'small' | 'medium';
  children?: React.ReactNode;
  renderValue?: (value: any) => React.ReactNode;
  MenuProps?: Record<string, unknown>;
  notched?: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;
}

const Select: React.FC<DSSelectProps> = ({
  options,
  label,
  variant = 'outlined',
  helperText,
  errorText,
  error,
  fullWidth = true,
  className,
  value,
  onChange,
  onBlur,
  onFocus,
  disabled,
  required,
  multiple,
  placeholder,
  size = 'medium',
  children,
  renderValue,
  MenuProps,
  notched,
  inputRef,
  ...rest
}) => {
  const { cx, classes } = useStyles();

  return (
    <FormControl
      variant={variant}
      fullWidth={fullWidth}
      error={error || Boolean(errorText)}
      required={required}
      className={cx(classes.root, className)}
    >
      {label && <InputLabel>{label}</InputLabel>}
      <MUISelect
        label={label}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        disabled={disabled}
        required={required}
        multiple={multiple}
        displayEmpty={Boolean(placeholder)}
        size={size}
        renderValue={renderValue}
        MenuProps={MenuProps}
        notched={notched}
        inputRef={inputRef}
        {...rest}
      >
        {children ??
          (placeholder ? (
            <MenuItem value='' disabled>
              {placeholder}
            </MenuItem>
          ) : null)}
        {options?.map((option) => (
          <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </MenuItem>
        ))}
      </MUISelect>
      {(helperText || errorText) && <FormHelperText>{errorText || helperText}</FormHelperText>}
    </FormControl>
  );
};

export default Select;
