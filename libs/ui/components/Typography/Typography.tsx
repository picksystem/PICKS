import { Typography as MUITypography } from '@mui/material';
import { useStyles } from './styles';

export interface HeadingProps extends Omit<React.ComponentProps<typeof MUITypography>, 'ref'> {
  text?: string;
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
  fontSize?: string | number;
  fontFamily?: string;
  lineHeight?: string | number;
  display?: string;
  mb?: number | string;
  textAlign?: 'inherit' | 'left' | 'center' | 'right' | 'justify';
  component?: React.ElementType;
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
  fontSize,
  fontFamily,
  lineHeight,
  display,
  mb,
  textAlign,
  component,
  ...props
}) => {
  const { cx, classes } = useStyles();

  const combinedSx: Record<string, unknown> = {
    ...(fontWeight && { fontWeight }),
    ...(fontSize && { fontSize }),
    ...(fontFamily && { fontFamily }),
    ...(lineHeight && { lineHeight }),
    ...(display && { display }),
    ...(mb && { mb }),
    ...(textAlign && { textAlign }),
    ...sx,
  };

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
      {...(component && { component })}
      {...props}
    >
      {text || children}
    </MUITypography>
  );
};

export default Typography;
