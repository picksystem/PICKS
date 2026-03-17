import { Box, TimerIcon } from '../../../../components';
import { Typography } from '@mui/material';

interface DraftExpiryBannerProps {
  classes: Record<string, string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cx: (...args: any[]) => string;
  draftExpired: boolean;
  draftRemaining: string;
  isMobile?: boolean;
}

const DraftExpiryBanner = ({
  classes,
  cx,
  draftExpired,
  draftRemaining,
  isMobile,
}: DraftExpiryBannerProps) => {
  if (isMobile) {
    return (
      <Box
        className={cx(classes.mobileDraftTimer, draftExpired && classes.mobileDraftTimerExpired)}
      >
        <TimerIcon sx={{ fontSize: '0.875rem' }} color={draftExpired ? 'error' : 'warning'} />
        <Typography
          sx={{ fontSize: '0.875rem', fontWeight: 600 }}
          color={draftExpired ? 'error.main' : 'warning.dark'}
        >
          {draftExpired ? 'Draft Expired' : 'Draft Expires In'} {draftRemaining}
        </Typography>
      </Box>
    );
  }

  return (
    <Box className={cx(classes.draftTimerBadge, draftExpired && classes.draftTimerExpired)}>
      <TimerIcon fontSize='small' color={draftExpired ? 'error' : 'warning'} />
      <Typography
        variant='body2'
        fontWeight={600}
        color={draftExpired ? 'error.main' : 'warning.dark'}
      >
        {draftExpired ? 'Draft Expired' : 'Draft Expires In'} {draftRemaining}
      </Typography>
    </Box>
  );
};

export default DraftExpiryBanner;
