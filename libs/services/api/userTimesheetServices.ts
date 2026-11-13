// userTimesheetApi.ts
//
// My Timesheet endpoints. The whole /api/user namespace is session-protected
// (cookie session, credentials: 'include' on baseApi), so no per-call auth.

import {
  ITimesheet,
  ITimesheetApiResponse,
  ITimesheetApprovalHistoryItem,
  ITimesheetLine,
  ITimesheetWeekParams,
  ICreateTimesheetLineInput,
  ISaveTimesheetInput,
  IUpdateTimesheetLineInput,
} from '@serviceops/interfaces';
import { baseApi } from './baseServices';

export const timesheetApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** GET /api/user/timesheet?weekStart=YYYY-MM-DD — week's sheet (auto-created when absent) */
    getTimesheet: builder.query<ITimesheet, ITimesheetWeekParams>({
      query: ({ weekStart }) => ({
        url: `/api/user/timesheet`,
        params: weekStart ? { weekStart } : undefined,
      }),
      transformResponse: (response: ITimesheetApiResponse<ITimesheet>) => response.data,
      providesTags: ['Timesheet'],
    }),

    /** POST /api/user/timesheet/save?weekStart=YYYY-MM-DD */
    saveTimesheet: builder.mutation<ITimesheet, ISaveTimesheetInput>({
      query: ({ weekStart, ...body }) => ({
        url: '/api/user/timesheet/save',
        method: 'POST',
        params: { weekStart },
        body,
      }),
      transformResponse: (response: ITimesheetApiResponse<ITimesheet>) => response.data,
      invalidatesTags: ['Timesheet'],
    }),

    /** POST /api/user/timesheet/submit?weekStart=YYYY-MM-DD */
    submitTimesheet: builder.mutation<ITimesheet, ITimesheetWeekParams>({
      query: ({ weekStart }) => ({
        url: '/api/user/timesheet/submit',
        method: 'POST',
        params: weekStart ? { weekStart } : undefined,
      }),
      transformResponse: (response: ITimesheetApiResponse<ITimesheet>) => response.data,
      invalidatesTags: ['Timesheet'],
    }),

    /** POST /api/user/timesheet/lines?weekStart=YYYY-MM-DD */
    createTimesheetLine: builder.mutation<
      ITimesheetLine,
      { weekStart?: string; data: ICreateTimesheetLineInput }
    >({
      query: ({ weekStart, data }) => ({
        url: '/api/user/timesheet/lines',
        method: 'POST',
        params: weekStart ? { weekStart } : undefined,
        body: data,
      }),
      transformResponse: (response: ITimesheetApiResponse<ITimesheetLine>) => response.data,
      invalidatesTags: ['Timesheet'],
    }),

    /** PATCH /api/user/timesheet/lines/:id?weekStart=YYYY-MM-DD */
    updateTimesheetLine: builder.mutation<
      ITimesheetLine,
      { weekStart?: string; id: string; data: IUpdateTimesheetLineInput }
    >({
      query: ({ weekStart, id, data }) => ({
        url: `/api/user/timesheet/lines/${id}`,
        method: 'PATCH',
        params: weekStart ? { weekStart } : undefined,
        body: data,
      }),
      transformResponse: (response: ITimesheetApiResponse<ITimesheetLine>) => response.data,
      invalidatesTags: ['Timesheet'],
    }),

    /** DELETE /api/user/timesheet/lines/:id?weekStart=YYYY-MM-DD */
    deleteTimesheetLine: builder.mutation<void, { weekStart?: string; id: string }>({
      query: ({ weekStart, id }) => ({
        url: `/api/user/timesheet/lines/${id}`,
        method: 'DELETE',
        params: weekStart ? { weekStart } : undefined,
      }),
      invalidatesTags: ['Timesheet'],
    }),

    /** GET /api/user/timesheet/approvals */
    getTimesheetApprovalHistory: builder.query<ITimesheetApprovalHistoryItem[], void>({
      query: () => '/api/user/timesheet/approvals',
      transformResponse: (response: ITimesheetApiResponse<ITimesheetApprovalHistoryItem[]>) =>
        response.data,
      providesTags: ['Timesheet'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTimesheetQuery,
  useSaveTimesheetMutation,
  useSubmitTimesheetMutation,
  useCreateTimesheetLineMutation,
  useUpdateTimesheetLineMutation,
  useDeleteTimesheetLineMutation,
  useGetTimesheetApprovalHistoryQuery,
} = timesheetApi;
