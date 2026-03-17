/**
 * Forgot Password / OTP / Reset Password Interfaces
 * Shared between Frontend and Backend
 */

export interface IForgotPasswordInput {
  email: string;
}

export interface IForgotPasswordResponse {
  message: string;
}

export interface IVerifyOtpInput {
  email: string;
  otp: string;
}

export interface IVerifyOtpResponse {
  message: string;
  data: {
    verified: boolean;
    resetToken: string;
  };
}

export interface IResetPasswordInput {
  email: string;
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}

export interface IResetPasswordResponse {
  message: string;
}
