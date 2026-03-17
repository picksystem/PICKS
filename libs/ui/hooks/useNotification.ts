import { useCallback } from 'react';
import { useAppDispatch } from './useAppDispatch';
import { showNotification, hideNotification } from '../slices';

export const useNotification = () => {
  const dispatch = useAppDispatch();

  const success = useCallback(
    (message: string, duration?: number) =>
      dispatch(showNotification({ message, severity: 'success', autoHideDuration: duration })),
    [dispatch],
  );

  const error = useCallback(
    (message: string, duration?: number) =>
      dispatch(showNotification({ message, severity: 'error', autoHideDuration: duration })),
    [dispatch],
  );

  const warning = useCallback(
    (message: string, duration?: number) =>
      dispatch(showNotification({ message, severity: 'warning', autoHideDuration: duration })),
    [dispatch],
  );

  const info = useCallback(
    (message: string, duration?: number) =>
      dispatch(showNotification({ message, severity: 'info', autoHideDuration: duration })),
    [dispatch],
  );

  const close = useCallback(() => dispatch(hideNotification()), [dispatch]);

  return { success, error, warning, info, close };
};
