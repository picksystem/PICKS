import { FormControlLabel as MUIFormControlLabel } from '@mui/material';
import { useStyles } from './styles';
import { DSFormControlLabelProps } from './util';

const FormControlLabel: React.FC<DSFormControlLabelProps> = ({
  label,
  control,
  className,
  checked,
  disabled = false,
  labelPlacement = 'end',
  onChange,
  value,
  sx,
  ...rest
}) => {
  const { cx, classes } = useStyles();

  return (
    <MUIFormControlLabel
      label={label}
      control={control}
      className={cx(classes.root, className)}
      checked={checked}
      disabled={disabled}
      labelPlacement={labelPlacement}
      onChange={onChange}
      value={value}
      sx={sx}
      {...rest}
    />
  );
};

export default FormControlLabel;
