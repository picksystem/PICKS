import { Menu as MUIMenu } from '@mui/material';
import { useStyles } from './styles';
import { DSMenuProps } from './uti';

const Menu: React.FC<DSMenuProps> = ({ className, ...props }) => {
  const { cx, classes } = useStyles();
  return <MUIMenu className={cx(classes.root, className)} {...props} />;
};

export default Menu;
