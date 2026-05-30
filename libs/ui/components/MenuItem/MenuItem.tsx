import { MenuItem as MUIMenuItem } from '@mui/material';
import { useStyles } from './styles';
import { DSMenuItemProps } from './MenuItem.types';

const MenuItem: React.FC<DSMenuItemProps> = ({ className, ...props }) => {
  const { cx, classes } = useStyles();
  return <MUIMenuItem className={cx(classes.root, className)} {...props} />;
};

export default MenuItem;
