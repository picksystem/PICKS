import { Switch as MUISwitch, FormControlLabel, FormHelperText } from '@mui/material';
import { useStyles } from './styles';

export interface DSToggleProps {
  label?: string;
  labelPlacement?: 'start' | 'end' | 'top' | 'bottom';
  helperText?: string;
  className?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  required?: boolean;
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'default';
  size?: 'small' | 'medium';
  onChange?: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  onFocus?: (event: React.FocusEvent<HTMLElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLElement>) => void;
  value?: any;
  name?: string;
  id?: string;
}

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
