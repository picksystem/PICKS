import { Typography as MUITypography, SxProps, Theme } from '@mui/material';

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
  sx?: SxProps<Theme>;
  fontWeight?: number | string;
  fontSize?: string | number;
  fontFamily?: string;
  lineHeight?: string | number;
  display?: string;
  mb?: number | string;
  textAlign?: 'inherit' | 'left' | 'center' | 'right' | 'justify';
  component?: React.ElementType;
}
