import { Box, ExpandMoreIcon } from '../../../../components';
import { Typography } from '@mui/material';

interface MobileToggleRowProps {
  classes: Record<string, string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cx: (...args: any[]) => string;
  open: boolean;
  label: string;
  onClick: () => void;
}

const MobileToggleRow = ({ classes, cx, open, label, onClick }: MobileToggleRowProps) => (
  <Box
    className={cx(classes.mobileToggleRow, open && classes.mobileToggleRowOpen)}
    onClick={onClick}
  >
    <Box className={classes.mobileToggleLeft}>
      <Box className={cx(classes.mobileToggleDot, open && classes.mobileToggleDotOpen)} />
      <Typography className={cx(classes.mobileToggleLabel, open && classes.mobileToggleLabelOpen)}>
        {label}
      </Typography>
    </Box>
    <Box className={classes.mobileToggleRight}>
      <Typography
        className={cx(classes.mobileToggleAction, open && classes.mobileToggleActionOpen)}
      >
        {open ? 'Hide' : 'Show'}
      </Typography>
      <ExpandMoreIcon
        className={cx(classes.mobileToggleIcon, open && classes.mobileToggleIconOpen)}
      />
    </Box>
  </Box>
);

export default MobileToggleRow;
