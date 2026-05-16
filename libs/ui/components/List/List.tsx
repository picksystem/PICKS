import { List as MUIList } from '@mui/material';
import { useStyles } from './styles';
import { DSListProps } from './util';

const List: React.FC<DSListProps> = ({ className, ...props }) => {
  const { cx, classes } = useStyles();
  return <MUIList className={cx(classes.root, className)} {...props} />;
};

export default List;
