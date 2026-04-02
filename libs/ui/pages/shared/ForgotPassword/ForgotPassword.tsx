import { Box, Typography, Paper } from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import LockResetIcon from '@mui/icons-material/LockReset';
import { constants } from '@serviceops/utils';
import { useStyles } from './styles';
import useForgotPassword from './hooks/useForgotPassword';
import StepProgress from './components/StepProgress';
import EmailStep from './components/EmailStep';
import OtpStep from './components/OtpStep';
import ResetStep from './components/ResetStep';
import LeftPanel from './components/LeftPanel';

function getForgotPasswordStyle(): 'old' | 'new' {
  try {
    const saved = localStorage.getItem('serivceops_page_styles');
    if (saved) return (JSON.parse(saved)?.forgotPassword as 'old' | 'new') || 'new';
  } catch {
    /* ignore */
  }
  return 'new';
}

const ForgotPassword = () => {
  const { classes } = useStyles();
  const {
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
    navigate,
  } = useForgotPassword();
  const pageStyle = getForgotPasswordStyle();

  const stepTitles: Record<typeof step, string> = {
    email: 'Forgot your password?',
    otp: 'Check your inbox',
    reset: 'Create new password',
  };
  const stepSubtitles: Record<typeof step, string> = {
    email: "Enter your work email and we'll send you a recovery code",
    otp: `We sent a 6-digit code to ${email}`,
    reset: 'Choose a strong password to secure your account',
  };

  if (pageStyle === 'old') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'background.default',
          px: 2,
        }}
      >
        <Paper elevation={3} sx={{ width: '100%', maxWidth: 440, borderRadius: 3, p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <MailOutlineIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant='h5' fontWeight={700}>
              Forgot Password
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Enter your email to receive a recovery code
            </Typography>
          </Box>

          {step === 'email' && <EmailStep form={emailForm} isSendingOtp={isSendingOtp} />}
          {step === 'otp' && (
            <OtpStep
              email={email}
              form={otpForm}
              isVerifying={isVerifying}
              emailChipClass=''
              onResend={() => setStep('email')}
            />
          )}
          {step === 'reset' && (
            <ResetStep
              form={resetForm}
              isResetting={isResetting}
              showNew={showNew}
              showConfirm={showConfirm}
              onToggleNew={() => setShowNew((v) => !v)}
              onToggleConfirm={() => setShowConfirm((v) => !v)}
            />
          )}

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant='body2' color='text.secondary'>
              Remember your password?{' '}
              <Typography
                component='span'
                variant='body2'
                sx={{
                  color: 'primary.main',
                  cursor: 'pointer',
                  fontWeight: 600,
                  '&:hover': { textDecoration: 'underline' },
                }}
                onClick={() => navigate(constants.Path.SIGNIN)}
              >
                Sign in
              </Typography>
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box className={classes.pageWrapper}>
      <LeftPanel
        step={step}
        stepIndex={stepIndex}
        classes={classes}
        onNavigateSignIn={() => navigate(constants.Path.SIGNIN)}
      />

      <Box className={classes.rightPanel}>
        <Box className={classes.bgShape1} />
        <Box className={classes.bgShape2} />

        <Box className={classes.formCard}>
          <Box className={classes.cardHeader}>
            <Box className={classes.formBadge}>
              {step === 'email' ? (
                <MailOutlineIcon sx={{ fontSize: 30, color: '#fff' }} />
              ) : step === 'otp' ? (
                <MarkEmailReadIcon sx={{ fontSize: 30, color: '#fff' }} />
              ) : (
                <LockResetIcon sx={{ fontSize: 30, color: '#fff' }} />
              )}
            </Box>
          </Box>

          <Box className={classes.formBody}>
            <StepProgress step={step} classes={classes} />

            <Typography variant='h6' fontWeight={700} sx={{ textAlign: 'center', mb: 0.5 }}>
              {stepTitles[step]}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ textAlign: 'center', mb: 3 }}>
              {stepSubtitles[step]}
            </Typography>

            {step === 'email' && <EmailStep form={emailForm} isSendingOtp={isSendingOtp} />}
            {step === 'otp' && (
              <OtpStep
                email={email}
                form={otpForm}
                isVerifying={isVerifying}
                emailChipClass={classes.emailChip}
                onResend={() => setStep('email')}
              />
            )}
            {step === 'reset' && (
              <ResetStep
                form={resetForm}
                isResetting={isResetting}
                showNew={showNew}
                showConfirm={showConfirm}
                onToggleNew={() => setShowNew((v) => !v)}
                onToggleConfirm={() => setShowConfirm((v) => !v)}
              />
            )}

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant='body2' color='text.secondary'>
                Remember your password?{' '}
                <Typography
                  component='span'
                  variant='body2'
                  sx={{
                    color: 'primary.main',
                    cursor: 'pointer',
                    fontWeight: 600,
                    '&:hover': { textDecoration: 'underline' },
                  }}
                  onClick={() => navigate(constants.Path.SIGNIN)}
                >
                  Sign in
                </Typography>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ForgotPassword;
