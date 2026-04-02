// baseApi.ts
import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.API_URL || 'http://localhost:3001',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('picks_token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
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
    localStorage.removeItem('picks_token');
    localStorage.removeItem('picks_user');
    window.location.href = '/signin';
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['AdminControls', 'TicketType', 'Configuration'],
  endpoints: () => ({}), // intentionally empty - endpoints added by injectEndpoints
});
