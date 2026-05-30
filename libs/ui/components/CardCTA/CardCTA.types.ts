export interface DSCardCTAProps {
  title: string;
  description?: string;
  buttonText: string;
  onButtonClick: () => void;
  image?: string;
  imageAlt?: string;
  className?: string;
  variant?: 'elevation' | 'outlined';
  elevation?: number;
  buttonVariant?: 'text' | 'outlined' | 'contained';
  buttonColor?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  disabled?: boolean;
  onCardClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}
