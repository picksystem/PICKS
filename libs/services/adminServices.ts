import {
  IConfiguration,
  IConfigurationData,
  IConfigurationResponse,
  ITicketType,
  ITicketTypeListResponse,
  ITicketTypeResponse,
  ICreateTicketTypeInput,
  IUpdateTicketTypeInput,
  IIncident,
  IIncidentListResponse,
  IIncidentResponse,
  ICreateIncidentInput,
  IUpdateIncidentInput,
  IIncidentComment,
  ICommentListResponse,
  ICommentResponse,
  ICreateCommentInput,
  ITimeEntry,
  ITimeEntryListResponse,
  ITimeEntryResponse,
  ICreateTimeEntryInput,
  IResolution,
  IResolutionListResponse,
  IResolutionResponse,
  ICreateResolutionInput,
  IActivityLog,
  IActivityLogListResponse,
  IAdminControls,
  IUpdateAdminControlsInput,
  IAdminControlsResponse,
  IServiceRequest,
  IServiceRequestListResponse,
  IServiceRequestResponse,
  ICreateServiceRequestInput,
  IUpdateServiceRequestInput,
  IAdvisoryRequest,
  IAdvisoryRequestListResponse,
  IAdvisoryRequestResponse,
  ICreateAdvisoryRequestInput,
  IUpdateAdvisoryRequestInput,
} from '@picks/interfaces';
import { baseApi } from './baseServices';

/** Unified create-ticket input — ticketType discriminates which entity is created */
export interface ICreateTicketInput {
  ticketType: string;
  number?: string;
  client?: string;
  caller: string;
  callerPhone?: string;
  callerEmail?: string;
  callerLocation?: string;
  callerDepartment?: string;
  callerReportingManager?: string;
  additionalContacts?: string;
  businessCategory?: string;
  serviceLine?: string;
  application?: string;
  applicationCategory?: string;
  applicationSubCategory?: string;
  shortDescription?: string;
  description?: string;
  impact?: string;
  urgency?: string;
  priority?: string;
  channel?: string;
  status?: string;
  assignmentGroup?: string;
  primaryResource?: string;
  secondaryResources?: string;
  createdBy: string;
  isRecurring?: boolean;
  isMajor?: boolean;
  notes?: string;
  relatedRecords?: string;
  attachments?: string;
  draftExpiresAt?: string;
}

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Ticket Type endpoints
    getTicketType: builder.query<ITicketType[], void>({
      query: () => '/api/admin/ticket-type',
      transformResponse: (response: ITicketTypeListResponse) => response.data,
      providesTags: ['TicketType'],
    }),
    getTicketTypeById: builder.query<ITicketType, number | string>({
      query: (id) => `/api/admin/ticket-type/${id}`,
      transformResponse: (response: ITicketTypeResponse) => response.data,
      providesTags: ['TicketType'],
    }),
    createTicketType: builder.mutation<ITicketType, ICreateTicketTypeInput>({
      query: (body) => ({
        url: '/api/admin/ticket-type',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ITicketTypeResponse) => response.data,
      invalidatesTags: ['TicketType', 'Configuration'],
    }),
    updateTicketType: builder.mutation<
      ITicketType,
      { id: number | string; data: IUpdateTicketTypeInput }
    >({
      query: ({ id, data }) => ({
        url: `/api/admin/ticket-type/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ITicketTypeResponse) => response.data,
      invalidatesTags: ['TicketType', 'Configuration'],
    }),
    deleteTicketType: builder.mutation<ITicketType, number | string>({
      query: (id) => ({
        url: `/api/admin/ticket-type/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ITicketTypeResponse) => response.data,
      invalidatesTags: ['TicketType', 'Configuration'],
    }),

    // Incident endpoints
    getIncidents: builder.query<IIncident[], void>({
      query: () => '/api/admin/incidents',
      transformResponse: (response: IIncidentListResponse) => response.data,
    }),
    getDraftIncidents: builder.query<IIncident[], void>({
      query: () => '/api/admin/incidents/drafts',
      transformResponse: (response: IIncidentListResponse) => response.data,
    }),
    getIncidentById: builder.query<IIncident, number | string>({
      query: (id) => `/api/admin/incidents/${id}`,
      transformResponse: (response: IIncidentResponse) => response.data,
    }),
    getIncidentByNumber: builder.query<IIncident, string>({
      query: (number) => `/api/admin/incidents/number/${number}`,
      transformResponse: (response: IIncidentResponse) => response.data,
    }),
    uploadAttachments: builder.mutation<string[], FormData>({
      query: (formData) => ({
        url: '/api/admin/incidents/attachments/upload',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response: { data: string[] }) => response.data,
    }),
    createIncident: builder.mutation<IIncident, ICreateIncidentInput>({
      query: (body) => ({
        url: '/api/admin/incidents',
        method: 'POST',
        body,
      }),
      transformResponse: (response: IIncidentResponse) => response.data,
    }),
    updateIncident: builder.mutation<
      IIncident,
      { id: number | string; data: IUpdateIncidentInput }
    >({
      query: ({ id, data }) => ({
        url: `/api/admin/incidents/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: IIncidentResponse) => response.data,
    }),
    deleteIncident: builder.mutation<IIncident, number | string>({
      query: (id) => ({
        url: `/api/admin/incidents/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: IIncidentResponse) => response.data,
    }),

    // Comment endpoints
    getComments: builder.query<IIncidentComment[], number>({
      query: (incidentId) => `/api/admin/incidents/${incidentId}/comments`,
      transformResponse: (response: ICommentListResponse) => response.data,
    }),
    createComment: builder.mutation<IIncidentComment, ICreateCommentInput>({
      query: (body) => ({
        url: `/api/admin/incidents/${body.incidentId}/comments`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: ICommentResponse) => response.data,
    }),

    // Time Entry endpoints
    getTimeEntries: builder.query<ITimeEntry[], number>({
      query: (incidentId) => `/api/admin/incidents/${incidentId}/time-entries`,
      transformResponse: (response: ITimeEntryListResponse) => response.data,
    }),
    createTimeEntry: builder.mutation<ITimeEntry, ICreateTimeEntryInput>({
      query: (body) => ({
        url: `/api/admin/incidents/${body.incidentId}/time-entries`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: ITimeEntryResponse) => response.data,
    }),

    // Resolution endpoints
    getResolutions: builder.query<IResolution[], number>({
      query: (incidentId) => `/api/admin/incidents/${incidentId}/resolutions`,
      transformResponse: (response: IResolutionListResponse) => response.data,
    }),
    createResolution: builder.mutation<IResolution, ICreateResolutionInput>({
      query: (body) => ({
        url: `/api/admin/incidents/${body.incidentId}/resolutions`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: IResolutionResponse) => response.data,
    }),

    // Activity endpoints
    getActivities: builder.query<IActivityLog[], number>({
      query: (incidentId) => `/api/admin/incidents/${incidentId}/activities`,
      transformResponse: (response: IActivityLogListResponse) => response.data,
    }),

    // Service Request endpoints
    getServiceRequests: builder.query<IServiceRequest[], void>({
      query: () => '/api/admin/service-requests',
      transformResponse: (response: IServiceRequestListResponse) => response.data,
    }),
    getDraftServiceRequests: builder.query<IServiceRequest[], void>({
      query: () => '/api/admin/service-requests/drafts',
      transformResponse: (response: IServiceRequestListResponse) => response.data,
    }),
    getServiceRequestById: builder.query<IServiceRequest, number | string>({
      query: (id) => `/api/admin/service-requests/${id}`,
      transformResponse: (response: IServiceRequestResponse) => response.data,
    }),
    getServiceRequestByNumber: builder.query<IServiceRequest, string>({
      query: (number) => `/api/admin/service-requests/number/${number}`,
      transformResponse: (response: IServiceRequestResponse) => response.data,
    }),
    uploadServiceRequestAttachments: builder.mutation<string[], FormData>({
      query: (formData) => ({
        url: '/api/admin/service-requests/attachments/upload',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response: { data: string[] }) => response.data,
    }),
    createServiceRequest: builder.mutation<IServiceRequest, ICreateServiceRequestInput>({
      query: (body) => ({
        url: '/api/admin/service-requests',
        method: 'POST',
        body,
      }),
      transformResponse: (response: IServiceRequestResponse) => response.data,
    }),
    updateServiceRequest: builder.mutation<
      IServiceRequest,
      { id: number | string; data: IUpdateServiceRequestInput }
    >({
      query: ({ id, data }) => ({
        url: `/api/admin/service-requests/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: IServiceRequestResponse) => response.data,
    }),
    deleteServiceRequest: builder.mutation<IServiceRequest, number | string>({
      query: (id) => ({
        url: `/api/admin/service-requests/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: IServiceRequestResponse) => response.data,
    }),

    // Advisory Request endpoints
    getAdvisoryRequests: builder.query<IAdvisoryRequest[], void>({
      query: () => '/api/admin/advisory-requests',
      transformResponse: (response: IAdvisoryRequestListResponse) => response.data,
    }),
    getDraftAdvisoryRequests: builder.query<IAdvisoryRequest[], void>({
      query: () => '/api/admin/advisory-requests/drafts',
      transformResponse: (response: IAdvisoryRequestListResponse) => response.data,
    }),
    getAdvisoryRequestById: builder.query<IAdvisoryRequest, number | string>({
      query: (id) => `/api/admin/advisory-requests/${id}`,
      transformResponse: (response: IAdvisoryRequestResponse) => response.data,
    }),
    getAdvisoryRequestByNumber: builder.query<IAdvisoryRequest, string>({
      query: (number) => `/api/admin/advisory-requests/number/${number}`,
      transformResponse: (response: IAdvisoryRequestResponse) => response.data,
    }),
    uploadAdvisoryRequestAttachments: builder.mutation<string[], FormData>({
      query: (formData) => ({
        url: '/api/admin/advisory-requests/attachments/upload',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response: { data: string[] }) => response.data,
    }),
    createAdvisoryRequest: builder.mutation<IAdvisoryRequest, ICreateAdvisoryRequestInput>({
      query: (body) => ({
        url: '/api/admin/advisory-requests',
        method: 'POST',
        body,
      }),
      transformResponse: (response: IAdvisoryRequestResponse) => response.data,
    }),
    updateAdvisoryRequest: builder.mutation<
      IAdvisoryRequest,
      { id: number | string; data: IUpdateAdvisoryRequestInput }
    >({
      query: ({ id, data }) => ({
        url: `/api/admin/advisory-requests/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: IAdvisoryRequestResponse) => response.data,
    }),
    deleteAdvisoryRequest: builder.mutation<IAdvisoryRequest, number | string>({
      query: (id) => ({
        url: `/api/admin/advisory-requests/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: IAdvisoryRequestResponse) => response.data,
    }),

    // Unified Ticket endpoints (single API for all ticket types)
    getTicketByNumber: builder.query<(IIncident | IServiceRequest | IAdvisoryRequest) & { ticketType: string }, string>({
      query: (number) => `/api/admin/tickets/${number}`,
      transformResponse: (response: { data: (IIncident | IServiceRequest | IAdvisoryRequest) & { ticketType: string } }) =>
        response.data,
    }),
    createTicket: builder.mutation<IIncident | IServiceRequest | IAdvisoryRequest, ICreateTicketInput>({
      query: (body) => ({
        url: '/api/admin/tickets',
        method: 'POST',
        body,
      }),
      transformResponse: (response: { data: IIncident | IServiceRequest | IAdvisoryRequest }) =>
        response.data,
    }),
    uploadTicketAttachments: builder.mutation<string[], FormData>({
      query: (formData) => ({
        url: '/api/admin/tickets/attachments/upload',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response: { data: string[] }) => response.data,
    }),

    // Configuration endpoints (unified configuration API)
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
    updateConfigurationSection: builder.mutation<
      IConfiguration,
      { section: keyof IConfigurationData; value: IConfigurationData[keyof IConfigurationData] }
    >({
      query: ({ section, value }) => ({
        url: `/api/admin/configuration/${section}`,
        method: 'PATCH',
        body: { value },
      }),
      transformResponse: (response: IConfigurationResponse) => response.data,
      invalidatesTags: ['Configuration'],
    }),

    // AdminControls endpoints
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
  useDeleteTicketTypeMutation,
  // Incident hooks
  useUploadAttachmentsMutation,
  useGetIncidentsQuery,
  useGetDraftIncidentsQuery,
  useGetIncidentByIdQuery,
  useGetIncidentByNumberQuery,
  useCreateIncidentMutation,
  useUpdateIncidentMutation,
  useDeleteIncidentMutation,
  // Comment hooks
  useGetCommentsQuery,
  useCreateCommentMutation,
  // Time Entry hooks
  useGetTimeEntriesQuery,
  useCreateTimeEntryMutation,
  // Resolution hooks
  useGetResolutionsQuery,
  useCreateResolutionMutation,
  // Activity hooks
  useGetActivitiesQuery,
  // Service Request hooks
  useGetServiceRequestsQuery,
  useGetDraftServiceRequestsQuery,
  useGetServiceRequestByIdQuery,
  useGetServiceRequestByNumberQuery,
  useUploadServiceRequestAttachmentsMutation,
  useCreateServiceRequestMutation,
  useUpdateServiceRequestMutation,
  useDeleteServiceRequestMutation,
  // Advisory Request hooks
  useGetAdvisoryRequestsQuery,
  useGetDraftAdvisoryRequestsQuery,
  useGetAdvisoryRequestByIdQuery,
  useGetAdvisoryRequestByNumberQuery,
  useUploadAdvisoryRequestAttachmentsMutation,
  useCreateAdvisoryRequestMutation,
  useUpdateAdvisoryRequestMutation,
  useDeleteAdvisoryRequestMutation,
  // Unified Ticket hooks
  useGetTicketByNumberQuery,
  useCreateTicketMutation,
  useUploadTicketAttachmentsMutation,
  // AdminControls hooks
  useGetAdminControlsQuery,
  useUpdateAdminControlsMutation,
  // Configuration hooks
  useGetConfigurationQuery,
  useUpdateConfigurationMutation,
  useUpdateConfigurationSectionMutation,
} = adminApi;
