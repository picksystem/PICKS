import { IconButton as MUIIconButton } from '@mui/material';
import { useStyles } from './styles';
import { DSIconButtonProps } from './util';

const IconButton: React.FC<DSIconButtonProps> = ({ className, ...props }) => {
  const { cx, classes } = useStyles();
  return <MUIIconButton className={cx(classes.root, className)} {...props} />;
};

export default IconButton;
