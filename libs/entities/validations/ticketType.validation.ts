import * as yup from 'yup';

/**
 * Shared validation schema for TicketType
 * Used by Frontend (Formik) with native validationSchema support
 */
export const CreateTicketTypeSchema = yup.object({
  type: yup
    .string()
    .required('Type is required')
    .matches(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers, and underscores allowed'),
  name: yup.string().required('Name is required').max(100, 'Name must be 100 characters or less'),
  displayName: yup
    .string()
    .required('Display name is required')
    .max(100, 'Display name must be 100 characters or less')
    .default(''),
  description: yup
    .string()
    .required('Description is required')
    .max(500, 'Description must be 500 characters or less')
    .default(''),
  prefix: yup
    .string()
    .required('Prefix is required')
    .max(6, 'Prefix must be 6 characters or less')
    .matches(/^[A-Z0-9]*$/i, 'Only letters and numbers allowed')
    .default(''),
  isActive: yup.boolean().default(true),
  numberLength: yup
    .number()
    .required('Number length is required')
    .integer()
    .min(1, 'Must be at least 1')
    .max(12, 'Must be 12 or less')
    .default(7),
});

/**
 * Schema for updating a TicketType entry (all fields optional)
 */
export const UpdateTicketTypeSchema = yup.object({
  type: yup
    .string()
    .matches(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers, and underscores allowed'),
  name: yup.string().max(100, 'Name must be 100 characters or less'),
  displayName: yup.string().max(100, 'Display name must be 100 characters or less'),
  description: yup.string().max(500, 'Description must be 500 characters or less'),
  prefix: yup
    .string()
    .max(6, 'Prefix must be 6 characters or less')
    .matches(/^[A-Z0-9]*$/i, 'Only letters and numbers allowed'),
  isActive: yup.boolean(),
  numberLength: yup.number().integer().min(1, 'Must be at least 1').max(12, 'Must be 12 or less'),
});

/**
 * Schema for validating TicketType ID parameter (integer)
 */
export const TicketTypeIdSchema = yup.object({
  id: yup.number().integer().positive('Invalid ID').required(),
});

/**
 * TypeScript types derived from schemas
 */
export type CreateTicketTypeDto = yup.InferType<typeof CreateTicketTypeSchema>;
export type UpdateTicketTypeDto = yup.InferType<typeof UpdateTicketTypeSchema>;

/**
 * Response type for TicketType entity
 */
export interface TicketTypeResponseDto {
  id: number;
  type: string;
  name: string;
  displayName: string;
  description: string;
  prefix: string;
  isActive: boolean;
  numberLength: number;
}
