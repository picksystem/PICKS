import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useDevice } from './useDevice';

interface CollapseContextType {
  collapsed: boolean;
  toggleCollapse: () => void;
}

const CollapseContext = createContext<CollapseContextType | undefined>(undefined);

export function CollapseProvider({ children }: { children: ReactNode }) {
  const { isXS, isSM } = useDevice();
  const isMobileDevice = isXS || isSM;

  // Initialize collapsed based on current device
  const [collapsed, setCollapsed] = useState(isMobileDevice);

  // Update collapsed automatically if device changes
  useEffect(() => {
    setCollapsed(!!isMobileDevice);
  }, [isMobileDevice]);

  // Toggle function for user-controlled collapse/expand
  const toggleCollapse = () => setCollapsed((prev) => !prev);

  return (
    <CollapseContext.Provider value={{ collapsed, toggleCollapse }}>
      {children}
    </CollapseContext.Provider>
  );
}

export const useCollapse = () => {
  const context = useContext(CollapseContext);
  if (!context) {
    throw new Error('useCollapse must be used within a CollapseProvider');
  }
  return context;
};
