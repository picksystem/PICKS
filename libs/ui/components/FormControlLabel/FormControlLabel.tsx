import { FormControlLabel as MUIFormControlLabel } from '@mui/material';
import { useStyles } from './styles';

export interface DSFormControlLabelProps {
  label: string | React.ReactNode;
  control: React.ReactElement;
  className?: string;
  checked?: boolean;
  disabled?: boolean;
  labelPlacement?: 'end' | 'start' | 'top' | 'bottom';
  onChange?: (event: React.SyntheticEvent, checked: boolean) => void;
  value?: any;
  sx?: any;
}

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
