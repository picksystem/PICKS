import { Chip as MUIChip } from '@mui/material';
import { useStyles } from './styles';

export interface DSChipProps extends React.ComponentProps<typeof MUIChip> {
  className?: string;
}

const Chip: React.FC<DSChipProps> = ({ className, ...props }) => {
  const { cx, classes } = useStyles();
  return <MUIChip className={cx(classes.root, className)} {...props} />;
};

export default Chip;
