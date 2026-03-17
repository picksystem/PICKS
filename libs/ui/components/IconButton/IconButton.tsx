import { IconButton as MUIIconButton } from '@mui/material';
import { useStyles } from './styles';

export interface DSIconButtonProps extends React.ComponentProps<typeof MUIIconButton> {
  className?: string;
}

const IconButton: React.FC<DSIconButtonProps> = ({ className, ...props }) => {
  const { cx, classes } = useStyles();
  return <MUIIconButton className={cx(classes.root, className)} {...props} />;
};

export default IconButton;
