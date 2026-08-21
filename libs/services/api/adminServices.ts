import {
  IConfiguration,
  IConfigurationData,
  IConfigurationResponse,
  IAdminTicket,
  IAdminTicketComment,
  IAdminTicketTimeEntry,
  IAdminTicketResolution,
  IAdminTicketActivity,
  IAdminControls,
  IUpdateAdminControlsInput,
  IAdminControlsResponse,
} from '@serviceops/interfaces';
import { baseApi } from './baseServices';

/** Identifies a ticket for generic sub-resource endpoints */
export interface ITicketRef {
  ticketType: string;
  ticketId: number;
}

/** Params for generic list endpoints */
export interface ITicketListParams {
  ticketType?: string;
}

/** Params for generic get-by-id / update / delete */
export interface ITicketIdParams {
  ticketType: string;
  id: number;
}

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // =============================================
    // TICKET TYPE endpoints (from configuration)
    // =============================================
    getTicketType: builder.query<any[], void>({
      query: () => '/api/admin/ticket-type',
      transformResponse: (response: any) => response.data,
      providesTags: ['TicketType'],
    }),
    getTicketTypeById: builder.query<any, number | string>({
      query: (id) => `/api/admin/ticket-type/${id}`,
      transformResponse: (response: any) => response.data,
      providesTags: ['TicketType'],
    }),
    createTicketType: builder.mutation<any, any>({
      query: (body) => ({
        url: '/api/admin/ticket-type',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ['TicketType', 'Configuration'],
    }),
    updateTicketType: builder.mutation<any, { id: number | string; data: any }>({
      query: ({ id, data }) => ({
        url: `/api/admin/ticket-type/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ['TicketType', 'Configuration'],
    }),
    deleteTicketType: builder.mutation<any, number | string>({
      query: (id) => ({
        url: `/api/admin/ticket-type/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ['TicketType', 'Configuration'],
    }),
    reorderTicketTypes: builder.mutation<void, { id: number; displayOrder: number }[]>({
      query: (orders) => ({
        url: '/api/admin/ticket-type/reorder',
        method: 'PATCH',
        body: { orders },
      }),
      invalidatesTags: ['TicketType'],
    }),

    // =============================================
    // GENERIC TICKET CRUD endpoints (dynamic by ticketType)
    // =============================================

    /** Get tickets — optionally filter by ticketType query param */
    getTickets: builder.query<IAdminTicket[], ITicketListParams | void>({
      query: (params) => {
        if (params?.ticketType) {
          return `/api/admin/tickets?ticketType=${params.ticketType}`;
        }
        return '/api/admin/tickets';
      },
      transformResponse: (response: { data: IAdminTicket[] }) => response.data,
      providesTags: ['Ticket'],
    }),

    /** Get ticket by ID — requires ticketType in params */
    getTicketById: builder.query<IAdminTicket, ITicketIdParams>({
      query: ({ ticketType, id }) => `/api/admin/tickets/id/${id}?ticketType=${ticketType}`,
      transformResponse: (response: { data: IAdminTicket }) => response.data,
      providesTags: ['Ticket'],
    }),

    /** Get ticket by number — auto-detects type from prefix */
    getTicketByNumber: builder.query<IAdminTicket & { ticketType: string }, string>({
      query: (number) => `/api/admin/tickets/${number}`,
      transformResponse: (response: { data: IAdminTicket & { ticketType: string } }) =>
        response.data,
      providesTags: ['Ticket'],
    }),

    /** Create ticket — ticketType in body determines the entity type */
    createTicket: builder.mutation<IAdminTicket, IAdminTicket>({
      query: (body) => ({
        url: '/api/admin/tickets',
        method: 'POST',
        body,
      }),
      transformResponse: (response: { data: IAdminTicket }) => response.data,
      invalidatesTags: ['Ticket'],
    }),

    /** Update ticket — ticketType + id required */
    updateTicket: builder.mutation<
      IAdminTicket,
      ITicketIdParams & { data: Record<string, unknown> }
    >({
      query: ({ ticketType, id, data }) => ({
        url: `/api/admin/tickets/id/${id}?ticketType=${ticketType}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: { data: IAdminTicket }) => response.data,
      invalidatesTags: ['Ticket'],
    }),

    /** Delete ticket — ticketType required */
    deleteTicket: builder.mutation<IAdminTicket, ITicketIdParams>({
      query: ({ ticketType, id }) => ({
        url: `/api/admin/tickets/id/${id}?ticketType=${ticketType}`,
        method: 'DELETE',
      }),
      transformResponse: (response: { data: IAdminTicket }) => response.data,
      invalidatesTags: ['Ticket'],
    }),

    /** Get drafts — optionally filter by ticketType */
    getDraftTickets: builder.query<IAdminTicket[], ITicketListParams | void>({
      query: (params) => {
        if (params?.ticketType) {
          return `/api/admin/tickets/drafts?ticketType=${params.ticketType}`;
        }
        return '/api/admin/tickets/drafts';
      },
      transformResponse: (response: { data: IAdminTicket[] }) => response.data,
      providesTags: ['Ticket'],
    }),

    /** Upload ticket attachments */
    uploadTicketAttachments: builder.mutation<string[], FormData>({
      query: (formData) => ({
        url: '/api/admin/tickets/attachments/upload',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response: { data: string[] }) => response.data,
    }),

    // =============================================
    // GENERIC SUB-RESOURCE endpoints (dynamic by ticketType)
    // =============================================
    getTicketComments: builder.query<IAdminTicketComment[], ITicketRef>({
      query: ({ ticketId }) => `/api/admin/tickets/${ticketId}/comments`,
      transformResponse: (response: { data: IAdminTicketComment[] }) => response.data,
      providesTags: (result, _err, { ticketId }) => [{ type: 'TicketComments', id: ticketId }],
    }),
    updateTicketComment: builder.mutation<
      IAdminTicketComment,
      {
        ticketId: number;
        commentId: number;
        message?: string;
        isPinned?: boolean;
        isSaved?: boolean;
      }
    >({
      query: ({ ticketId, commentId, ...body }) => ({
        url: `/api/admin/tickets/${ticketId}/comments/${commentId}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: { data: IAdminTicketComment }) => response.data,
      invalidatesTags: (result, _err, { ticketId }) => [{ type: 'TicketComments', id: ticketId }],
    }),
    createTicketComment: builder.mutation<
      IAdminTicketComment,
      ITicketRef & {
        subject: string;
        message: string;
        isInternal?: boolean;
        isSelfNote?: boolean;
        notifyAssigneesOnly?: boolean;
        isEmail?: boolean;
        status?: string;
        attachments?: string;
        createdBy: string;
      }
    >({
      query: ({ ticketId, ...body }) => ({
        url: `/api/admin/tickets/${ticketId}/comments`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: { data: IAdminTicketComment }) => response.data,
      invalidatesTags: (result, _err, { ticketId }) => [
        { type: 'TicketComments', id: ticketId },
        'Ticket',
      ],
    }),

    getTicketTimeEntries: builder.query<IAdminTicketTimeEntry[], ITicketRef>({
      query: ({ ticketId }) => `/api/admin/tickets/${ticketId}/time-entries`,
      transformResponse: (response: { data: IAdminTicketTimeEntry[] }) => response.data,
      providesTags: (result, _err, { ticketId }) => [{ type: 'TicketTimeEntries', id: ticketId }],
    }),
    createTicketTimeEntry: builder.mutation<
      IAdminTicketTimeEntry,
      ITicketRef & {
        date: string;
        hours: number;
        minutes: number;
        billingCode?: string;
        activityTask?: string;
        externalComment?: string;
        internalComment?: string;
        isNonBillable?: boolean;
        attachments?: string;
        createdBy: string;
      }
    >({
      query: ({ ticketId, ...body }) => ({
        url: `/api/admin/tickets/${ticketId}/time-entries`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: { data: IAdminTicketTimeEntry }) => response.data,
      invalidatesTags: (result, _err, { ticketId }) => [
        { type: 'TicketTimeEntries', id: ticketId },
        'Ticket',
      ],
    }),

    getTicketResolutions: builder.query<IAdminTicketResolution[], ITicketRef>({
      query: ({ ticketId }) => `/api/admin/tickets/${ticketId}/resolutions`,
      transformResponse: (response: { data: IAdminTicketResolution[] }) => response.data,
      providesTags: (result, _err, { ticketId }) => [{ type: 'TicketResolutions', id: ticketId }],
    }),
    createTicketResolution: builder.mutation<
      IAdminTicketResolution,
      ITicketRef & {
        application?: string;
        category?: string;
        subCategory?: string;
        customerConfirmation?: boolean;
        isRecurring?: boolean;
        rootCauseIdentified?: boolean;
        rootCause?: string;
        resolutionCode: string;
        resolution: string;
        internalNote?: string;
        attachments?: string;
        createdBy: string;
      }
    >({
      query: ({ ticketId, ...body }) => ({
        url: `/api/admin/tickets/${ticketId}/resolutions`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: { data: IAdminTicketResolution }) => response.data,
      invalidatesTags: (result, _err, { ticketId }) => [
        { type: 'TicketResolutions', id: ticketId },
        'Ticket',
      ],
    }),

    getTicketActivities: builder.query<IAdminTicketActivity[], ITicketRef>({
      query: ({ ticketId }) => `/api/admin/tickets/${ticketId}/activities`,
      transformResponse: (response: { data: IAdminTicketActivity[] }) => response.data,
    }),

    // =============================================
    // CONFIGURATION endpoints (unified configuration API)
    // =============================================
    getConfiguration: builder.query<IConfiguration, void>({
      query: () => '/api/admin/configuration',
      transformResponse: (response: IConfigurationResponse) => response.data,
      providesTags: ['Configuration'],
    }),
    updateConfiguration: builder.mutation<IConfiguration, IConfigurationData>({
      query: (data) => ({
        url: '/api/admin/configuration',
        method: 'PUT',
        body: { data },
      }),
      transformResponse: (response: IConfigurationResponse) => response.data,
      invalidatesTags: ['Configuration'],
    }),
    updateConfigurationSection: builder.mutation<IConfiguration, { section: string; value: any }>({
      query: ({ section, value }) => ({
        url: `/api/admin/configuration/${section}`,
        method: 'PATCH',
        body: { value },
      }),
      transformResponse: (response: IConfigurationResponse) => response.data,
      invalidatesTags: ['Configuration'],
    }),

    // =============================================
    // ADMIN CONTROLS endpoints
    // =============================================
    getAdminControls: builder.query<IAdminControls, void>({
      query: () => '/api/admin/controls',
      transformResponse: (response: IAdminControlsResponse) => response.data,
      providesTags: ['AdminControls'],
    }),
    updateAdminControls: builder.mutation<IAdminControls, IUpdateAdminControlsInput>({
      query: (body) => ({
        url: '/api/admin/controls',
        method: 'PUT',
        body,
      }),
      transformResponse: (response: IAdminControlsResponse) => response.data,
      invalidatesTags: ['AdminControls'],
    }),
  }),
  overrideExisting: false,
});

// Named exports of hooks
export const {
  // Ticket Type hooks
  useGetTicketTypeQuery,
  useGetTicketTypeByIdQuery,
  useCreateTicketTypeMutation,
  useUpdateTicketTypeMutation,
  useReorderTicketTypesMutation,
  useDeleteTicketTypeMutation,
  // Generic Ticket CRUD hooks
  useGetTicketsQuery,
  useGetTicketByIdQuery,
  useGetTicketByNumberQuery,
  useCreateTicketMutation,
  useUpdateTicketMutation,
  useDeleteTicketMutation,
  useGetDraftTicketsQuery,
  useUploadTicketAttachmentsMutation,
  // Generic ticket sub-resource hooks (comments/time-entries/resolutions/activities
  // across incident/service_request/advisory_request)
  useGetTicketCommentsQuery,
  useCreateTicketCommentMutation,
  useUpdateTicketCommentMutation,
  useGetTicketTimeEntriesQuery,
  useCreateTicketTimeEntryMutation,
  useGetTicketResolutionsQuery,
  useCreateTicketResolutionMutation,
  useGetTicketActivitiesQuery,
  // AdminControls hooks
  useGetAdminControlsQuery,
  useUpdateAdminControlsMutation,
  // Configuration hooks
  useGetConfigurationQuery,
  useUpdateConfigurationMutation,
  useUpdateConfigurationSectionMutation,
} = adminApi;
