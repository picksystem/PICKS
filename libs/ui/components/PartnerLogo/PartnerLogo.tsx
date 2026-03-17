import React from 'react';
import { Box } from '@mui/material';
import { useStyles } from './styles';

export interface DSPartnerLogoProps {
  src: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  className?: string;
  variant?: 'default' | 'rounded' | 'circular';
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  fallbackSrc?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

const PartnerLogo: React.FC<DSPartnerLogoProps> = ({
  src,
  alt,
  width = 150,
  height = 80,
  onClick,
  className,
  variant = 'default',
  objectFit = 'contain',
  fallbackSrc,
  loading = 'lazy',
  onLoad,
  onError,
  ...rest
}) => {
  const { cx, classes } = useStyles();

  const [imageSrc, setImageSrc] = React.useState(src);
  const [hasError, setHasError] = React.useState(false);

  const handleError = () => {
    if (fallbackSrc && !hasError) {
      setImageSrc(fallbackSrc);
      setHasError(true);
    }
    onError?.();
  };

  const variantClass = {
    default: '',
    rounded: classes.rounded,
    circular: classes.circular,
  };

  return (
    <Box
      className={cx(classes.root, variantClass[variant], className)}
      onClick={onClick}
      sx={{ width, height }}
      {...rest}
    >
      <img
        src={imageSrc}
        alt={alt}
        className={classes.image}
        style={{
          maxHeight: height,
          objectFit,
          width: '100%',
          height: '100%',
        }}
        loading={loading}
        onLoad={onLoad}
        onError={handleError}
      />
    </Box>
  );
};

export default PartnerLogo;
