import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuthActionMutation } from '@serviceops/services';
import { IAuthUser } from '@serviceops/interfaces';

/**
 * Shared hook for User Management users — prevents duplicate calls to
 * `authAction({ action: 'get-all-users' })` across components. Returns the
 * full `IAuthUser[]` list (with firstName / lastName / name / email / role)
 * and a loading flag. Mirrors the convention used by `useSharedTicketTypes`
 * and `useSharedApplications`.
 *
 * The hook caches the first successful fetch in module-local state, so any
 * component that mounts after the data has loaded gets it synchronously
 * without re-hitting the API.
 */

export interface UserOption {
  id: number;
  /** `firstName + ' ' + lastName` — what the popover shows. */
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface SharedUsersState {
  users: IAuthUser[];
  inflight: Promise<IAuthUser[]> | null;
  settled: boolean;
}

let sharedState: SharedUsersState | null = null;
const subscribers = new Set<() => void>();

const notify = () => subscribers.forEach((fn) => fn());

const setSharedState = (next: SharedUsersState) => {
  sharedState = next;
  notify();
};

export const useSharedUsers = () => {
  const [authAction] = useAuthActionMutation();
  // Local mirror so components re-render when the shared cache updates.
  const [, setTick] = useState(0);
  const localInflightRef = useRef<Promise<IAuthUser[]> | null>(null);

  useEffect(() => {
    const sub = () => setTick((n) => n + 1);
    subscribers.add(sub);
    return () => {
      subscribers.delete(sub);
    };
  }, []);

  const ensureLoaded = useCallback(async (): Promise<IAuthUser[]> => {
    if (sharedState?.settled) return sharedState.users;
    if (sharedState?.inflight) return sharedState.inflight;
    if (localInflightRef.current) return localInflightRef.current;

    const inflight = (async () => {
      try {
        const result = await authAction({ action: 'get-all-users' }).unwrap();
        const users: IAuthUser[] = result?.data ?? [];
        setSharedState({ users, inflight: null, settled: true });
        return users;
      } catch {
        // Leave settled=false so a later mount retries. Don't poison the cache.
        sharedState = null;
        notify();
        return [];
      }
    })();

    if (!sharedState) {
      setSharedState({ users: [], inflight, settled: false });
    } else {
      sharedState.inflight = inflight;
      notify();
    }
    localInflightRef.current = inflight;
    return inflight;
  }, [authAction]);

  // Kick off the load on first mount. Subsequent mounts reuse the in-flight
  // or settled state above.
  useEffect(() => {
    if (!sharedState || (!sharedState.settled && !sharedState.inflight)) {
      ensureLoaded();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const users = sharedState?.users ?? [];
  const isLoading = !sharedState?.settled;

  const options: UserOption[] = users
    .filter((u) => u && (u.firstName || u.lastName))
    .map((u) => ({
      id: u.id,
      name: [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.name,
      firstName: u.firstName ?? '',
      lastName: u.lastName ?? '',
      email: u.email ?? '',
      role: u.role ?? '',
    }));

  return { users, options, isLoading, reload: ensureLoaded };
};

export const __resetSharedUsersCacheForTests = () => {
  sharedState = null;
  notify();
};