import { Box } from '@mui/material';
import { useCollapse } from '../../hooks';
import { useStyles } from './styles';
import { DSMainContentProps } from './MainContent.types';

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
