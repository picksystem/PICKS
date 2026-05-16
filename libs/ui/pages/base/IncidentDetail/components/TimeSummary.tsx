import { Box } from '../../../../components';
import { Typography } from '@mui/material';
import { TimeSummaryData } from '../types/incidentDetail.types';
import { formatTimeSummary, calculateRemainingTime } from '../utils/incidentDetail.utils';
import { useStyles } from '../styles';

interface TimeSummaryProps {
  data: TimeSummaryData;
  eta: Date | null;
}

interface CellProps {
  label: string;
  value: string;
  sub?: string;
  classes: Record<string, string>;
}

const Cell = ({ label, value, sub, classes }: CellProps) => (
  <Box className={classes.timeSummaryCell}>
    <Typography className={classes.timeSummaryCellLabel}>{label}</Typography>
    <Typography className={classes.timeSummaryCellValue}>{value}</Typography>
    {sub && <Typography className={classes.timeSummaryCellSub}>{sub}</Typography>}
  </Box>
);

const TimeSummary = ({ data, eta }: TimeSummaryProps) => {
  const { classes } = useStyles();
  const remaining = calculateRemainingTime(eta);
  const timeSpent = data ? formatTimeSummary(data.billableMinutes + data.nonBillableMinutes) : '—';
  const billable = data ? formatTimeSummary(data.billableMinutes) : '—';
  const nonBillable = data ? formatTimeSummary(data.nonBillableMinutes) : '—';

  return (
    <Box className={classes.timeSummaryWrap}>
      <Cell label='Time Spent' value={timeSpent} sub='Billable + Non-billable' classes={classes} />
      <Cell label='Remaining' value={remaining} sub='Until ETA' classes={classes} />
      <Cell label='Billable' value={billable} classes={classes} />
      <Cell label='Non-Billable' value={nonBillable} classes={classes} />
    </Box>
  );
};

export default TimeSummary;
