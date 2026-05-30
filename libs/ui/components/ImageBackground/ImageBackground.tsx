import { Box } from '@mui/material';
import { useStyles } from './styles';
import { DSImageBackgroundProps } from './ImageBackground.types';

const ImageBackground: React.FC<DSImageBackgroundProps> = ({
  src,
  alt,
  children,
  overlay = false,
  overlayOpacity = 0.5,
  overlayColor = 'rgba(0, 0, 0, ${overlayOpacity})',
  height = 400,
  width,
  backgroundPosition = 'center',
  backgroundSize = 'cover',
  backgroundRepeat = 'no-repeat',
  className,
  onClick,
  onLoad,
  onError,
  ...rest
}) => {
  const { cx, classes } = useStyles();

  return (
    <Box
      className={cx(classes.root, className)}
      onClick={onClick}
      sx={{
        backgroundImage: `url(${src})`,
        height,
        width,
        backgroundPosition,
        backgroundSize,
        backgroundRepeat,
      }}
      role='img'
      aria-label={alt}
      {...rest}
    >
      {overlay && (
        <div
          className={classes.overlay}
          style={{
            backgroundColor: overlayColor.replace('${overlayOpacity}', overlayOpacity.toString()),
          }}
        />
      )}
      <div className={classes.content}>{children}</div>
    </Box>
  );
};

export default ImageBackground;
