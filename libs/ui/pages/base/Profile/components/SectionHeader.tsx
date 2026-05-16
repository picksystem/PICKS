import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

const SectionHeader = ({
  icon,
  title,
  classes,
}: {
  icon: ReactNode;
  title: string;
  classes: any;
}) => (
  <Box className={classes.sectionHeader}>
    <Box className={classes.sectionIcon}>{icon}</Box>
    <Typography className={classes.sectionTitle}>{title}</Typography>
  </Box>
);

export default SectionHeader;
