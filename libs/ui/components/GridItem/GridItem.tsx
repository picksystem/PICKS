import { Box } from '@mui/material';
import { useStyles } from './styles';

export interface DSGridItemProps {
  children?: React.ReactNode;
  xs?: number | 'auto';
  sm?: number | 'auto';
  md?: number | 'auto';
  lg?: number | 'auto';
  xl?: number | 'auto';
  className?: string;
  order?: number;
  offset?: number;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  style?: React.CSSProperties;
}

const GridItem: React.FC<DSGridItemProps> = ({
  children,
  xs = 12,
  sm,
  md,
  lg,
  xl,
  className,
  order,
  offset,
  onClick,
  style,
  ...rest
}) => {
  const { cx, classes } = useStyles();

  const getWidth = (value?: number | 'auto') => {
    if (!value) return undefined;
    if (value === 'auto') return 'auto';
    return `${(value / 12) * 100}%`;
  };

  return (
    <Box
      className={cx(classes.root, className)}
      onClick={onClick}
      style={style}
      sx={{
        width: {
          xs: getWidth(xs),
          sm: getWidth(sm),
          md: getWidth(md),
          lg: getWidth(lg),
          xl: getWidth(xl),
        },
        order,
        marginLeft: offset ? `${(offset / 12) * 100}%` : undefined,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
};

export default GridItem;
