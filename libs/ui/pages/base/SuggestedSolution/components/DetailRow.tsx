import { Box, Typography } from '@serviceops/component';
import { useStyles } from '../styles';
import { DetailRowProps } from './util';

const DetailRow = ({ icon, label, value, accent = '#6366f1' }: DetailRowProps) => {
  const { classes } = useStyles();
  return (
    <Box className={classes.detailRow}>
      <Box className={classes.detailRowIconBox} sx={{ background: `${accent}18`, color: accent }}>
        {icon}
      </Box>
      <Box className={classes.detailRowContent}>
        <Typography className={classes.detailRowLabel} sx={{ color: accent }}>
          {label}
        </Typography>
        <Typography className={classes.detailRowValue}>{value || '—'}</Typography>
      </Box>
    </Box>
  );
};

export default DetailRow;
