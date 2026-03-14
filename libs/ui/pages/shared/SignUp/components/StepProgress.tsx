import { Box, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { STEPS } from '../hooks/useSignUp';

const STEP_ICONS = [PersonIcon, WorkIcon, LockIcon];

interface StepProgressProps {
  step: number;
  classes: Record<string, string>;
}

const StepProgress = ({ step, classes }: StepProgressProps) => (
  <Box className={classes.stepRow}>
    {STEPS.map((s, i) => {
      const StepIcon = STEP_ICONS[i];
      const done = i < step;
      const active = i === step;
      return (
        <Box key={s.label} className={classes.stepItem}>
          <Box
            className={`${classes.stepCircle} ${done ? classes.stepDone : active ? classes.stepActive : classes.stepIdle}`}
          >
            {done ? (
              <CheckCircleIcon className={classes.stepIcon} />
            ) : (
              <StepIcon className={classes.stepIcon} />
            )}
          </Box>
          <Typography className={`${classes.stepLabel} ${active ? classes.stepLabelActive : ''}`}>
            {s.label}
          </Typography>
          {i < STEPS.length - 1 && (
            <Box className={`${classes.stepConnector} ${done ? classes.stepConnectorDone : ''}`} />
          )}
        </Box>
      );
    })}
  </Box>
);

export default StepProgress;
