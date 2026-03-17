import {
  Box,
  Tooltip,
  IconButton,
  AccessTimeIcon,
  PauseIcon,
  StopIcon,
  CancelIcon,
} from '../../../../components';
import { Typography } from '@mui/material';
import { formatTimer } from '../utils/incidentDetail.utils';

interface WorkTimerProps {
  classes: Record<string, string>;
  timerSeconds: number;
  timerRunning: boolean;
  timerStopped: boolean;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onCancel: () => void;
}

const startIconSx = (timerStopped: boolean) => ({
  fontSize: '1.4rem',
  color: timerStopped ? undefined : '#2e7d32',
});

const pauseIconSx = { fontSize: '1.4rem', color: '#f57c00' };
const stopIconSx = { fontSize: '1.4rem', color: '#d32f2f' };
const cancelIconSx = { fontSize: '1.4rem', color: '#c62828' };

const WorkTimer = ({
  classes,
  timerSeconds,
  timerRunning,
  timerStopped,
  onStart,
  onPause,
  onStop,
  onCancel,
}: WorkTimerProps) => (
  <Box className={classes.timerContainer}>
    <Typography className={classes.timerDisplay}>{formatTimer(timerSeconds)}</Typography>
    {!timerRunning ? (
      <Tooltip title={timerStopped ? 'Timer stopped' : timerSeconds > 0 ? 'Resume' : 'Start'}>
        <span>
          <IconButton
            size='small'
            onClick={onStart}
            disabled={timerStopped}
            className={classes.timerIconButton}
          >
            <AccessTimeIcon sx={startIconSx(timerStopped)} />
          </IconButton>
        </span>
      </Tooltip>
    ) : (
      <Tooltip title='Pause'>
        <IconButton size='small' onClick={onPause} className={classes.timerIconButton}>
          <PauseIcon sx={pauseIconSx} />
        </IconButton>
      </Tooltip>
    )}
    <Tooltip title='Stop & Save Time Entry'>
      <span>
        <IconButton
          size='small'
          onClick={onStop}
          disabled={timerSeconds === 0 || timerStopped}
          className={classes.timerIconButton}
        >
          <StopIcon sx={stopIconSx} />
        </IconButton>
      </span>
    </Tooltip>
    <Tooltip title='Cancel & Discard'>
      <span>
        <IconButton
          size='small'
          onClick={onCancel}
          disabled={timerSeconds === 0 && !timerRunning}
          className={classes.timerIconButton}
        >
          <CancelIcon sx={cancelIconSx} />
        </IconButton>
      </span>
    </Tooltip>
  </Box>
);

export default WorkTimer;
