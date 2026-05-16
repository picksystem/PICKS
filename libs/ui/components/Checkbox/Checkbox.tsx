import { Checkbox as MUICheckbox, FormControlLabel, FormHelperText, Box } from '@mui/material';
import { useStyles } from './styles';
import { DSCheckboxProps } from './util';

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
