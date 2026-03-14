import React from 'react';
import { Box } from '@mui/material';
import { TabPanelProps } from '../types/userManagement.types';

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div role='tabpanel' hidden={value !== index} id={`um-tabpanel-${index}`} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

export default TabPanel;
