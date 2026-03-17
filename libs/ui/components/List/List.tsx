import { List as MUIList } from '@mui/material';
import { useStyles } from './styles';

export interface DSListProps extends React.ComponentProps<typeof MUIList> {
  className?: string;
}

const List: React.FC<DSListProps> = ({ className, ...props }) => {
  const { cx, classes } = useStyles();
  return <MUIList className={cx(classes.root, className)} {...props} />;
};

export default List;
