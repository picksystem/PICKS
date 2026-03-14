import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  root: { marginBottom: theme.spacing(1.5) },
}));

const DetailField = ({ label, value }: { label: string; value: ReactNode }) => {
  const { classes } = useStyles();
  return (
    <Box className={classes.root}>
      <Typography variant='caption' color='text.secondary'>
        {label}
      </Typography>
      <Typography variant='body2'>{value || '-'}</Typography>
    </Box>
  );
};

export default DetailField;
