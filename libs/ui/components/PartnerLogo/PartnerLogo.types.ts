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
