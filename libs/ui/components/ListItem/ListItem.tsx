import { ListItem as MUIListItem } from '@mui/material';
import { useStyles } from './styles';
import { DSListItemProps } from './uti';

const ListItem: React.FC<DSListItemProps> = ({ className, ...props }) => {
  const { cx, classes } = useStyles();
  return <MUIListItem className={cx(classes.root, className)} {...props} />;
};

export default ListItem;
