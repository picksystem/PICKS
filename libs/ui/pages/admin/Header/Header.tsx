import {
  AppBar,
  Avatar,
  Badge,
  Backdrop,
  CircularProgress,
  Chip,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { Box } from '@picks/component';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AddBoxIcon from '@mui/icons-material/AddBox';
import TimerIcon from '@mui/icons-material/Timer';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useStyles } from './styles';
import { useHeader } from './hooks/useHeader';
import LogoMark from './components/LogoMark';
import SearchBar from './components/SearchBar';
import NotificationsMenu from './components/NotificationsMenu';
import UserMenu from './components/UserMenu';

const iconBtnSx = {
  color: 'white',
  '&:hover': { background: 'rgba(255,255,255,0.15)', transform: 'scale(1.08)' },
  transition: 'background 0.15s, transform 0.15s',
};

const Header = () => {
  const { classes } = useStyles();
  const {
    user,
    isAdmin,
    userName,
    anchorEl,
    notifAnchorEl,
    notifications,
    isLoading,
    loadingMessage,
    ticketSearch,
    showSearchResults,
    filteredIncidents,
    handleTicketSearchChange,
    handleSelectIncident,
    handleCloseSearchResults,
    handleSettingsOpen,
    handleSettingsClose,
    handleNotifOpen,
    handleNotifClose,
    handleNotifClick,
    handleLogout,
    handleProfile,
    handleUserPage,
    handleConsultantPage,
    handleLogoClick,
    handleCreateTicket,
  } = useHeader();

  return (
    <AppBar position='fixed' className={classes.headerAppbar}>
      {/* Mobile logo bar — visible only on xs/sm */}
      <Box className={classes.mobileLogoBar}>
        <LogoMark compact />
      </Box>

      {/* Main toolbar */}
      <Toolbar className={classes.headerToolbar}>
        {/* Logo — desktop only */}
        <Box className={classes.desktopLogoArea} onClick={handleLogoClick}>
          <LogoMark />
        </Box>

        <Box className={classes.logoDivider} />

        {/* Left: Avatar + Welcome + ADMIN chip + Notifications bell */}
        <Box className={classes.headerLeft}>
          <Avatar className={classes.avatar} src={user?.profilePicture || undefined}>
            {!user?.profilePicture &&
              userName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
          </Avatar>

          <Box className={classes.welcomeText}>
            <Typography className={classes.headerTitle}>
              Welcome,&nbsp;<strong>{userName}</strong>
            </Typography>
          </Box>

          <Chip
            className={classes.adminChip}
            icon={<AdminPanelSettingsIcon sx={{ fontSize: 15 }} />}
            label='ADMIN'
            size='small'
          />

          <Tooltip title='Notifications' placement='bottom'>
            <IconButton onClick={handleNotifOpen} size='small' sx={iconBtnSx}>
              <Badge badgeContent={notifications.length} color='error'>
                <NotificationsIcon sx={{ fontSize: '1.25rem' }} />
              </Badge>
            </IconButton>
          </Tooltip>
        </Box>

        <NotificationsMenu
          anchorEl={notifAnchorEl}
          onClose={handleNotifClose}
          onViewAll={handleNotifClick}
          notifications={notifications}
        />

        {/* Center: mobile search bar */}
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', minWidth: 0 }}>
          <Box className={classes.mobileSearch}>
            <SearchBar
              value={ticketSearch}
              onChange={handleTicketSearchChange}
              onClickAway={handleCloseSearchResults}
              showResults={showSearchResults}
              incidents={filteredIncidents}
              onSelectIncident={handleSelectIncident}
              className={classes.mobileSearchField}
              wrapperClassName={classes.ticketSearchWrapper}
              dropdownClassName={classes.searchDropdown}
              noResultsClassName={classes.searchNoResults}
            />
          </Box>
        </Box>

        {/* Right: desktop search + action icons */}
        <Box className={classes.headerRight}>
          <Box className={classes.headerFields}>
            <SearchBar
              value={ticketSearch}
              onChange={handleTicketSearchChange}
              onClickAway={handleCloseSearchResults}
              showResults={showSearchResults}
              incidents={filteredIncidents}
              onSelectIncident={handleSelectIncident}
              className={classes.textField}
              wrapperClassName={classes.ticketSearchWrapper}
              dropdownClassName={classes.searchDropdown}
              noResultsClassName={classes.searchNoResults}
            />
          </Box>

          <Tooltip title='Create Ticket' placement='bottom'>
            <IconButton size='small' sx={iconBtnSx} onClick={handleCreateTicket}>
              <AddBoxIcon className={classes.icon} />
            </IconButton>
          </Tooltip>

          <Tooltip title='Timer' placement='bottom'>
            <IconButton
              size='small'
              sx={{ ...iconBtnSx, display: { xs: 'none', sm: 'inline-flex' } }}
            >
              <TimerIcon className={classes.icon} />
            </IconButton>
          </Tooltip>

          <Tooltip title='Settings' placement='bottom'>
            <IconButton size='small' sx={iconBtnSx} onClick={handleSettingsOpen}>
              <SettingsIcon className={classes.icon} />
            </IconButton>
          </Tooltip>

          <UserMenu
            anchorEl={anchorEl}
            onClose={handleSettingsClose}
            onProfile={handleProfile}
            onUserPage={handleUserPage}
            onConsultantPage={handleConsultantPage}
            onLogout={handleLogout}
            isAdmin={isAdmin}
          />
        </Box>
      </Toolbar>

      {/* Mode-switch loading overlay */}
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          flexDirection: 'column',
          gap: 2,
        }}
        open={isLoading}
      >
        <CircularProgress color='inherit' size={60} />
        <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
          {loadingMessage}
        </Typography>
      </Backdrop>
    </AppBar>
  );
};

export default Header;
