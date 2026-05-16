export interface DSTooltipProps {
  title: string | React.ReactNode;
  children: React.ReactElement;
  placement?:
    | 'bottom-end'
    | 'bottom-start'
    | 'bottom'
    | 'left-end'
    | 'left-start'
    | 'left'
    | 'right-end'
    | 'right-start'
    | 'right'
    | 'top-end'
    | 'top-start'
    | 'top';
  arrow?: boolean;
  open?: boolean;
  onOpen?: (event: React.SyntheticEvent) => void;
  onClose?: (event: Event | React.SyntheticEvent) => void;
  enterDelay?: number;
  leaveDelay?: number;
  enterNextDelay?: number;
  disableFocusListener?: boolean;
  disableHoverListener?: boolean;
  disableTouchListener?: boolean;
  disableInteractive?: boolean;
  followCursor?: boolean;
  PopperProps?: any;
  TransitionComponent?: React.ComponentType<any>;
  TransitionProps?: any;
}
