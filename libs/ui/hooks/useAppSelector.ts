import { useSelector, TypedUseSelectorHook } from 'react-redux';
import { RootState } from '../state';

/**
 * Typed version of useSelector hook for the app's RootState
 *
 * @example
 * const counter = useAppSelector((state) => state.counter.value);
 * const user = useAppSelector((state) => state.user);
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
