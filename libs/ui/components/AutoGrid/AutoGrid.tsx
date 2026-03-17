import { Children, type FC } from 'react';
import { Grid, Box } from '@mui/material';
import { useStyles } from './styles';

export interface DSAutoGridProps {
  children: React.ReactNode;
  columns?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
  spacing?: number;
  minWidth?: number | string;
  className?: string;
  justifyContent?:
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

const AutoGrid: FC<DSAutoGridProps> = ({
  children,
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  spacing = 2,
  minWidth = 250,
  className,
  justifyContent = 'flex-start',
  alignItems = 'stretch',
  direction = 'row',
  onClick,
  ...rest
}) => {
  const { cx, classes } = useStyles();

  const getColumnSize = (breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl') => {
    if (typeof columns === 'number') {
      return 12 / columns;
    }
    const cols = columns[breakpoint] || 1;
    return 12 / cols;
  };

  return (
    <Grid
      container
      spacing={spacing}
      className={cx(classes.root, className)}
      justifyContent={justifyContent}
      alignItems={alignItems}
      direction={direction}
      onClick={onClick}
      {...rest}
    >
      {Children.map(children, (child) => (
        <Box
          sx={{
            width: {
              xs: `${(getColumnSize('xs') / 12) * 100}%`,
              sm: `${(getColumnSize('sm') / 12) * 100}%`,
              md: `${(getColumnSize('md') / 12) * 100}%`,
              lg: `${(getColumnSize('lg') / 12) * 100}%`,
              xl: `${(getColumnSize('xl') / 12) * 100}%`,
            },
            minWidth,
            padding: spacing / 2,
          }}
        >
          {child}
        </Box>
      ))}
    </Grid>
  );
};

export default AutoGrid;
