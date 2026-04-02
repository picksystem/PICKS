import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useForm,
  useFormWithSessionStorage,
  useNotification,
  useFieldError,
} from '@serviceops/hooks';
import { ForgotPasswordSchema, VerifyOtpSchema, ResetPasswordSchema } from '@serviceops/interfaces';
import { constants } from '@serviceops/utils';
import { useAuthActionMutation } from '@serviceops/services';

export type Step = 'email' | 'otp' | 'reset';

const useForgotPassword = () => {
  const reqError = useFieldError();
  const navigate = useNavigate();
  const notify = useNotification();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [authAction, { isLoading: isActionLoading }] = useAuthActionMutation();
  const isSendingOtp = isActionLoading && step === 'email';
  const isVerifying = isActionLoading && step === 'otp';
  const isResetting = isActionLoading && step === 'reset';

  const stepIndex = step === 'email' ? 0 : step === 'otp' ? 1 : 2;

  const emailForm = useFormWithSessionStorage('forgotPassword', {
    initialValues: { email: '' },
    validationSchema: ForgotPasswordSchema,
    onSubmit: async (values) => {
      try {
        await authAction({ action: 'forgot-password', email: values.email }).unwrap();
        setEmail(values.email);
        notify.success('OTP has been sent to your email.');
        setStep('otp');
      } catch (err: unknown) {
        const error = err as { data?: { message?: string }; message?: string };
        notify.error(error?.data?.message || error?.message || 'Failed to send OTP');
      }
    },
  });

  const otpForm = useForm({
    initialValues: { email: '', otp: '' },
    validationSchema: VerifyOtpSchema,
    onSubmit: async (values) => {
      try {
        const result = await authAction({ action: 'verify-otp', email, otp: values.otp }).unwrap();
        setResetToken(result.data.resetToken);
        notify.success('OTP verified successfully.');
        setStep('reset');
      } catch (err: unknown) {
        const error = err as { data?: { message?: string }; message?: string };
        notify.error(error?.data?.message || error?.message || 'Invalid OTP');
      }
    },
  });

  const resetForm = useForm({
    initialValues: { email: '', resetToken: '', newPassword: '', confirmPassword: '' },
    validationSchema: ResetPasswordSchema,
    onSubmit: async (values) => {
      try {
        await authAction({
          action: 'reset-password',
          email,
          resetToken,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
        }).unwrap();
        notify.success('Password reset successfully! Redirecting to sign in...');
        setTimeout(() => navigate(constants.Path.SIGNIN, { replace: true }), 2000);
      } catch (err: unknown) {
        const error = err as { data?: { message?: string }; message?: string };
        notify.error(error?.data?.message || error?.message || 'Failed to reset password');
      }
    },
  });

  return {
    step,
    setStep,
    stepIndex,
    email,
    emailForm,
    otpForm,
    resetForm,
    isSendingOtp,
    isVerifying,
    isResetting,
    showNew,
    setShowNew,
    showConfirm,
    setShowConfirm,
    reqError,
    navigate,
  };
};

export default useForgotPassword;
