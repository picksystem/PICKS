import type { ReactNode } from 'react';

interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <div role='tabpanel' hidden={value !== index}>
    {value === index && <>{children}</>}
  </div>
);

export default TabPanel;
