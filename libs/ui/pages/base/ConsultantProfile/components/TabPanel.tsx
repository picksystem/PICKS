import { Box } from '@serviceops/component';
import type { ReactNode } from 'react';

interface TabPanelProps {
  children?: ReactNode;
  value: number;
  index: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <div role='tabpanel' hidden={value !== index} id={`tabpanel-${index}`}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

export default TabPanel;
