import { useAppRole } from './AppRoleContext';

/**
 * App-specific metadata configuration type
 */
export interface AppMetadataConfig<T = Record<string, unknown>> {
  admin?: T;
  user?: T;
  consultant?: T;
}

/**
 * Creates metadata that works across all apps with app-specific overrides.
 * Reads the current role ('admin' | 'user' | 'consultant') from AppRoleContext to pick
 * the correct override key.
 *
 * @param baseMetadata - Base metadata object
 * @param appConfig - App-specific metadata overrides
 *
 * @example
 * export const metadata = useAppMetadata(
 *   {
 *     title: 'Welcome to Dashboard',
 *     description: 'Default dashboard description',
 *   },
 *   {
 *     admin: {
 *       title: 'Welcome to Admin Dashboard',
 *     },
 *     user: {
 *       title: 'Welcome to User Dashboard',
 *     },
 *     consultant: {
 *       title: 'Welcome to Consultant Dashboard',
 *     },
 *   }
 * );
 */
export const useAppMetadata = <T extends Record<string, unknown>>(
  baseMetadata: T,
  appConfig?: AppMetadataConfig<Partial<T>>,
): T => {
  const appRole = useAppRole();

  // Get overrides for the current role ('admin', 'user', or 'consultant')
  const appOverrides = appConfig?.[appRole] || {};

  return {
    ...baseMetadata,
    ...appOverrides,
  } as T;
};
