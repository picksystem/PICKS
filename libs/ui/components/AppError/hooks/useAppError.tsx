import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppErrorProps, ERROR_CONFIG } from '../types/AppError.types';
import AppError from '../AppError';

export function useAppError() {
  const navigate = useNavigate();

  const goHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const showError = useCallback(
    (props: AppErrorProps) => {
      const handleHome = props.onHomeClick || goHome;
      const handleReload = props.onReloadClick;
      const handleGoBack = props.onGoBackClick;

      return (
        <AppError
          code={props.code}
          title={props.title}
          message={props.message}
          description={props.description}
          showHomeButton={props.showHomeButton}
          showReloadButton={props.showReloadButton}
          showGoBackButton={props.showGoBackButton}
          onHomeClick={handleHome}
          onReloadClick={handleReload}
          onGoBackClick={handleGoBack}
        />
      );
    },
    [goHome],
  );

  const show400Error = (customProps?: Partial<AppErrorProps>) =>
    showError({ ...ERROR_CONFIG[400], ...customProps });

  const show401Error = (customProps?: Partial<AppErrorProps>) =>
    showError({ ...ERROR_CONFIG[401], ...customProps });

  const show403Error = (customProps?: Partial<AppErrorProps>) =>
    showError({ ...ERROR_CONFIG[403], ...customProps });

  const show404Error = (customProps?: Partial<AppErrorProps>) =>
    showError({ ...ERROR_CONFIG[404], ...customProps });

  const show500Error = (customProps?: Partial<AppErrorProps>) =>
    showError({ ...ERROR_CONFIG[500], ...customProps });

  const showGenericError = (customProps?: Partial<AppErrorProps>) =>
    showError({ ...ERROR_CONFIG.ERROR, ...customProps });

  return {
    showError,
    show400Error,
    show401Error,
    show403Error,
    show404Error,
    show500Error,
    showGenericError,
  };
}
