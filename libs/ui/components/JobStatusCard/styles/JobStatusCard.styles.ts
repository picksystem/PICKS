import { makeStyles } from 'tss-react/mui';
import { getBaseStyles, JobStatusCardStyleParams } from './JobStatusCard.styles.shared';

export const useStyles = makeStyles<JobStatusCardStyleParams>()((theme, params) =>
  getBaseStyles(theme, params),
);
