import { ReactNode } from 'react';
import { Box } from '@mui/material';
import { useCollapse } from '../../hooks';
import { useStyles } from './styles';

export interface DSMainContentProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  disableGutters?: boolean;
  padding?: number | string;
  margin?: number | string;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  style?: React.CSSProperties;
}

const MainContent = ({
  children,
  className,
  maxWidth = 'lg',
  disableGutters = false,
  padding,
  margin,
  onClick,
  style,
}: DSMainContentProps) => {
  const { cx, classes } = useStyles();
  const { collapsed } = useCollapse();

  return (
    <Box
      component='main'
      className={cx(classes.mainContent, collapsed && classes.mainContentCollapsed, className)}
      sx={{
        padding: disableGutters ? 0 : padding || 2,
        margin: margin || 'auto',
        maxWidth: maxWidth === false ? 'none' : maxWidth ? `${maxWidth}px` : undefined,
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </Box>
  );
};

export default MainContent;
