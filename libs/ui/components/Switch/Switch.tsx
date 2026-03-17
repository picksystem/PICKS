import { Switch as MUISwitch, FormControlLabel, FormHelperText } from '@mui/material';
import { useStyles } from './styles';

export interface DSSwitchProps {
  label?: string | React.ReactNode;
  labelPlacement?: 'end' | 'start' | 'top' | 'bottom';
  helperText?: string;
  className?: string;
  checked?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'default';
  size?: 'small' | 'medium';
}

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
              disabled={disabled}
              required={required}
              color={color}
              size={size}
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
