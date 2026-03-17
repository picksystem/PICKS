import * as yup from 'yup';

/**
 * Schema for creating a new UserNotFound entry
 */
export const CreateNotFoundSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .max(100, 'Name must be 100 characters or less'),
  age: yup
    .number()
    .integer('Age must be an integer')
    .min(0, 'Age must be positive')
    .max(150, 'Age must be realistic')
    .required('Age is required'),
});

/**
 * Schema for updating a UserNotFound entry (all fields optional)
 */
export const UpdateNotFoundSchema = yup.object({
  name: yup.string().max(100, 'Name must be 100 characters or less'),
  age: yup
    .number()
    .integer('Age must be an integer')
    .min(0, 'Age must be positive')
    .max(150, 'Age must be realistic'),
});

/**
 * Schema for validating NotFound ID parameter
 */
export const NotFoundIdSchema = yup.object({
  id: yup.string().required('Invalid ID format'),
});

/**
 * TypeScript types derived from schemas
 */
export type CreateNotFoundDto = yup.InferType<typeof CreateNotFoundSchema>;
export type UpdateNotFoundDto = yup.InferType<typeof UpdateNotFoundSchema>;

/**
 * Response type for UserNotFound entity
 */
export interface NotFoundResponseDto {
  id: string;
  name: string;
  age: number;
}
