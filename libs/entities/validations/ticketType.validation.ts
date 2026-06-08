import * as yup from 'yup';

/**
 * Shared validation schema for TicketType
 * Used by Frontend (Formik) with native validationSchema support
 */
export const CreateTicketTypeSchema = yup.object({
  type: yup
    .string()
    .required('Type is required')
    .max(25, 'Type must be 25 characters or less')
    .matches(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers, and underscores allowed'),
  name: yup.string().required('Name is required').max(25, 'Name must be 25 characters or less'),
  displayName: yup
    .string()
    .required('Display text is required')
    .max(60, 'Display text must be 60 characters or less')
    .default(''),
  displayTag: yup.string().max(40, 'Display tag must be 40 characters or less').default(''),
  shortDescription: yup
    .string()
    .transform((value) => {
      if (
        value &&
        typeof value === 'object' &&
        'segments' in value &&
        Array.isArray(value.segments)
      ) {
        return value.segments?.[0]?.text || '';
      }
      return value || '';
    })
    .default(''),
  description: yup
    .string()
    .transform((value) => {
      if (
        value &&
        typeof value === 'object' &&
        'segments' in value &&
        Array.isArray(value.segments)
      ) {
        return value.segments?.[0]?.text || '';
      }
      return value || '';
    })
    .max(60, 'Description must be 60 characters or less')
    .default(''),
  iconKey: yup.string().required('Icon is required').default('warning_amber'),
  tag: yup.string().default('Standard'),
  prefix: yup
    .string()
    .required('Numbering Prefix is required')
    .max(6, 'Prefix must be 6 characters or less')
    .matches(/^[A-Z0-9]*$/i, 'Only letters and numbers allowed')
    .default(''),
  isActive: yup.boolean().default(true),
  numberLength: yup
    .number()
    .required('Number length is required')
    .integer()
    .min(3, 'Must be between 3 and 9')
    .max(9, 'Must be between 3 and 9')
    .default(7),
  accessControl: yup
    .array()
    .of(yup.string().required())
    .min(1, 'At least one role must be selected')
    .default(['admin', 'consultant', 'endUser']),
});

/**
 * Schema for updating a TicketType entry (all fields optional)
 */
export const UpdateTicketTypeSchema = yup.object({
  type: yup
    .string()
    .max(25, 'Type must be 25 characters or less')
    .matches(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers, and underscores allowed'),
  name: yup.string().max(25, 'Name must be 25 characters or less'),
  displayName: yup.string().max(60, 'Display text must be 60 characters or less'),
  displayTag: yup.string().max(40, 'Display tag must be 40 characters or less'),
  shortDescription: yup.string(),
  description: yup.string().max(60, 'Description must be 60 characters or less'),
  prefix: yup
    .string()
    .max(6, 'Prefix must be 6 characters or less')
    .matches(/^[A-Z0-9]*$/i, 'Only letters and numbers allowed'),
  isActive: yup.boolean(),
  numberLength: yup
    .number()
    .integer()
    .min(3, 'Must be between 3 and 9')
    .max(9, 'Must be between 3 and 9'),
  accessControl: yup
    .array()
    .of(yup.string().required())
    .min(1, 'At least one role must be selected'),
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
