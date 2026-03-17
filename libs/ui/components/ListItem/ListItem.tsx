import { ListItem as MUIListItem } from '@mui/material';
import { useStyles } from './styles';

export interface DSListItemProps extends React.ComponentProps<typeof MUIListItem> {
  className?: string;
}

const ListItem: React.FC<DSListItemProps> = ({ className, ...props }) => {
  const { cx, classes } = useStyles();
  return <MUIListItem className={cx(classes.root, className)} {...props} />;
};

export default ListItem;
