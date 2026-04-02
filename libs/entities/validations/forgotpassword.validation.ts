import * as yup from 'yup';

export const ForgotPasswordSchema = yup.object({
  email: yup
    .string()
    .email('Invalid email')
    .required('required')
    .matches(/@serviceops\.tech$/i, 'Email must be a @serviceops.tech address'),
});

export const VerifyOtpSchema = yup.object({
  email: yup
    .string()
    .email('Invalid email')
    .required('required')
    .matches(/@serviceops\.tech$/i, 'Email must be a @serviceops.tech address'),
  otp: yup.string().required('required').length(6, 'OTP must be 6 characters'),
});

export const ResetPasswordSchema = yup.object({
  email: yup
    .string()
    .email('Invalid email')
    .required('required')
    .matches(/@serviceops\.tech$/i, 'Email must be a @serviceops.tech address'),
  resetToken: yup.string().required('required'),
  newPassword: yup.string().required('required').min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup
    .string()
    .required('required')
    .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});

export type ForgotPasswordDto = yup.InferType<typeof ForgotPasswordSchema>;
export type VerifyOtpDto = yup.InferType<typeof VerifyOtpSchema>;
export type ResetPasswordDto = yup.InferType<typeof ResetPasswordSchema>;
