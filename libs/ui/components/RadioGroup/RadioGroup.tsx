import {
  RadioGroup as MUIRadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  FormControl,
  FormHelperText,
} from '@mui/material';
import { useStyles } from './styles';
import { DSRadioGroupProps } from './util';

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
