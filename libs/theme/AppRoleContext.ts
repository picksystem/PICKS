import { createContext, useContext } from 'react';

export type AppRole = 'admin' | 'user' | 'consultant';

/**
 * React context that identifies whether the current render tree
 * is admin pages, user pages, or consultant pages. Used by createAppStyles and
 * createAppMetadata to pick the correct override key.
 */
export const AppRoleContext = createContext<AppRole>('admin');

/**
 * Hook to read the current app role ('admin' | 'user' | 'consultant')
 */
export const useAppRole = (): AppRole => useContext(AppRoleContext);
