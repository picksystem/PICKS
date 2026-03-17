import { useState, useCallback, useEffect } from 'react';
import { useIsMounted } from './useIsMounted';

interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

/**
 * Manages async operation state (loading, data, error)
 * Automatically prevents state updates on unmounted components
 *
 * @example
 * const { data, error, loading, execute } = useAsync(async () => {
 *   return await fetchUserData(userId);
 * });
 *
 * useEffect(() => {
 *   execute();
 * }, [userId, execute]);
 *
 * if (loading) return <Loading />;
 * if (error) return <Error error={error} />;
 * return <UserData data={data} />;
 */
export function useAsync<T>(asyncFunction: () => Promise<T>, immediate: boolean = false) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    loading: false,
  });

  const isMounted = useIsMounted();

  const execute = useCallback(async () => {
    setState({ data: null, error: null, loading: true });

    try {
      const data = await asyncFunction();
      if (isMounted()) {
        setState({ data, error: null, loading: false });
      }
      return data;
    } catch (error) {
      if (isMounted()) {
        setState({ data: null, error: error as Error, loading: false });
      }
      throw error;
    }
  }, [asyncFunction, isMounted]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { ...state, execute };
}
