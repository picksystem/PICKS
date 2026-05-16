import type { ReactNode } from 'react';
import { Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()(() => ({
  root: {
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
}));

const SectionLabel = ({ children }: { children: ReactNode }) => {
  const { classes } = useStyles();
  return (
    <Typography variant='caption' color='text.secondary' className={classes.root}>
      {children}
    </Typography>
  );
};

export default SectionLabel;
