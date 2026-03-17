import { Typography as MUITypography } from '@mui/material';
import { useStyles } from './styles';

export interface HeadingProps {
  text?: string;
  children?: React.ReactNode;
  className?: string;
  variant?:
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'subtitle1'
    | 'subtitle2'
    | 'body1'
    | 'body2'
    | 'caption'
    | 'button'
    | 'overline';
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify';
  color?:
    | 'initial'
    | 'inherit'
    | 'primary'
    | 'secondary'
    | 'textPrimary'
    | 'textSecondary'
    | 'error'
    | (string & {});
  noWrap?: boolean;
  gutterBottom?: boolean;
  paragraph?: boolean;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  sx?: Record<string, unknown>;
  fontWeight?: number | string;
}

const Typography: React.FC<HeadingProps> = ({
  text,
  children,
  className,
  variant = 'body1',
  align = 'inherit',
  color = 'initial',
  noWrap = false,
  gutterBottom = false,
  paragraph = false,
  onClick,
  sx,
  fontWeight,
  ...props
}) => {
  const { cx, classes } = useStyles();

  const combinedSx = fontWeight ? { fontWeight, ...sx } : sx;

  return (
    <MUITypography
      variant={variant}
      align={align}
      color={color as any}
      noWrap={noWrap}
      gutterBottom={gutterBottom}
      paragraph={paragraph}
      onClick={onClick}
      className={cx(classes.root, className)}
      sx={combinedSx}
      {...props}
    >
      {text || children}
    </MUITypography>
  );
};

export default Typography;
