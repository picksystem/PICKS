import { CircularProgress, Box, LinearProgress } from '@mui/material';
import { useStyles } from './styles';

export interface DSLoaderProps {
  size?: number | string;
  thickness?: number;
  color?: 'primary' | 'secondary' | 'inherit' | 'error' | 'info' | 'success' | 'warning';
  text?: string;
  fullScreen?: boolean;
  className?: string;
  variant?: 'circular' | 'linear';
  value?: number;
  sx?: any;
  overlay?: boolean;
  overlayColor?: string;
}

const Loader: React.FC<DSLoaderProps> = ({
  size = 40,
  thickness = 4,
  color = 'primary',
  text,
  fullScreen = false,
  className,
  variant = 'circular',
  value,
  sx,
  overlay = false,
  overlayColor = 'rgba(255, 255, 255, 0.8)',
  ...rest
}) => {
  const { cx, classes } = useStyles();

  const loader =
    variant === 'circular' ? (
      <CircularProgress size={size} thickness={thickness} color={color} {...rest} />
    ) : (
      <LinearProgress
        variant={value !== undefined ? 'determinate' : 'indeterminate'}
        value={value}
        color={color}
        sx={{ width: '100%', ...sx }}
        {...rest}
      />
    );

  if (overlay) {
    return (
      <Box className={cx(classes.overlay, className)} style={{ backgroundColor: overlayColor }}>
        <Box className={classes.overlayContent}>
          {loader}
          {text && <Box className={classes.text}>{text}</Box>}
        </Box>
      </Box>
    );
  }

  return (
    <Box className={cx(classes.root, fullScreen && classes.fullScreen, className)} sx={sx}>
      {loader}
      {text && <Box className={classes.text}>{text}</Box>}
    </Box>
  );
};

export default Loader;
