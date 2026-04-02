import { Box, Typography } from '@mui/material';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import type { Step } from '../hooks/useForgotPassword';

const LEFT_STEPS = [
  { num: '01', title: 'Enter your email', desc: "We'll send a one-time passcode to your inbox" },
  { num: '02', title: 'Verify the OTP', desc: 'Enter the 6-digit code from your email' },
  { num: '03', title: 'Set new password', desc: 'Choose a strong password to secure your account' },
];

interface LeftPanelProps {
  step: Step;
  stepIndex: number;
  classes: Record<string, string>;
  onNavigateSignIn: () => void;
}

const LeftPanel = ({ stepIndex, classes, onNavigateSignIn }: LeftPanelProps) => (
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
      Account
      <br />
      Recovery
    </Typography>
    <Typography className={classes.heroSubtitle}>
      Regain secure access to your ServiceOps account in just a few steps.
    </Typography>

    {LEFT_STEPS.map((s, i) => (
      <Box key={s.num} className={classes.recoveryStep}>
        <Box
          className={`${classes.recoveryNum} ${i <= stepIndex ? classes.recoveryNumActive : ''}`}
        >
          {i < stepIndex ? '✓' : s.num}
        </Box>
        <Box>
          <Typography
            fontWeight={600}
            className={`${classes.recoveryStepTitle} ${i <= stepIndex ? classes.recoveryStepActiveTitle : classes.recoveryStepInactiveTitle}`}
          >
            {s.title}
          </Typography>
          <Typography
            variant='caption'
            className={`${classes.recoveryStepCaption} ${i <= stepIndex ? classes.recoveryStepActiveCaption : classes.recoveryStepInactiveCaption}`}
          >
            {s.desc}
          </Typography>
        </Box>
      </Box>
    ))}

    <Box className={classes.securityNote}>
      <Typography className={classes.securityNoteText}>
        🔒 All recovery codes expire in 15 minutes for your security.
      </Typography>
    </Box>

    <Box className={classes.signinLink} onClick={onNavigateSignIn}>
      Remember your password? <strong>Sign in</strong>
    </Box>
  </Box>
);

export default LeftPanel;
