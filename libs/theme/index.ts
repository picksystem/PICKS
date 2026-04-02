/**
 * theme barrel export
 * Import using: import { theme, createAppStyles, createAppMetadata, ... } from '@serviceops/theme'
 *
 * Includes:
 * - Theme configuration (theme, palette)
 * - Styling utilities (createAppStyles, useAppStyles)
 * - Metadata utilities (useAppMetadata)
 * - Theme types
 */

export { default as theme } from './theme';
export * from './palette';
export * from './theme.types';
export * from './useAppStyles';
export * from './createAppMetadata';
export * from './AppRoleContext';
export { default as DynamicThemeProvider, useThemeContext } from './DynamicThemeProvider';
export * from './themePalettes';
