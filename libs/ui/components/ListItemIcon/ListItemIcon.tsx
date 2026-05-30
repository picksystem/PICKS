import { ListItemIcon as MUIListItemIcon } from '@mui/material';
import { useStyles } from './styles';
import { DSListItemIconProps } from './ListItemIcon.types';

const ListItemIcon: React.FC<DSListItemIconProps> = ({ className, ...props }) => {
  const { cx, classes } = useStyles();
  return <MUIListItemIcon className={cx(classes.root, className)} {...props} />;
};

export default ListItemIcon;
