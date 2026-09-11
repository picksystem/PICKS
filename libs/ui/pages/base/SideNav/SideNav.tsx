import { Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton, Box } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import { Link, useLocation } from 'react-router-dom';
import { useStyles } from './styles';
import { useMenuItems } from './components/MenuItems';
import { Tooltip } from '../../../components';
import { useCollapse, useAppRole } from '@serviceops/hooks';

const SideNav = () => {
  const { cx, classes } = useStyles();
  const role = useAppRole();
  const menuItems = useMenuItems(role);
  const { collapsed, toggleCollapse, pinned, pin, unpin } = useCollapse();
  const location = useLocation();

  return (
    <Drawer
      variant='permanent'
      className={cx(classes.drawer, collapsed ? classes.drawerCollapsed : '')}
    >
      <Box className={collapsed ? classes.toggleButtonCenter : classes.toggleButtonRight}>
        {!collapsed && (
          <Tooltip title={pinned ? 'Unpin sidebar' : 'Pin sidebar'} placement='right' arrow>
            <IconButton
              onClick={pinned ? unpin : pin}
              className={cx(pinned ? classes.pinIconActive : '')}
            >
              {pinned ? (
                <PushPinIcon className={classes.pinIcon} />
              ) : (
                <PushPinOutlinedIcon className={classes.pinIconOutlined} />
              )}
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title={collapsed ? 'Open sidebar' : 'Close sidebar'} placement='right' arrow>
          <IconButton onClick={toggleCollapse}>
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      <Box
        display='flex'
        justifyContent='center'
        sx={{
          overflowY: 'auto',
          overflowX: 'hidden',
          flex: 1,
          // Thin, themed scrollbar
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 4,
          },
          '&::-webkit-scrollbar-thumb:hover': { background: 'rgba(255,255,255,0.35)' },
        }}
      >
        <List sx={{ padding: 0 }}>
          {menuItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(`${item.path}/`));
            return (
              <Tooltip key={item.label} title={collapsed ? item.label : ''} placement='right' arrow>
                <Box>
                  <ListItem
                    component={item.path ? Link : 'div'}
                    to={item.path || ''}
                    className={cx(classes.listItem, isActive ? classes.activeItem : '')}
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
