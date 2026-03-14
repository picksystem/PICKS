import { useState, useCallback } from 'react';

interface CookieOptions {
  days?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Hook for managing cookies with TypeScript support
 * Automatically serializes/deserializes JSON
 *
 * @example
 * const [token, setToken, removeToken] = useCookie<string>('authToken', '');
 * const [preferences, setPreferences] = useCookie<UserPreferences>('prefs', defaultPrefs, { days: 365 });
 */
export function useCookie<T>(
  name: string,
  initialValue: T,
  options: CookieOptions = {},
): [T, (value: T, cookieOptions?: CookieOptions) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof document === 'undefined') {
      return initialValue;
    }

    try {
      const cookie = document.cookie.split('; ').find((row) => row.startsWith(`${name}=`));

      if (cookie) {
        const value = cookie.split('=')[1];
        return JSON.parse(decodeURIComponent(value));
      }
      return initialValue;
    } catch (error) {
      console.error(`Error reading cookie "${name}":`, error);
      return initialValue;
    }
  });

  const setCookie = useCallback(
    (value: T, cookieOptions: CookieOptions = {}) => {
      try {
        const mergedOptions = { ...options, ...cookieOptions };
        const encodedValue = encodeURIComponent(JSON.stringify(value));

        let cookieString = `${name}=${encodedValue}`;

        if (mergedOptions.days) {
          const date = new Date();
          date.setTime(date.getTime() + mergedOptions.days * 24 * 60 * 60 * 1000);
          cookieString += `; expires=${date.toUTCString()}`;
        }

        if (mergedOptions.path) {
          cookieString += `; path=${mergedOptions.path}`;
        } else {
          cookieString += '; path=/';
        }

        if (mergedOptions.domain) {
          cookieString += `; domain=${mergedOptions.domain}`;
        }

        if (mergedOptions.secure) {
          cookieString += '; secure';
        }

        if (mergedOptions.sameSite) {
          cookieString += `; samesite=${mergedOptions.sameSite}`;
        }

        if (typeof document !== 'undefined') {
          document.cookie = cookieString;
        }

        setStoredValue(value);
      } catch (error) {
        console.error(`Error setting cookie "${name}":`, error);
      }
    },
    [name, options],
  );

  const removeCookie = useCallback(() => {
    try {
      if (typeof document !== 'undefined') {
        const pathString = options.path ? `; path=${options.path}` : '; path=/';
        const domainString = options.domain ? `; domain=${options.domain}` : '';
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC${pathString}${domainString}`;
      }
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing cookie "${name}":`, error);
    }
  }, [name, initialValue, options]);

  return [storedValue, setCookie, removeCookie];
}
