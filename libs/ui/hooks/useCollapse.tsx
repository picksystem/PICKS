import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useDevice } from './useDevice';

interface CollapseContextType {
  collapsed: boolean;
  toggleCollapse: () => void;
  pinned: boolean;
  pin: () => void;
  unpin: () => void;
}

const CollapseContext = createContext<CollapseContextType | undefined>(undefined);

const SIDE_NAV_PINNED_KEY = 'sideNavPinned';

export function CollapseProvider({ children }: { children: ReactNode }) {
  const { isXS, isSM } = useDevice();
  const isMobileDevice = isXS || isSM;

  // Pinned state: only this flag is persisted across refreshes
  const [pinned, setPinned] = useState(() => localStorage.getItem(SIDE_NAV_PINNED_KEY) === 'true');

  // Collapsed state: always starts closed unless pinned
  const [collapsed, setCollapsed] = useState(() => {
    if (isMobileDevice) return true;
    if (localStorage.getItem(SIDE_NAV_PINNED_KEY) === 'true') return false;
    return true;
  });

  // Mobile devices always collapse
  useEffect(() => {
    if (isMobileDevice) setCollapsed(true);
  }, [isMobileDevice]);

  // Pin sidebar open and persist
  const pin = () => {
    setPinned(true);
    localStorage.setItem(SIDE_NAV_PINNED_KEY, 'true');
    setCollapsed(false);
  };

  // Unpin — collapse and remove pinned flag
  const unpin = () => {
    setPinned(false);
    localStorage.setItem(SIDE_NAV_PINNED_KEY, 'false');
    setCollapsed(true);
  };

  // Toggle — if pinned, unpin first; only affects current session
  const toggleCollapse = () => {
    setPinned((prev) => {
      if (prev) {
        localStorage.setItem(SIDE_NAV_PINNED_KEY, 'false');
      }
      return false;
    });
    setCollapsed((prev) => !prev);
  };

  return (
    <CollapseContext.Provider value={{ collapsed, toggleCollapse, pinned, pin, unpin }}>
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
