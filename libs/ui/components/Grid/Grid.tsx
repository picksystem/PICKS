import { Grid as MUIGrid } from '@mui/material';
import { useStyles } from './styles';

export interface DSGridProps extends React.ComponentProps<typeof MUIGrid> {
  className?: string;
}

const Grid: React.FC<DSGridProps> = ({ className, ...props }) => {
  const { cx, classes } = useStyles();
  return <MUIGrid className={cx(classes.root, className)} {...props} />;
};

export default Grid;
