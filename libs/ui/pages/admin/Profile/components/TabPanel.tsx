import type { ReactNode } from 'react';

const TabPanel = ({
  children,
  value,
  index,
}: {
  children?: ReactNode;
  value: number;
  index: number;
}) => <div hidden={value !== index}>{value === index && children}</div>;

export default TabPanel;
