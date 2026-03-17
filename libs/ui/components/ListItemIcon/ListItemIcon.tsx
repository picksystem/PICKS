import { ListItemIcon as MUIListItemIcon } from '@mui/material';
import { useStyles } from './styles';

export interface DSListItemIconProps extends React.ComponentProps<typeof MUIListItemIcon> {
  className?: string;
}

const ListItemIcon: React.FC<DSListItemIconProps> = ({ className, ...props }) => {
  const { cx, classes } = useStyles();
  return <MUIListItemIcon className={cx(classes.root, className)} {...props} />;
};

export default ListItemIcon;
