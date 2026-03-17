import * as yup from 'yup';

export const SignUpSchema = yup.object({
  firstName: yup
    .string()
    .required('required')
    .min(2, 'First name must be at least 2 characters'),
  lastName: yup
    .string()
    .required('required')
    .min(2, 'Last name must be at least 2 characters'),
  email: yup.string().email('Invalid email').required('required'),
  phone: yup
    .string()
    .matches(/^[\d\s+\-()]*$/, 'Phone number must contain only numbers')
    .optional()
    .nullable(),
  workLocation: yup.string().required('required'),
  department: yup.string().optional().nullable(),
  reasonForAccess: yup.string().required('required'),
  employeeId: yup
    .string()
    .matches(/^\d*$/, 'Employee ID must be numeric')
    .optional(),
  businessUnit: yup.string().optional(),
  managerName: yup.string().required('required'),
  password: yup
    .string()
    .required('required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup
    .string()
    .required('required')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  role: yup
    .string()
    .required('required')
    .oneOf(['user', 'consultant', 'admin'], 'Role must be user, consultant, or admin'),
  // Auto-detected locale fields — optional, sent silently from the browser
  timezone: yup.string().optional().nullable(),
  language: yup.string().optional().nullable(),
  dateFormat: yup.string().optional().nullable(),
  timeFormat: yup.string().optional().nullable(),
  slaWorkingCalendar: yup.string().optional().nullable(),
  slaExceptionGroup: yup.string().optional().nullable(),
});

export type SignUpDto = yup.InferType<typeof SignUpSchema>;
