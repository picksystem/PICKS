import { Switch as MUISwitch, FormControlLabel, FormHelperText } from '@mui/material';
import { useStyles } from './styles';
import { DSToggleProps } from './Toggle.types';

const Toggle: React.FC<DSToggleProps> = ({
  label,
  labelPlacement = 'end',
  helperText,
  className,
  checked,
  defaultChecked,
  disabled = false,
  required = false,
  color = 'primary',
  size = 'medium',
  onChange,
  onFocus,
  onBlur,
  value,
  name,
  id,
  ...rest
}) => {
  const { cx, classes } = useStyles();

  return (
    <div className={cx(classes.root, className)}>
      <div>
        <FormControlLabel
          control={
            <MUISwitch
              checked={checked}
              defaultChecked={defaultChecked}
              disabled={disabled}
              required={required}
              color={color}
              size={size}
              onChange={onChange}
              onFocus={onFocus}
              onBlur={onBlur}
              value={value}
              name={name}
              id={id}
              {...rest}
            />
          }
          label={label || ''}
          labelPlacement={labelPlacement}
          className={classes.formControl}
        />
        {helperText && <FormHelperText className={classes.helperText}>{helperText}</FormHelperText>}
      </div>
    </div>
  );
};

export default Toggle;
