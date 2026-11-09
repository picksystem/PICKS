import { useEffect, useRef } from 'react';
import { useAppDispatch } from './useAppDispatch';
import { useAppSelector } from './useAppSelector';
import {
  setCredentials,
  logout as logoutAction,
  markHydrated,
  useAuthActionMutation,
  useGetSessionMutation,
  useLogoutMutation,
} from '@serviceops/services';
import { UserRole, ISignInResponse } from '@serviceops/interfaces';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, hydrated } = useAppSelector((state) => state.auth);
  const [authAction, { isLoading: isAuthLoading, error }] = useAuthActionMutation();
  const [getSession] = useGetSessionMutation();
  const [serverLogout] = useLogoutMutation();

  // Re-validate the server-side session cookie exactly once on mount. If the
  // session is alive we restore the user into Redux; otherwise the router
  // keeps the user on the sign-in page. `hydrated` gates the first render so
  // the UI can show a loader instead of flashing the unauthenticated routes.
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    const hydrate = async () => {
      try {
        const result = await getSession().unwrap();
        if (result.data.authenticated) {
          dispatch(
            setCredentials({
              user: result.data.user,
              mustResetPassword: result.data.mustResetPassword,
            }),
          );
        }
      } catch {
        // No / invalid session — stay unauthenticated.
      } finally {
        dispatch(markHydrated());
      }
    };
    void hydrate();
  }, [dispatch, getSession]);

  const login = async (email: string, password: string) => {
    const result = (await authAction({
      action: 'signin',
      email,
      password,
    }).unwrap()) as ISignInResponse;
    dispatch(
      setCredentials({ user: result.data.user, mustResetPassword: result.data.mustResetPassword }),
    );
    return result;
  };

  const logout = async () => {
    // Destroy the server-side session (best-effort), then clear local state.
    await serverLogout()
      .unwrap()
      .catch(() => {});
    dispatch(logoutAction());
  };

  const isAdmin = user?.role === UserRole.ADMIN;
  const isConsultant = user?.role === UserRole.CONSULTANT;
  const isConsultantMode = isConsultant;

  return {
    user,
    isAuthenticated,
    hydrated,
    isAdmin,
    isConsultant,
    isConsultantMode,
    login,
    logout,
    isLoading: isAuthLoading,
    error,
  };
};
