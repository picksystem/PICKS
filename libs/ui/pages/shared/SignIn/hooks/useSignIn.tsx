import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useFormWithSessionStorage, useNotification, useFieldError } from '@picks/hooks';
import { SignInSchema, UserRole } from '@picks/interfaces';
import { constants } from '@picks/utils';

const useSignIn = () => {
  const reqError = useFieldError();
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const notify = useNotification();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const formik = useFormWithSessionStorage('signIn', {
    initialValues: { email: '', password: '' },
    validationSchema: SignInSchema,
    onSubmit: async (values) => {
      setLoginError(null);
      try {
        const result = await login(values.email, values.password);
        if (result.data.adminRequestPending) {
          notify.warning(result.message);
        }
        const { role } = result.data.user;
        let destination = constants.UserPath.DASHBOARD;
        if (role === UserRole.ADMIN) {
          destination = constants.AdminPath.DASHBOARD;
        } else if (role === UserRole.CONSULTANT) {
          destination = constants.ConsultantPath.DASHBOARD;
        }
        navigate(destination, { replace: true });
      } catch (err: unknown) {
        const error = err as {
          status?: string | number;
          data?: { message?: string };
          message?: string;
          error?: string;
        };
        let message: string;
        if (error?.status === 'FETCH_ERROR' || error?.status === 'PARSING_ERROR') {
          message = 'Unable to reach the server. Please check that the backend is running.';
        } else {
          message = error?.data?.message || error?.message || error?.error || 'Invalid email or password';
        }
        if (message.toLowerCase().includes('pending admin approval')) {
          notify.warning(message);
        } else {
          setLoginError(message);
        }
      }
    },
  });

  return {
    formik,
    isLoading,
    showPassword,
    setShowPassword,
    reqError,
    navigate,
    loginError,
    clearLoginError: () => setLoginError(null),
  };
};

export default useSignIn;
