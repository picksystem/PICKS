import { Dialog, DialogContent, Box, Typography, Avatar } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
import { NotificationsDialogProps } from './util';
import { useStyles } from './styles';

const NotificationsDialog = ({
  open,
  onClose,
  onViewAll,
  notifications,
}: NotificationsDialogProps) => {
  const { classes, cx } = useStyles();

  return (
    <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth className={classes.dialog}>
      {/* Gradient header */}
      <Box className={classes.headerBanner}>
        <Box className={classes.headerTitleArea}>
          <Box className={classes.headerIcon}>
            <NotificationsIcon fontSize='small' />
          </Box>
          <Box>
            <Box className={classes.headerTitle}>Notifications</Box>
            <Box className={classes.headerSubtitle}>
              Pending access requests requiring your review
            </Box>
          </Box>
        </Box>
        <button
          className={classes.closeButton}
          onClick={onClose}
          aria-label='Close notifications'
          type='button'
        >
          <CloseIcon fontSize='small' />
        </button>
      </Box>

      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
        {notifications.length > 0 ? (
          <Box sx={{ maxHeight: 360, overflow: 'auto' }}>
            {notifications.map((u) => {
              const fullName: string = u.name || `${u.firstName || ''} ${u.lastName || ''}`;
              const initials = fullName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
              return (
                <Box
                  key={u.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 3,
                    py: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 'none' },
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={onViewAll}
                >
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      fontSize: '0.85rem',
                      bgcolor: 'primary.light',
                      color: 'primary.main',
                    }}
                  >
                    {initials}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant='body2' fontWeight={500} noWrap>
                      {fullName}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Requested: {u.requestedRole || 'N/A'}
                      {u.createdAt && (
                        <>
                          {' • '}
                          {new Date(u.createdAt).toLocaleDateString()}
                        </>
                      )}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        ) : (
          <Box className={classes.emptyState}>
            <Box className={classes.emptyBellContainer}>
              <NotificationsIcon className={classes.emptyBellIcon} />
            </Box>
            <Typography className={classes.emptyTitle}>All caught up!</Typography>
            <Typography className={classes.emptySubtitle}>
              No pending access requests at the moment.
            </Typography>
          </Box>
        )}
      </DialogContent>

      {/* Footer */}
      <Box className={classes.footer}>
        <button type='button' className={classes.viewAllButton} onClick={onViewAll}>
          VIEW ALL ACCESS REQUESTS
          <ArrowForwardIcon fontSize='small' />
        </button>
      </Box>
    </Dialog>
  );
};

export default NotificationsDialog;
