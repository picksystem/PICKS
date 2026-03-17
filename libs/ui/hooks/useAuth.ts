import { useAppDispatch } from './useAppDispatch';
import { useAppSelector } from './useAppSelector';
import { setCredentials, logout as logoutAction } from '../store/authStore';
import { useAuthActionMutation } from '@picks/services';
import { UserRole, ISignInResponse } from '@picks/interfaces';

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

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    isConsultant,
    login,
    logout,
    isLoading,
    error,
  };
};
