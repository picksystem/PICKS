import {
  RadioGroup as MUIRadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  FormControl,
  FormHelperText,
} from '@mui/material';
import { useStyles } from './styles';

export interface DSRadioOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface DSRadioGroupProps {
  options: DSRadioOption[];
  label?: string;
  helperText?: string;
  className?: string;
  value?: string | number;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>, value: string) => void;
  disabled?: boolean;
  required?: boolean;
  row?: boolean;
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'default';
  size?: 'small' | 'medium';
}

const RadioGroup: React.FC<DSRadioGroupProps> = ({
  options,
  label,
  helperText,
  className,
  value,
  onChange,
  disabled,
  required,
  row = false,
  color = 'primary',
  size = 'medium',
  ...rest
}) => {
  const { cx, classes } = useStyles();

  return (
    <FormControl className={cx(classes.root, className)}>
      {label && <FormLabel className={classes.label}>{label}</FormLabel>}
      <MUIRadioGroup
        className={classes.group}
        value={value}
        onChange={onChange}
        row={row}
        {...rest}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={
              <Radio
                disabled={disabled || option.disabled}
                required={required}
                color={color}
                size={size}
              />
            }
            label={option.label}
          />
        ))}
      </MUIRadioGroup>
      {helperText && <FormHelperText className={classes.helperText}>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default RadioGroup;
