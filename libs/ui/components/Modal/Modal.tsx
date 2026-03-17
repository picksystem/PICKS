import { Modal as MUIModal, Fade, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useStyles } from './styles';

export interface DSModalProps {
  open: boolean;
  onClose?: (event: {}, reason: 'backdropClick' | 'escapeKeyDown') => void;
  title?: string | React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showCloseIcon?: boolean;
  className?: string;
  disableBackdropClick?: boolean;
  disableEscapeKeyDown?: boolean;
  keepMounted?: boolean;
}

const Modal: React.FC<DSModalProps> = ({
  open,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'sm',
  showCloseIcon = true,
  className,
  disableBackdropClick = false,
  disableEscapeKeyDown = false,
  keepMounted = false,
  ...rest
}) => {
  const { cx, classes } = useStyles();

  const widthMap = {
    xs: 400,
    sm: 600,
    md: 800,
    lg: 1000,
    xl: 1200,
  };

  const handleClose = (event: {}, reason: 'backdropClick' | 'escapeKeyDown') => {
    if (
      (disableBackdropClick && reason === 'backdropClick') ||
      (disableEscapeKeyDown && reason === 'escapeKeyDown')
    ) {
      return;
    }
    onClose?.(event, reason);
  };

  return (
    <MUIModal
      open={open}
      onClose={handleClose} // Use `handleClose` to manage custom behavior
      className={cx(classes.modal, className)}
      closeAfterTransition
      keepMounted={keepMounted}
      {...rest} // Spread additional props
    >
      <Fade in={open}>
        <Box
          className={classes.paper}
          sx={{ width: { xs: '100%', sm: `${widthMap[maxWidth]}px` }, maxWidth: { xs: '100%', sm: '90%' } }}
        >
          {title && (
            <Box className={classes.header}>
              <Box component='h2' className={classes.title}>
                {title}
              </Box>
              {showCloseIcon && (
                <Box
                  component='button'
                  className={classes.closeButton}
                  onClick={() => onClose?.({}, 'escapeKeyDown')}
                  aria-label='close'
                >
                  <CloseIcon />
                </Box>
              )}
            </Box>
          )}

          <Box className={classes.content}>{children}</Box>

          {footer && <Box className={classes.footer}>{footer}</Box>}
        </Box>
      </Fade>
    </MUIModal>
  );
};

export default Modal;
