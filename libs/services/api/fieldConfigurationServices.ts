import {
  IFieldConfiguration,
  IFieldConfigurationListResponse,
  IFieldConfigurationResponse,
  ICreateFieldConfigurationInput,
  IUpdateFieldConfigurationInput,
} from '@serviceops/interfaces';
import { baseApi } from './baseServices';

export const fieldConfigApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFieldConfigurations: builder.query<IFieldConfiguration[], void>({
      query: () => '/api/admin/field-configurations',
      transformResponse: (response: IFieldConfigurationListResponse) => response.data,
      providesTags: ['FieldConfigurations'],
    }),
    getFieldConfigurationById: builder.query<IFieldConfiguration, number | string>({
      query: (id) => `/api/admin/field-configurations/${id}`,
      transformResponse: (response: IFieldConfigurationResponse) => response.data,
      providesTags: ['FieldConfigurations'],
    }),
    createFieldConfiguration: builder.mutation<
      IFieldConfiguration,
      ICreateFieldConfigurationInput
    >({
      query: (body) => ({
        url: '/api/admin/field-configurations',
        method: 'POST',
        body,
      }),
      transformResponse: (response: IFieldConfigurationResponse) => response.data,
      invalidatesTags: ['FieldConfigurations'],
    }),
    updateFieldConfiguration: builder.mutation<
      IFieldConfiguration,
      { id: number | string; data: IUpdateFieldConfigurationInput }
    >({
      query: ({ id, data }) => ({
        url: `/api/admin/field-configurations/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: IFieldConfigurationResponse) => response.data,
      invalidatesTags: ['FieldConfigurations'],
    }),
    deleteFieldConfiguration: builder.mutation<IFieldConfiguration, number | string>({
      query: (id) => ({
        url: `/api/admin/field-configurations/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: IFieldConfigurationResponse) => response.data,
      invalidatesTags: ['FieldConfigurations'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetFieldConfigurationsQuery,
  useGetFieldConfigurationByIdQuery,
  useCreateFieldConfigurationMutation,
  useUpdateFieldConfigurationMutation,
  useDeleteFieldConfigurationMutation,
} = fieldConfigApi;
