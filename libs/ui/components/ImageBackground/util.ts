export interface DSImageBackgroundProps {
  src: string;
  alt?: string;
  children?: React.ReactNode;
  overlay?: boolean;
  overlayOpacity?: number;
  overlayColor?: string;
  height?: number | string;
  width?: number | string;
  backgroundPosition?: string;
  backgroundSize?: 'cover' | 'contain' | 'auto' | string;
  backgroundRepeat?: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onLoad?: () => void;
  onError?: () => void;
}
