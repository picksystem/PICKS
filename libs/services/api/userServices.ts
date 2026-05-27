// userApi.ts

import { IAuthUser } from '@serviceops/interfaces';
import { baseApi } from './baseServices';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<IAuthUser[], void>({
      query: () => '/users',
    }),
    getUserById: builder.query<IAuthUser, number | string>({
      query: (id) => `/users/${id}`,
    }),
  }),
  overrideExisting: false,
});

export const { useGetUsersQuery, useGetUserByIdQuery } = userApi;
