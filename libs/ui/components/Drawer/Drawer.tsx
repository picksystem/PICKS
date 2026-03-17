import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import { useStyles } from './styles';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  anchor?: 'left' | 'right' | 'top' | 'bottom';
  className?: string;
}

const Drawer: React.FC<DrawerProps> = ({ open, onClose, children, anchor = 'left', className }) => {
  const { cx, classes } = useStyles();

  return (
    <MuiDrawer
      anchor={anchor}
      open={open}
      onClose={onClose}
      className={cx(classes.root, className)}
      classes={{ paper: classes.paper }}
      ModalProps={{ keepMounted: true }}
    >
      <div className={classes.header}>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </div>

      <div className={classes.content}>{children}</div>
    </MuiDrawer>
  );
};

export default Drawer;
