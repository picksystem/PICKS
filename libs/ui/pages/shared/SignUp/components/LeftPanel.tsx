import { Box, Typography } from '@mui/material';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import SecurityIcon from '@mui/icons-material/Security';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const FEATURES = [
  { icon: DashboardCustomizeIcon, label: 'Unified incident & request management' },
  { icon: SecurityIcon, label: 'Role-based access control' },
  { icon: NotificationsActiveIcon, label: 'Real-time alerts & notifications' },
  { icon: CheckCircleIcon, label: 'Enterprise-grade audit trails' },
];

interface LeftPanelProps {
  classes: Record<string, string>;
  onNavigateSignIn: () => void;
}

const LeftPanel = ({ classes, onNavigateSignIn }: LeftPanelProps) => (
  <Box className={classes.leftPanel}>
    <Box className={classes.circle1} />
    <Box className={classes.circle2} />
    <Box className={classes.circle3} />

    <Box className={classes.brand}>
      <Box className={classes.brandIcon}>
        <AssignmentIndIcon className={classes.brandIcon28} />
      </Box>
      <Typography variant='h4' fontWeight={800} className={classes.brandTitle}>
        ServiceOps
      </Typography>
    </Box>

    <Typography variant='h5' fontWeight={700} className={classes.heroHeading}>
      One platform for
      <br />
      everything ITIL
    </Typography>
    <Typography className={classes.heroSubtitle}>
      Join IT professionals managing incidents, requests, and changes — all in one place.
    </Typography>

    {FEATURES.map(({ icon: Icon, label }) => (
      <Box key={label} className={classes.featureRow}>
        <Box className={classes.featureIconWrap}>
          <Icon className={classes.featureIconInner} />
        </Box>
        <Typography className={classes.featureLabel}>{label}</Typography>
      </Box>
    ))}

    <Box className={classes.signinLink} onClick={onNavigateSignIn}>
      Already have an account? <strong>Sign in</strong>
    </Box>
  </Box>
);

export default LeftPanel;
