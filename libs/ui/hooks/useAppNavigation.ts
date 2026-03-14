import { useNavigate } from 'react-router-dom';
import { constants } from '@picks/utils';

/**
 * Custom hook for type-safe navigation using app routes
 *
 * @example
 * const { navigateTo, routes } = useAppNavigation();
 *
 * // Navigate to dashboard
 * navigateTo('DASHBOARD');
 *
 * // Navigate with replace
 * navigateTo('SIGNIN', { replace: true });
 *
 * // Access routes
 * console.log(routes.DASHBOARD); // /app/administration/dashboard
 */
export const useAppNavigation = () => {
  const navigate = useNavigate();
  const { Path } = constants;

  /**
   * Navigate to a route by path key
   * @param pathKey - Key from constants.Path (e.g., 'DASHBOARD', 'FAVOURITES')
   * @param options - Navigation options (replace, state)
   */
  const navigateTo = (
    pathKey: keyof typeof Path,
    options?: { replace?: boolean; state?: Record<string, unknown> },
  ) => {
    const path = Path[pathKey];
    navigate(path, options);
  };

  /**
   * Navigate to a custom path (not in constants)
   * @param path - Custom path string
   * @param options - Navigation options (replace, state)
   */
  const navigateToPath = (
    path: string,
    options?: { replace?: boolean; state?: Record<string, unknown> },
  ) => {
    navigate(path, options);
  };

  /**
   * Go back in history
   */
  const goBack = () => {
    navigate(-1);
  };

  /**
   * Go forward in history
   */
  const goForward = () => {
    navigate(1);
  };

  return {
    navigateTo,
    navigateToPath,
    goBack,
    goForward,
    routes: Path,
  };
};
