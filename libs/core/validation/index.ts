import * as yup from 'yup';

// Re-export Yup for convenience
export { yup };

/**
 * Common validation patterns
 */
export const CommonSchemas = {
  // Integer ID validation
  intId: yup.number().integer().positive(),

  // Non-empty string
  nonEmptyString: yup.string().required('Field is required'),

  // Email validation
  email: yup.string().email('Invalid email address'),

  // URL validation
  url: yup.string().url('Invalid URL'),

  // Boolean validation
  boolean: yup.boolean(),

  // Pagination params
  pagination: yup.object({
    page: yup.number().integer().positive().default(1),
    limit: yup.number().integer().positive().max(100).default(10),
  }),
};

/**
 * Validate data against a schema, returning typed result or throwing
 */
export async function validate<T>(schema: yup.Schema<T>, data: unknown): Promise<T> {
  return schema.validate(data, { abortEarly: false, stripUnknown: true });
}

/**
 * Synchronously validate data against a schema
 */
export function validateSync<T>(schema: yup.Schema<T>, data: unknown): T {
  return schema.validateSync(data, { abortEarly: false, stripUnknown: true });
}

/**
 * Check if data is valid without throwing
 */
export async function isValid<T>(schema: yup.Schema<T>, data: unknown): Promise<boolean> {
  return schema.isValid(data);
}
