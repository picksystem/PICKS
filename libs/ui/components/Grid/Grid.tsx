import { Grid as MUIGrid } from '@mui/material';
import { useStyles } from './styles';
import { DSGridProps } from './util';

const Grid: React.FC<DSGridProps> = ({ className, ...props }) => {
  const { cx, classes } = useStyles();
  return <MUIGrid className={cx(classes.root, className)} {...props} />;
};

export default Grid;
