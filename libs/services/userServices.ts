// userApi.ts

import { IAuthUser } from '@picks/interfaces';
import { baseApi } from './baseServices';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUser: builder.query<IAuthUser[], void>({
      query: () => '/users',
    }),
    getUserById: builder.query<IAuthUser, number | string>({
      query: (id) => `/users/${id}`,
    }),
  }),
  overrideExisting: false,
});

export const { useGetUserQuery, useGetUserByIdQuery } = userApi;
