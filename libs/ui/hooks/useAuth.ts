import { useAppDispatch } from './useAppDispatch';
import { useAppSelector } from './useAppSelector';
import { setCredentials, logout as logoutAction } from '@serviceops/services';
import { useAuthActionMutation } from '@serviceops/services';
import { UserRole, ISignInResponse } from '@serviceops/interfaces';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated } = useAppSelector((state) => state.auth);
  const [authAction, { isLoading, error }] = useAuthActionMutation();

  const login = async (email: string, password: string) => {
    const result = (await authAction({
      action: 'signin',
      email,
      password,
    }).unwrap()) as ISignInResponse;
    dispatch(setCredentials({ user: result.data.user, token: result.data.token }));
    return result;
  };

  const logout = () => {
    dispatch(logoutAction());
  };

  const isAdmin = user?.role === UserRole.ADMIN;
  const isConsultant = user?.role === UserRole.CONSULTANT;
  const isConsultantMode = isConsultant;

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    isConsultant,
    isConsultantMode,
    login,
    logout,
    isLoading,
    error,
  };
};
