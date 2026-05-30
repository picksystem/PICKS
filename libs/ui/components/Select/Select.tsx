import {
  FormControl,
  InputLabel,
  Select as MUISelect,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { useStyles } from './styles';
import { DSSelectProps } from './Select.types';

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
