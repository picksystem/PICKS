import { Menu as MUIMenu } from '@mui/material';
import { useStyles } from './styles';

export interface DSMenuProps extends React.ComponentProps<typeof MUIMenu> {
  className?: string;
}

const Menu: React.FC<DSMenuProps> = ({ className, ...props }) => {
  const { cx, classes } = useStyles();
  return <MUIMenu className={cx(classes.root, className)} {...props} />;
};

export default Menu;
