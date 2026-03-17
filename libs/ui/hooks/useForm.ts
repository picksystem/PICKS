import { useFormik, FormikConfig, FormikValues } from 'formik';

/**
 * Custom hook for form management using Formik
 * Provides a reusable way to create forms with validation
 *
 * @template T - Type of form values
 * @param config - Formik configuration object
 * @returns Formik instance with all form utilities
 *
 * @example
 * // Basic usage
 * const formik = useForm({
 *   initialValues: { email: '', password: '' },
 *   onSubmit: (values) => console.log(values),
 * });
 *
 * @example
 * // With Yup validation schema (recommended - native Formik support)
 * import * as yup from 'yup';
 *
 * const validationSchema = yup.object({
 *   email: yup.string().email('Invalid email').required('Email is required'),
 *   password: yup.string().min(6, 'Min 6 characters').required('Password is required'),
 * });
 *
 * const formik = useForm({
 *   initialValues: { email: '', password: '' },
 *   validationSchema,
 *   onSubmit: async (values) => {
 *     await api.login(values);
 *   },
 * });
 *
 * @example
 * // With custom validation function
 * const formik = useForm({
 *   initialValues: { username: '' },
 *   validate: (values) => {
 *     const errors: Record<string, string> = {};
 *     if (!values.username) {
 *       errors.username = 'Required';
 *     }
 *     return errors;
 *   },
 *   onSubmit: (values) => console.log(values),
 * });
 */
export function useForm<T extends FormikValues = FormikValues>(config: FormikConfig<T>) {
  // useFormik handles its own state management
  return useFormik<T>(config);
}

/**
 * Type for the return value of useForm hook
 */
export type UseFormReturn<T extends FormikValues = FormikValues> = ReturnType<typeof useFormik<T>>;
