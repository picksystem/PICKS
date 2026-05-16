import { Menu, MenuItem, Divider, ListItemIcon, ListItemText, Chip } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PersonIcon from '@mui/icons-material/Person';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import { UserMenuProps } from './util';

const UserMenu = ({
  anchorEl,
  onClose,
  onProfile,
  onUserPage,
  onConsultantPage,
  onAdminPage,
  onLogout,
  currentRole = 'admin',
}: UserMenuProps) => (
  <Menu
    anchorEl={anchorEl}
    open={Boolean(anchorEl)}
    onClose={onClose}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
  >
    <MenuItem onClick={onProfile}>
      <ListItemIcon>
        <AccountCircleIcon fontSize='small' />
      </ListItemIcon>
      <ListItemText>Your Profile</ListItemText>
    </MenuItem>
    <Divider />

    {/* Page switching options - visible to all users */}
    <MenuItem onClick={onAdminPage}>
      <ListItemIcon>
        <AdminPanelSettingsIcon fontSize='small' />
      </ListItemIcon>
      <ListItemText>Admin Page</ListItemText>
      {currentRole === 'admin' && (
        <Chip label='Active' size='small' color='primary' sx={{ ml: 1 }} />
      )}
    </MenuItem>
    <MenuItem onClick={onUserPage}>
      <ListItemIcon>
        <PersonIcon fontSize='small' />
      </ListItemIcon>
      <ListItemText>User Page</ListItemText>
      {currentRole === 'user' && (
        <Chip label='Active' size='small' color='primary' sx={{ ml: 1 }} />
      )}
    </MenuItem>
    <MenuItem onClick={onConsultantPage}>
      <ListItemIcon>
        <BusinessCenterIcon fontSize='small' />
      </ListItemIcon>
      <ListItemText>Consultant Page</ListItemText>
      {currentRole === 'consultant' && (
        <Chip label='Active' size='small' color='primary' sx={{ ml: 1 }} />
      )}
    </MenuItem>

    <Divider />
    <MenuItem onClick={onClose}>
      <ListItemIcon>
        <HelpOutlineIcon fontSize='small' />
      </ListItemIcon>
      <ListItemText>Help & Support</ListItemText>
    </MenuItem>
    <Divider />
    <MenuItem onClick={onLogout}>
      <ListItemIcon>
        <LogoutIcon fontSize='small' />
      </ListItemIcon>
      <ListItemText>Logout</ListItemText>
    </MenuItem>
  </Menu>
);

export default UserMenu;
