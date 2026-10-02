import { useMemo } from 'react';
import {
  Box, Menu, MenuItem, ListItemIcon, ListItemText, Typography, Avatar, Chip, Divider,
} from '@mui/material';
import { IAdminTicketActivity, ActivityType } from '@serviceops/interfaces';

interface NotificationsMenuProps {
  anchorEl: null | HTMLElement;
  onClose: () => void;
  activities: IAdminTicketActivity[];
  isLoading?: boolean;
}

const ACTIVITY_CONFIG: Record<
  string,
  { label: string; color: string; icon: string; showAvatar: boolean }
> = {
  [ActivityType.STATUS_CHANGE]: {
    label: 'Status Changed',
    color: '#6366f1',
    icon: '→',
    showAvatar: true,
  },
  [ActivityType.PRIORITY_CHANGE]: {
    label: 'Priority Changed',
    color: '#f59e0b',
    icon: '↑',
    showAvatar: true,
  },
  [ActivityType.ASSIGNMENT_CHANGE]: {
    label: 'Assignment Changed',
    color: '#3b82f6',
    icon: '👤',
    showAvatar: true,
  },
  [ActivityType.COMMENT_ADDED]: {
    label: 'New Comment',
    color: '#10b981',
    icon: '💬',
    showAvatar: true,
  },
  [ActivityType.INTERNAL_NOTE_ADDED]: {
    label: 'Internal Note',
    color: '#8b5cf6',
    icon: '📝',
    showAvatar: true,
  },
  [ActivityType.SELF_NOTE_ADDED]: {
    label: 'Self Note',
    color: '#6b7280',
    icon: '📋',
    showAvatar: false,
  },
  [ActivityType.TIME_ENTRY_ADDED]: {
    label: 'Time Entry',
    color: '#06b6d4',
    icon: '⏱',
    showAvatar: false,
  },
  [ActivityType.RESOLUTION_ADDED]: {
    label: 'Resolution Added',
    color: '#22c55e',
    icon: '✓',
    showAvatar: true,
  },
  [ActivityType.ATTACHMENT_ADDED]: {
    label: 'Attachment Added',
    color: '#ec4899',
    icon: '📎',
    showAvatar: false,
  },
  [ActivityType.FIELD_UPDATE]: {
    label: 'Field Updated',
    color: '#f97316',
    icon: '✎',
    showAvatar: true,
  },
  [ActivityType.FOLLOW_ADDED]: {
    label: 'New Follower',
    color: '#14b8a6',
    icon: '★',
    showAvatar: true,
  },
  [ActivityType.ESCALATION]: {
    label: 'Escalation',
    color: '#ef4444',
    icon: '⚠',
    showAvatar: true,
  },
  [ActivityType.EMAIL_SENT]: {
    label: 'Email Sent',
    color: '#0ea5e9',
    icon: '✉',
    showAvatar: false,
  },
  [ActivityType.NOTIFY_ASSIGNEES]: {
    label: 'Notification Sent',
    color: '#a855f7',
    icon: '🔔',
    showAvatar: false,
  },
};

const DEFAULT_CONFIG = {
  label: 'Activity',
  color: '#94a3b8',
  icon: '•',
  showAvatar: true,
};

const formatTime = (date: Date | string): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return dateObj.toLocaleDateString();
};

const getInitials = (name: string): string =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

const NotificationsMenu = ({
  anchorEl,
  onClose,
  activities,
  isLoading,
}: NotificationsMenuProps) => {
  const sortedActivities = useMemo(
    () =>
      [...activities].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [activities],
  );

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{ paper: { sx: { minWidth: 360, maxHeight: 420 } } }}
    >
      <MenuItem disabled sx={{ opacity: '1 !important' }}>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontWeight: 700 }}>Ticket Activity</Typography>
              {activities.length > 0 && (
                <Chip
                  label={activities.length}
                  size='small'
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    bgcolor: '#6366f1',
                    color: '#fff',
                  }}
                />
              )}
            </Box>
          }
          primaryTypographyProps={{ fontWeight: 600 }}
        />
      </MenuItem>
      <Divider />
      {isLoading ? (
        <MenuItem disabled>
          <ListItemText primary='Loading...' primaryTypographyProps={{ color: 'text.secondary' }} />
        </MenuItem>
      ) : sortedActivities.length === 0 ? (
        <MenuItem disabled>
          <ListItemText
            primary='No activity yet'
            primaryTypographyProps={{ color: 'text.secondary', fontSize: '0.85rem' }}
          />
        </MenuItem>
      ) : (
        sortedActivities.map((activity) => {
          const config = ACTIVITY_CONFIG[activity.activityType] || DEFAULT_CONFIG;
          const displayText =
            activity.description ||
            activity.newValue ||
            config.label;

          return (
            <MenuItem key={activity.id} onClick={onClose}>
              <ListItemIcon>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    fontSize: '0.85rem',
                    bgcolor: `${config.color}18`,
                    color: config.color,
                    fontWeight: 700,
                  }}
                >
                  {config.showAvatar && activity.performedBy
                    ? getInitials(activity.performedBy)
                    : config.icon}
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography
                      variant='body2'
                      sx={{ fontWeight: 600, fontSize: '0.85rem' }}
                    >
                      {displayText}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                    <Typography
                      variant='caption'
                      sx={{ color: 'text.secondary', fontSize: '0.72rem' }}
                    >
                      {activity.performedBy}
                    </Typography>
                    <Typography variant='caption' sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
                      • {formatTime(activity.createdAt)}
                    </Typography>
                  </Box>
                }
              />
              <Chip
                label={config.label}
                size='small'
                sx={{
                  height: 18,
                  fontSize: '0.6rem',
                  fontWeight: 600,
                  bgcolor: `${config.color}14`,
                  color: config.color,
                  border: `1px solid ${config.color}30`,
                }}
              />
            </MenuItem>
          );
        })
      )}
    </Menu>
  );
};

export default NotificationsMenu;
