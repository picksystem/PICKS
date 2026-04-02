import { Box, Typography } from '@mui/material';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import SpeedIcon from '@mui/icons-material/Speed';
import GroupsIcon from '@mui/icons-material/Groups';
import BarChartIcon from '@mui/icons-material/BarChart';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

const FEATURES = [
  { icon: SpeedIcon, label: 'Blazing-fast incident resolution' },
  { icon: GroupsIcon, label: 'Collaborative cross-team workflows' },
  { icon: BarChartIcon, label: 'Real-time SLA dashboards' },
  { icon: VerifiedUserIcon, label: 'Enterprise-grade audit trails' },
];

interface LeftPanelProps {
  classes: Record<string, string>;
  onNavigateSignUp: () => void;
}

const LeftPanel = ({ classes, onNavigateSignUp }: LeftPanelProps) => (
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

    <Typography variant='h4' fontWeight={700} className={classes.heroHeading}>
      Your ITIL
      <br />
      Command Center
    </Typography>
    <Typography className={classes.heroSubtitle}>
      Manage incidents, service requests, and change workflows — with clarity and speed.
    </Typography>

    {FEATURES.map(({ icon: Icon, label }) => (
      <Box key={label} className={classes.featureRow}>
        <Box className={classes.featureIconWrap}>
          <Icon className={classes.featureIconInner} />
        </Box>
        <Typography className={classes.featureLabel}>{label}</Typography>
      </Box>
    ))}

    <Box className={classes.signupLink} onClick={onNavigateSignUp}>
      New to ServiceOps? <strong>Create an account</strong>
    </Box>
  </Box>
);

export default LeftPanel;
