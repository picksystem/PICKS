import { Checkbox as MUICheckbox, FormControlLabel, FormHelperText, Box } from '@mui/material';
import { useStyles } from './styles';

export interface DSCheckboxProps {
  label?: string | React.ReactNode;
  helperText?: string;
  className?: string;
  checked?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  indeterminate?: boolean;
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'default';
  size?: 'small' | 'medium';
  sx?: Record<string, unknown>;
}

const Checkbox: React.FC<DSCheckboxProps> = ({
  label,
  helperText,
  className,
  checked,
  onChange,
  disabled,
  required,
  indeterminate,
  color = 'primary',
  size = 'medium',
  sx,
  ...rest
}) => {
  const { cx, classes } = useStyles();

  return (
    <Box className={cx(classes.root, className)}>
      <Box>
        <FormControlLabel
          control={
            <MUICheckbox
              checked={checked}
              onChange={onChange}
              disabled={disabled}
              required={required}
              indeterminate={indeterminate}
              color={color}
              size={size}
              sx={sx}
              {...rest}
            />
          }
          label={label || ''}
          className={classes.formControl}
        />
        {helperText && <FormHelperText className={classes.helperText}>{helperText}</FormHelperText>}
      </Box>
    </Box>
  );
};

export default Checkbox;
