// userLeaveApi.ts
//
// My Leave / Time-Off endpoints. The whole /api/user namespace is
// session-protected (cookie session, credentials: 'include' on baseApi), so
// no per-call auth.

import {
  ILeaveBalance,
  ILeaveRequest,
  ICreateLeaveRequestInput,
  ILeaveApiResponse,
} from '@serviceops/interfaces';
import { baseApi } from './baseServices';

export const leaveApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** GET /api/user/leave/balance — the user's leave balances */
    getLeaveBalance: builder.query<ILeaveBalance[], void>({
      query: () => `/api/user/leave/balance`,
      transformResponse: (response: ILeaveApiResponse<ILeaveBalance[]>) => response.data,
      providesTags: ['Leave'],
    }),

    /** GET /api/user/leave/requests — submitted leave requests, newest first */
    getLeaveRequests: builder.query<ILeaveRequest[], void>({
      query: () => `/api/user/leave/requests`,
      transformResponse: (response: ILeaveApiResponse<ILeaveRequest[]>) => response.data,
      providesTags: ['Leave'],
    }),

    /** POST /api/user/leave/requests — submit a new leave request */
    submitLeaveRequest: builder.mutation<ILeaveRequest, ICreateLeaveRequestInput>({
      query: (body) => ({
        url: '/api/user/leave/requests',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ILeaveApiResponse<ILeaveRequest>) => response.data,
      invalidatesTags: ['Leave'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetLeaveBalanceQuery, useGetLeaveRequestsQuery, useSubmitLeaveRequestMutation } =
  leaveApi;
