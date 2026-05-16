import { TabPanelProps } from './util';

const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <div role='tabpanel' hidden={value !== index}>
    {value === index && <>{children}</>}
  </div>
);

export default TabPanel;
