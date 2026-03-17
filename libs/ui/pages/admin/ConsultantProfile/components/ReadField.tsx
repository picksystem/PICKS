import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  root: { marginBottom: theme.spacing(1.5) },
}));

const ReadField = ({ label, value }: { label: string; value: ReactNode }) => {
  const { classes } = useStyles();
  return (
    <Box className={classes.root}>
      <Typography variant='caption' color='text.secondary' display='block'>
        {label}
      </Typography>
      <Typography variant='body2'>{(value as string) || '-'}</Typography>
    </Box>
  );
};

export default ReadField;
