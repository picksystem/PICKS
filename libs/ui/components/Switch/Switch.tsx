import { Switch as MUISwitch, FormControlLabel, FormHelperText } from '@mui/material';
import { useStyles } from './styles';
import { DSSwitchProps } from './util';

const Switch: React.FC<DSSwitchProps> = ({
  label,
  labelPlacement = 'end',
  helperText,
  className,
  checked,
  onChange,
  disabled,
  required,
  color = 'primary',
  size = 'medium',
  sx,
  onClick,
  name,
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
              onChange={onChange}
              onClick={onClick}
              disabled={disabled}
              required={required}
              color={color}
              size={size}
              sx={sx}
              name={name}
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

export default Switch;
