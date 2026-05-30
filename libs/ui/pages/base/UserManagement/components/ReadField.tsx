import type { ReactNode } from 'react';
import { Box, Typography } from '@serviceops/component';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()(() => ({
  emptySpan: { color: '#9e9e9e' },
}));

interface ReadFieldProps {
  label: string;
  value?: ReactNode;
  muted?: boolean;
}

const ReadField = ({ label, value, muted }: ReadFieldProps) => {
  const { classes } = useStyles();
  return (
    <Box>
      <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>{label}</span>
      <Box>
        {value ? (
          <Typography variant='body2' color={muted ? 'text.disabled' : 'text.primary'}>
            {String(value)}
          </Typography>
        ) : (
          <span className={classes.emptySpan}>—</span>
        )}
      </Box>
    </Box>
  );
};

export default ReadField;
