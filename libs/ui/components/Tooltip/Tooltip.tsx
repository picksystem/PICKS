import { Tooltip as MUITooltip } from '@mui/material';
import { useStyles } from './styles';
import { DSTooltipProps } from './util';

const Tooltip: React.FC<DSTooltipProps> = ({
  title,
  children,
  placement = 'top',
  arrow = true,
  open,
  onOpen,
  onClose,
  enterDelay = 100,
  leaveDelay = 0,
  enterNextDelay = 0,
  disableFocusListener = false,
  disableHoverListener = false,
  disableTouchListener = false,
  disableInteractive = false,
  followCursor = false,
  PopperProps,
  TransitionComponent,
  TransitionProps,
  ...rest
}) => {
  const { classes } = useStyles();

  return (
    <MUITooltip
      title={title}
      placement={placement}
      arrow={arrow}
      open={open}
      onOpen={onOpen}
      onClose={onClose}
      enterDelay={enterDelay}
      leaveDelay={leaveDelay}
      enterNextDelay={enterNextDelay}
      disableFocusListener={disableFocusListener}
      disableHoverListener={disableHoverListener}
      disableTouchListener={disableTouchListener}
      disableInteractive={disableInteractive}
      followCursor={followCursor}
      PopperProps={PopperProps}
      TransitionComponent={TransitionComponent}
      TransitionProps={TransitionProps}
      slotProps={{
        tooltip: { className: classes.tooltip },
        arrow: { className: classes.arrow },
      }}
      {...rest}
    >
      {children}
    </MUITooltip>
  );
};

export default Tooltip;
