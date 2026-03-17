import { useDispatch } from 'react-redux';
import { AppDispatch } from '../state';

/**
 * Typed version of useDispatch hook for the app's store
 *
 * @example
 * const dispatch = useAppDispatch();
 * dispatch(increment());
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();
