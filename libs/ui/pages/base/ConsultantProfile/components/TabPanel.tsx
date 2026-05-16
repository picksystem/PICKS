import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  root: { paddingTop: theme.spacing(2) },
}));

interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => {
  const { classes } = useStyles();
  return (
    <div role='tabpanel' hidden={value !== index}>
      {value === index && <Box className={classes.root}>{children}</Box>}
    </div>
  );
};

export default TabPanel;
