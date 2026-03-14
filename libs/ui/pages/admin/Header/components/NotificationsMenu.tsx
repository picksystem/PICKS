import { Menu, MenuItem, Divider, Avatar, ListItemIcon, ListItemText } from '@mui/material';
import { IAuthUser } from '@picks/interfaces';

interface NotificationsMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onViewAll: () => void;
  notifications: IAuthUser[];
}

const NotificationsMenu = ({
  anchorEl,
  onClose,
  onViewAll,
  notifications,
}: NotificationsMenuProps) => (
  <Menu
    anchorEl={anchorEl}
    open={Boolean(anchorEl)}
    onClose={onClose}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    slotProps={{ paper: { sx: { minWidth: 320, maxHeight: 400 } } }}
  >
    <MenuItem disabled sx={{ opacity: '1 !important' }}>
      <ListItemText
        primary={`Notifications (${notifications.length})`}
        primaryTypographyProps={{ fontWeight: 600 }}
      />
    </MenuItem>
    <Divider />
    {notifications.length > 0 ? (
      notifications.map((u) => (
        <MenuItem key={u.id} onClick={onViewAll}>
          <ListItemIcon>
            <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem' }}>
              {(u.name || `${u.firstName || ''} ${u.lastName || ''}`)
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </Avatar>
          </ListItemIcon>
          <ListItemText
            primary={u.name || `${u.firstName} ${u.lastName}`}
            secondary={`Requested: ${u.requestedRole || 'N/A'} • ${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ''}`}
            primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
            secondaryTypographyProps={{ fontSize: '0.75rem' }}
          />
        </MenuItem>
      ))
    ) : (
      <MenuItem disabled>
        <ListItemText
          primary='No pending requests'
          primaryTypographyProps={{ fontSize: '0.9rem', color: 'text.secondary' }}
        />
      </MenuItem>
    )}
    <Divider />
    <MenuItem onClick={onViewAll}>
      <ListItemText
        primary='View All Access Requests'
        primaryTypographyProps={{
          fontSize: '0.85rem',
          fontWeight: 600,
          color: 'primary.main',
          textAlign: 'center',
        }}
      />
    </MenuItem>
  </Menu>
);

export default NotificationsMenu;
