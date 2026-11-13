// baseApi.ts
import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';

/**
 * Session-based auth: the browser sends the httpOnly session cookie with
 * `credentials: 'include'` instead of a Bearer token. No auth credentials are
 * stored in localStorage/sessionStorage — the server holds the session.
 */
const rawBaseQuery = fetchBaseQuery({
  // Empty in dev → requests are relative to the page origin and go through the
  // Vite proxy (same-origin, normal cookie). Set API_URL to an absolute URL for
  // prod / a separately-hosted API (then cross-site cookie rules apply).
  baseUrl: process.env.API_URL ?? '',
  credentials: 'include',
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  const requestUrl = typeof args === 'string' ? args : (args as FetchArgs).url;
  const isAuthEndpoint = requestUrl?.includes('/api/auth');

  if (result.error?.status === 401 && !isAuthEndpoint) {
    // Session expired/revoked — full reload re-runs session hydration and
    // lands the user on the sign-in page when the server reports no session.
    window.location.href = '/signin';
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'AdminControls',
    'Ticket',
    'TicketType',
    'Configuration',
    'TicketComments',
    'TicketTimeEntries',
    'TicketResolutions',
    'TicketActivities',
    'CustomFields',
    'KBArticle',
    'Timesheet',
  ],
  endpoints: () => ({}), // intentionally empty - endpoints added by injectEndpoints
});
