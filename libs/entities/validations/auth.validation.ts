import * as yup from 'yup';

export const SignInSchema = yup.object({
  email: yup
    .string()
    .email('Invalid email')
    .required('required')
    .matches(/@serviceops\.tech$/i, 'Email must be a @serviceops.tech address'),
  password: yup.string().required('required').min(6, 'Min 6 characters'),
});

export type SignInDto = yup.InferType<typeof SignInSchema>;

export const ChangePasswordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string().required('New password is required').min(6, 'Min 6 characters'),
  confirmNewPassword: yup
    .string()
    .required('Confirm password is required')
    .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});

export type ChangePasswordDto = yup.InferType<typeof ChangePasswordSchema>;
