import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()(() => ({
  emptySpan: { color: '#9e9e9e' },
}));

const ReadField = ({
  label,
  value,
  classes,
}: {
  label: string;
  value: ReactNode;
  classes: any;
}) => {
  const { classes: localClasses } = useStyles();
  return (
    <Box className={classes.readField}>
      <span className={classes.readLabel}>{label}</span>
      <Box className={classes.readValue}>
        {value || <span className={localClasses.emptySpan}>—</span>}
      </Box>
    </Box>
  );
};

export default ReadField;
