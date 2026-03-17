import { makeStyles as tssMakeStyles, useStyles as tssUseStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';
import { useAppRole } from './AppRoleContext';

/**
 * Style override object for a single class
 */
type StyleOverride = CSSObject;

/**
 * App-specific style configuration type
 */
export interface AppStyleConfig {
  admin?: Record<string, StyleOverride>;
  user?: Record<string, StyleOverride>;
  consultant?: Record<string, StyleOverride>;
}

/**
 * Runtime style overrides parameter type
 */
export interface StyleOverridesParam {
  props?: {
    classes?: Record<string, string>;
  };
}

/**
 * Creates a hook that returns styled classes
 * Wrapper around tss-react/mui makeStyles for type safety and convenience
 */
export const makeUseStyles = <RuleName extends string = string>(
  stylesOrGetStyles: Record<RuleName, CSSObject> | ((theme: Theme) => Record<RuleName, CSSObject>),
) => {
  const useStylesBase = tssMakeStyles<void, RuleName>()((theme) => {
    if (typeof stylesOrGetStyles === 'function') {
      return stylesOrGetStyles(theme as Theme);
    }
    return stylesOrGetStyles;
  });

  return () => {
    const { cx, classes } = useStylesBase();
    return { cx, classes };
  };
};

/**
 * For backward compatibility - cx helper function
 */
export const cx = (...classNames: (string | undefined | null | false)[]): string => {
  return classNames.filter(Boolean).join(' ');
};

/**
 * Export useStylesTss for accessing css helper in override files
 */
export const useStylesTss = () => {
  const { css, theme } = tssUseStyles();
  return { css, theme };
};

/**
 * Creates a universal style hook that works across all apps with app-specific overrides
 *
 * @param baseStyles - Base styles function that takes theme and returns style object
 * @param appConfig - App-specific style overrides
 *
 * @example
 * export const useTypographyStyles = createAppStyles(
 *   (theme) => ({
 *     root: {
 *       color: 'red',
 *       [theme.breakpoints.down('sm')]: {
 *         fontSize: '14px',
 *       },
 *     },
 *   }),
 *   {
 *     admin: {
 *       root: {
 *         color: 'purple',
 *         fontWeight: 600,
 *       },
 *     },
 *     user: {
 *       root: {
 *         color: 'blue',
 *       },
 *     },
 *     consultant: {
 *       root: {
 *         color: 'green',
 *       },
 *     },
 *   }
 * );
 *
 * // Usage in component
 * const { cx, classes } = useTypographyStyles();
 */
export const createAppStyles = <RuleName extends string = string>(
  baseStyles: (theme: Theme) => Record<RuleName, CSSObject>,
  appConfig?: AppStyleConfig,
) => {
  return (_params?: unknown, styleOverrides?: StyleOverridesParam) => {
    const appRole = useAppRole();
    const { css } = useStylesTss();

    // Create base styles hook
    const useBaseStyles = makeUseStyles<RuleName>(baseStyles);
    const baseResult = useBaseStyles();

    // Get overrides for the current role ('admin', 'user', or 'consultant') from AppRoleContext
    const appOverrides = appConfig?.[appRole] || {};

    // Merge base classes with role-specific overrides
    const mergedClasses: Record<string, string> = {};

    Object.keys(baseResult.classes).forEach((key) => {
      const baseClass = baseResult.classes[key as RuleName];
      const appOverride = appOverrides[key];

      if (appOverride) {
        const overrideClass = css(appOverride);
        mergedClasses[key] = baseResult.cx(baseClass, overrideClass);
      } else {
        mergedClasses[key] = baseClass;
      }
    });

    // Apply runtime style overrides if provided
    const runtimeClasses = styleOverrides?.props?.classes;
    if (runtimeClasses) {
      Object.keys(runtimeClasses).forEach((key) => {
        if (mergedClasses[key]) {
          mergedClasses[key] = baseResult.cx(mergedClasses[key], runtimeClasses[key]);
        } else {
          mergedClasses[key] = runtimeClasses[key];
        }
      });
    }

    return {
      cx: baseResult.cx,
      classes: mergedClasses as Record<RuleName, string>,
    };
  };
};

/**
 * Simplified version for creating styles without app-specific config
 * Useful for shared components that don't need per-app customization
 */
export const createStyles = <RuleName extends string = string>(
  baseStyles: (theme: Theme) => Record<RuleName, CSSObject>,
) => {
  return createAppStyles(baseStyles);
};
