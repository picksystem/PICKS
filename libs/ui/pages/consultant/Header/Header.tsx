import { useState } from 'react';
import {
  AppBar,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Chip,
  Backdrop,
  CircularProgress,
  Typography as MuiTypography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useStyles } from './styles';
import { Box, TextField, Typography, Tooltip } from '@serviceops/component';
import { constants } from '@serviceops/utils';
import { useAuth } from '@serviceops/hooks';
import SearchIcon from '@mui/icons-material/Search';
import AddBoxIcon from '@mui/icons-material/AddBox';
import GradeIcon from '@mui/icons-material/Grade';
import TimerIcon from '@mui/icons-material/Timer';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';

const Header = () => {
  const { classes, cx } = useStyles();
  const navigate = useNavigate();
  const { AdminPath, AuthPath, ConsultantPath, UserPath } = constants;
  const { user, isAdmin, isConsultant, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Get user display name
  const userName =
    user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User';

  const handleSettingsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setAnchorEl(null);
  };

  const handleAdminPage = () => {
    handleSettingsClose();
    setLoadingMessage('Switching to Admin Mode...');
    setIsLoading(true);
    setTimeout(() => {
      navigate('/app/admin/dashboard');
      setIsLoading(false);
    }, 1500); // 1.5 second delay
  };

  const handleUserPage = () => {
    handleSettingsClose();
    setLoadingMessage('Switching to User Mode...');
    setIsLoading(true);
    setTimeout(() => {
      navigate(UserPath.DASHBOARD);
      setIsLoading(false);
    }, 1500); // 1.5 second delay
  };

  const handleLogout = () => {
    handleSettingsClose();
    logout();
    navigate(AuthPath.SIGNIN);
  };

  return (
    <AppBar position='fixed' className={classes.headerAppbar}>
      <Toolbar className={classes.headerToolbar}>
        {/* Left side - User Name with Avatar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar className={classes.avatar}>
            {userName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)}
          </Avatar>
          <Typography className={classes.headerTitle}>Welcome, {userName}</Typography>
          <Chip
            icon={<BusinessCenterIcon sx={{ fontSize: 18 }} />}
            label='CONSULTANT MODE'
            size='small'
            sx={{
              backgroundColor: '#9c27b0',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '0.75rem',
              height: '24px',
              marginLeft: 1,
              '& .MuiChip-icon': {
                color: 'white',
              },
            }}
          />
        </Box>

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Right side - TextFields and Icons */}
        <Box className={cx(classes.headerRight, classes.headerFields)}>
          <Tooltip title='Settings' placement='top'>
            <IconButton onClick={handleSettingsOpen} size='small'>
              <SettingsIcon className={classes.icon} />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleSettingsClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            {isAdmin && (
              <MenuItem onClick={handleAdminPage}>
                <ListItemIcon>
                  <AdminPanelSettingsIcon fontSize='small' />
                </ListItemIcon>
                <ListItemText>Admin Page</ListItemText>
              </MenuItem>
            )}
            {(isAdmin || isConsultant) && (
              <MenuItem onClick={handleUserPage}>
                <ListItemIcon>
                  <PersonIcon fontSize='small' />
                </ListItemIcon>
                <ListItemText>User Page</ListItemText>
              </MenuItem>
            )}
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize='small' />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
        open={isLoading}
      >
        <CircularProgress color='inherit' size={60} />
        <MuiTypography variant='h6' sx={{ fontWeight: 'bold' }}>
          {loadingMessage}
        </MuiTypography>
      </Backdrop>
    </AppBar>
  );
};

export default Header;
