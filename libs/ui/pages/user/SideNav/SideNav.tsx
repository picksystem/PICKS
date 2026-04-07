import { Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton, Box } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { Link, useLocation } from 'react-router-dom';
import { useStyles } from './styles';
import { useMenuItems } from './MenuItems';
import { Tooltip } from '@serviceops/component';
import { useCollapse } from '@serviceops/hooks';

const SideNav = () => {
  const { cx, classes } = useStyles();
  const menuItems = useMenuItems();
  const { collapsed, toggleCollapse } = useCollapse();
  const location = useLocation();

  return (
    <Drawer
      variant='permanent'
      className={cx(classes.drawer, collapsed && classes.drawerCollapsed)}
    >
      <Box className={collapsed ? classes.toggleButtonCenter : classes.toggleButtonRight}>
        <Tooltip title={collapsed ? 'Open sidebar' : 'Close sidebar'} placement='right' arrow>
          <IconButton onClick={toggleCollapse}>
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      <Box display='flex' justifyContent='center'>
        <List sx={{ padding: 0 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Tooltip key={item.label} title={collapsed ? item.label : ''} placement='right' arrow>
                <Box>
                  <ListItem
                    component={item.path ? Link : 'div'}
                    to={item.path || ''}
                    className={cx(classes.listItem, isActive && classes.activeItem)}
                  >
                    <ListItemIcon
                      className={cx(
                        classes.icon,
                        collapsed ? classes.iconMarginCollapsed : classes.iconMarginExpanded,
                      )}
                    >
                      {item.icon}
                    </ListItemIcon>

                    {!collapsed && <ListItemText primary={item.label} className={classes.text} />}
                  </ListItem>
                </Box>
              </Tooltip>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
};

export default SideNav;
