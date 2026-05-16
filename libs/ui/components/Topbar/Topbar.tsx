import { AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useStyles } from './styles';
import { DSTopbarProps } from './util';

const Topbar: React.FC<DSTopbarProps> = ({
  title,
  logo,
  actions,
  onMenuClick,
  showMenuIcon = true,
  position = 'fixed',
  className,
  color = 'primary',
  elevation = 4,
  variant = 'elevation',
  enableColorOnDark = false,
  sx,
  ...rest
}) => {
  const { cx, classes } = useStyles();

  return (
    <AppBar
      position={position}
      className={cx(classes.root, className)}
      color={color}
      elevation={elevation}
      variant={variant}
      enableColorOnDark={enableColorOnDark}
      sx={sx}
      {...rest}
    >
      <Toolbar className={classes.toolbar}>
        <div className={classes.leftSection}>
          {showMenuIcon && onMenuClick && (
            <IconButton edge='start' color='inherit' aria-label='menu' onClick={onMenuClick}>
              <MenuIcon />
            </IconButton>
          )}
          {logo}
          {title && (
            <Typography className={classes.title} variant='h6' noWrap>
              {title}
            </Typography>
          )}
        </div>
        {actions && <div className={classes.actions}>{actions}</div>}
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
