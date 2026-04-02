import { Typography, Chip } from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import SearchIcon from '@mui/icons-material/Search';
import { Box } from '@serviceops/component';
import { useStyles } from '../styles';

interface HeroBannerProps {
  ticketNumber: string;
  resolvedCount: number;
  matchCount: number;
}

const HeroBanner = ({ ticketNumber, resolvedCount, matchCount }: HeroBannerProps) => {
  const { classes } = useStyles();
  return (
    <Box className={classes.hero}>
      <Box className={classes.heroIconBox}>
        <AutoFixHighIcon sx={{ fontSize: 28, color: '#fff' }} />
      </Box>
      <Box className={classes.heroContent}>
        <Typography className={classes.heroTitle}>Solution Finder</Typography>
        <Typography className={classes.heroSub}>
          Scanning resolved incidents to surface the best matching solutions for your issue
        </Typography>
        <Box className={classes.heroChipRow}>
          {ticketNumber && (
            <Chip label={ticketNumber} size='small' className={classes.heroChipTicket} />
          )}
          <Chip
            icon={
              <SearchIcon sx={{ fontSize: '0.85rem !important', color: '#a5b4fc !important' }} />
            }
            label={`${resolvedCount} resolved incidents`}
            size='small'
            className={classes.heroChipCount}
          />
          {matchCount > 0 && (
            <Chip
              label={`${matchCount} match${matchCount !== 1 ? 'es' : ''} found`}
              size='small'
              className={classes.heroChipMatches}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default HeroBanner;
