import { Box, Typography, Divider, Paper } from '@mui/material';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import { constants } from '@serviceops/utils';
import { useStyles } from './styles';
import useSignIn from './hooks/useSignIn';
import SignInForm from './components/SignInForm';
import LeftPanel from './components/LeftPanel';

function getSignInStyle(): 'old' | 'new' {
  try {
    const saved = localStorage.getItem('serivceops_page_styles');
    if (saved) return (JSON.parse(saved)?.signIn as 'old' | 'new') || 'new';
  } catch {
    /* ignore */
  }
  return 'new';
}

const SignIn = () => {
  const { classes } = useStyles();
  const {
    formik,
    isLoading,
    showPassword,
    setShowPassword,
    navigate,
    loginError,
    clearLoginError,
  } = useSignIn();
  const pageStyle = getSignInStyle();

  const sharedFormProps = {
    formik,
    isLoading,
    showPassword,
    onTogglePassword: () => setShowPassword((v) => !v),
    onNavigate: navigate,
    loginError,
    onClearError: clearLoginError,
  };

  if (pageStyle === 'old') {
    return (
      <Box className={classes.oldContainer}>
        <Paper elevation={3} className={classes.oldCard}>
          <Box className={classes.oldCardHeader}>
            <AssignmentIndIcon className={classes.oldCardIcon} />
            <Typography variant='h5' fontWeight={700}>
              Sign In
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Welcome back to ServiceOps
            </Typography>
          </Box>

          <form onSubmit={formik.handleSubmit} noValidate>
            <SignInForm {...sharedFormProps} />
          </form>

          <Divider className={classes.divider}>
            <Typography variant='caption' color='text.secondary' className={classes.dividerCaption}>
              or
            </Typography>
          </Divider>

          <Box className={classes.signupLinkBox}>
            <Typography variant='body2' color='text.secondary'>
              Don&apos;t have an account?{' '}
              <Typography
                component='span'
                variant='body2'
                className={classes.signupLinkText}
                onClick={() => navigate(constants.Path.SIGNUP)}
              >
                Sign up for free
              </Typography>
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box className={classes.pageWrapper}>
      <LeftPanel classes={classes} onNavigateSignUp={() => navigate(constants.Path.SIGNUP)} />

      <Box className={classes.rightPanel}>
        <Box className={classes.bgShape1} />
        <Box className={classes.bgShape2} />

        <Box className={classes.formCard}>
          <Box className={classes.cardHeader}>
            <Box className={classes.formBadge}>
              <AssignmentIndIcon className={classes.formBadgeIcon} />
            </Box>
          </Box>

          <Box className={classes.formBody}>
            <Typography variant='h5' fontWeight={700} className={classes.formTitle}>
              Welcome back
            </Typography>
            <Typography variant='body2' color='text.secondary' className={classes.formSubtitle}>
              Sign in to your ServiceOps account
            </Typography>

            <form onSubmit={formik.handleSubmit} noValidate>
              <SignInForm {...sharedFormProps} />
            </form>

            <Divider className={classes.divider}>
              <Typography
                variant='caption'
                color='text.secondary'
                className={classes.dividerCaption}
              >
                or
              </Typography>
            </Divider>

            <Box className={classes.signupLinkBox}>
              <Typography variant='body2' color='text.secondary'>
                Don&apos;t have an account?{' '}
                <Typography
                  component='span'
                  variant='body2'
                  className={classes.signupLinkText}
                  onClick={() => navigate(constants.Path.SIGNUP)}
                >
                  Sign up for free
                </Typography>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SignIn;
