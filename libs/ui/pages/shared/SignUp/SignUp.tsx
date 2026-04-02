import {
  Box,
  Typography,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  Grid,
  Avatar,
  Paper,
  Divider,
} from '@mui/material';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import { constants } from '@serviceops/utils';
import { useStyles } from './styles';
import useSignUp, { STEPS } from './hooks/useSignUp';
import StepProgress from './components/StepProgress';
import PersonalStep from './components/PersonalStep';
import WorkDetailsStep from './components/WorkDetailsStep';
import SecurityStep from './components/SecurityStep';
import LeftPanel from './components/LeftPanel';

import TextField from '../../../components/TextField/TextField';
import Button from '../../../components/Button/Button';
import { useFieldError } from '@serviceops/hooks';

function getSignUpStyle(): 'old' | 'new' {
  try {
    const saved = localStorage.getItem('serivceops_page_styles');
    if (saved) return (JSON.parse(saved)?.signUp as 'old' | 'new') || 'new';
  } catch {
    /* ignore */
  }
  return 'new';
}

const SignUp = () => {
  const { classes } = useStyles();
  const reqError = useFieldError();
  const {
    formik,
    isLoading,
    submitted,
    step,
    setStep,
    step2Touched,
    setStep2Touched,
    step2Submitted,
    setStep2Submitted,
    handleNext,
    initials,
    navigate,
  } = useSignUp();
  const pageStyle = getSignUpStyle();

  const touched = formik.touched as Partial<Record<string, boolean>>;
  const errors = formik.errors as Partial<Record<string, string>>;

  if (pageStyle === 'old') {
    return (
      <Box className={classes.container}>
        <Paper elevation={3} className={classes.card}>
          <Box sx={{ textAlign: 'center', mb: 1 }}>
            <AssignmentIndIcon sx={{ fontSize: 48, color: 'primary.main' }} />
          </Box>
          <Typography variant='h4' className={classes.cardTitle}>
            Sign Up
          </Typography>
          <Typography variant='body2' className={classes.cardSubtitle}>
            Create your account to get started
          </Typography>

          <form onSubmit={formik.handleSubmit} className={classes.form} noValidate>
            <Typography variant='subtitle1' className={classes.cardSectionTitle}>
              Personal Information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  id='firstName'
                  name='firstName'
                  label='First Name'
                  type='text'
                  placeholder='Enter your first name'
                  fullWidth
                  required
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                  errorText={reqError(formik.touched.firstName, formik.errors.firstName as string)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  id='lastName'
                  name='lastName'
                  label='Last Name'
                  type='text'
                  placeholder='Enter your last name'
                  fullWidth
                  required
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                  errorText={reqError(formik.touched.lastName, formik.errors.lastName as string)}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  id='email'
                  name='email'
                  label='Work Email'
                  type='email'
                  placeholder='Enter your work email'
                  fullWidth
                  required
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  errorText={reqError(formik.touched.email, formik.errors.email as string)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  id='phone'
                  name='phone'
                  label='Phone Number'
                  type='tel'
                  placeholder='Enter your phone number'
                  fullWidth
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  errorText={reqError(formik.touched.phone, formik.errors.phone as string)}
                />
              </Grid>
            </Grid>

            <Divider />

            <Typography variant='subtitle1' className={classes.cardSectionTitle}>
              Work Details
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  id='workLocation'
                  name='workLocation'
                  label='Work Location'
                  type='text'
                  placeholder='Enter your work location'
                  fullWidth
                  required
                  value={formik.values.workLocation}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.workLocation && Boolean(formik.errors.workLocation)}
                  errorText={reqError(
                    formik.touched.workLocation,
                    formik.errors.workLocation as string,
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  id='department'
                  name='department'
                  label='Department'
                  type='text'
                  placeholder='Enter your department'
                  fullWidth
                  value={formik.values.department}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.department && Boolean(formik.errors.department)}
                  errorText={reqError(
                    formik.touched.department,
                    formik.errors.department as string,
                  )}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  id='employeeId'
                  name='employeeId'
                  label='Employee ID (Optional)'
                  type='text'
                  placeholder='Enter your employee ID'
                  fullWidth
                  value={formik.values.employeeId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.employeeId && Boolean(formik.errors.employeeId)}
                  errorText={reqError(
                    formik.touched.employeeId,
                    formik.errors.employeeId as string,
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  id='businessUnit'
                  name='businessUnit'
                  label='Business Unit (Optional)'
                  type='text'
                  placeholder='Enter your business unit'
                  fullWidth
                  value={formik.values.businessUnit}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.businessUnit && Boolean(formik.errors.businessUnit)}
                  errorText={reqError(
                    formik.touched.businessUnit,
                    formik.errors.businessUnit as string,
                  )}
                />
              </Grid>
            </Grid>
            <TextField
              id='managerName'
              name='managerName'
              label='Manager Name'
              type='text'
              placeholder='Enter your manager name'
              fullWidth
              required
              value={formik.values.managerName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.managerName && Boolean(formik.errors.managerName)}
              errorText={reqError(formik.touched.managerName, formik.errors.managerName as string)}
            />
            <TextField
              id='reasonForAccess'
              name='reasonForAccess'
              label='Reason for Access'
              type='text'
              placeholder='Describe why you need access to ServiceOps'
              fullWidth
              required
              multiline
              minRows={3}
              value={formik.values.reasonForAccess}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.reasonForAccess && Boolean(formik.errors.reasonForAccess)}
              errorText={reqError(
                formik.touched.reasonForAccess,
                formik.errors.reasonForAccess as string,
              )}
            />

            <Divider />

            <Typography variant='subtitle1' className={classes.cardSectionTitle}>
              Account Security
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  id='password'
                  name='password'
                  label='Password'
                  type='password'
                  placeholder='Enter your password'
                  fullWidth
                  required
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  errorText={reqError(formik.touched.password, formik.errors.password as string)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  id='confirmPassword'
                  name='confirmPassword'
                  label='Confirm Password'
                  type='password'
                  placeholder='Confirm your password'
                  fullWidth
                  required
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                  errorText={reqError(
                    formik.touched.confirmPassword,
                    formik.errors.confirmPassword as string,
                  )}
                />
              </Grid>
            </Grid>

            <Divider />

            <Typography variant='subtitle1' className={classes.cardSectionTitle}>
              Role Selection
            </Typography>
            <FormControl
              fullWidth
              required
              error={formik.touched.role && Boolean(formik.errors.role)}
            >
              <InputLabel id='role-label' required>
                Role
              </InputLabel>
              <Select
                labelId='role-label'
                id='role'
                name='role'
                value={formik.values.role}
                label='Role'
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <MenuItem value='user'>User</MenuItem>
                <MenuItem value='consultant'>Consultant</MenuItem>
                <MenuItem value='admin'>Admin</MenuItem>
              </Select>
              {formik.touched.role && formik.errors.role && (
                <FormHelperText>{formik.errors.role as string}</FormHelperText>
              )}
              <FormHelperText>
                All sign-ups require admin approval before you can access the system.
              </FormHelperText>
            </FormControl>

            <Alert severity='info' sx={{ mt: 1 }}>
              Admin approval may take a minimum of 3 days. You will be notified once your account is
              approved.
            </Alert>

            <Box className={classes.buttonGroup}>
              <Button
                type='button'
                variant='outlined'
                color='secondary'
                label='Cancel'
                size='large'
                className={classes.cancelButton}
                onClick={() => {
                  sessionStorage.removeItem('signUpStep');
                  navigate(constants.Path.SIGNIN);
                }}
              />
              <Button
                type='submit'
                variant='contained'
                color='primary'
                loading={isLoading}
                disabled={isLoading || submitted}
                label='Submit Registration'
                size='large'
                className={classes.submitButton}
              />
            </Box>
          </form>

          <Box className={classes.links}>
            <Typography
              variant='body2'
              className={classes.link}
              onClick={() => navigate(constants.Path.SIGNIN)}
            >
              Already have an account? Sign In
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box className={classes.pageWrapper}>
      <LeftPanel classes={classes} onNavigateSignIn={() => navigate(constants.Path.SIGNIN)} />

      <Box className={classes.rightPanel}>
        <Box className={classes.formContainer}>
          <Box className={classes.formHeader}>
            <Avatar className={classes.avatarPreview}>{initials}</Avatar>
            <Box>
              <Typography variant='h5' fontWeight={700} color='text.primary'>
                Create your account
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mt: 0.25 }}>
                Step {step + 1} of {STEPS.length} — {STEPS[step].label}
              </Typography>
            </Box>
          </Box>

          <StepProgress step={step} classes={classes} />

          <form
            onSubmit={(e) => {
              if (step < STEPS.length - 1) {
                e.preventDefault();
                return;
              }
              setStep2Submitted(true);
              formik.handleSubmit(e);
            }}
            noValidate
          >
            {step === 0 && (
              <PersonalStep
                values={{
                  firstName: formik.values.firstName,
                  lastName: formik.values.lastName,
                  email: formik.values.email,
                  phone: formik.values.phone,
                }}
                touched={touched}
                errors={errors}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                classes={classes}
              />
            )}

            {step === 1 && (
              <WorkDetailsStep
                values={{
                  workLocation: formik.values.workLocation,
                  department: formik.values.department,
                  employeeId: formik.values.employeeId,
                  businessUnit: formik.values.businessUnit,
                  managerName: formik.values.managerName,
                  reasonForAccess: formik.values.reasonForAccess,
                  role: formik.values.role,
                }}
                touched={touched}
                errors={errors}
                onChange={formik.handleChange}
                onRoleChange={(e) => formik.setFieldValue('role', e.target.value)}
                onBlur={formik.handleBlur}
                classes={classes}
              />
            )}

            {step === 2 && (
              <SecurityStep
                values={{
                  password: formik.values.password,
                  confirmPassword: formik.values.confirmPassword,
                }}
                errors={errors}
                step2Touched={step2Touched}
                step2Submitted={step2Submitted}
                onPasswordChange={formik.handleChange}
                onPasswordBlur={(e) => {
                  setStep2Touched((p) => ({ ...p, password: true }));
                  formik.handleBlur(e);
                }}
                onConfirmChange={formik.handleChange}
                onConfirmBlur={(e) => {
                  setStep2Touched((p) => ({ ...p, confirmPassword: true }));
                  formik.handleBlur(e);
                }}
                classes={classes}
              />
            )}

            <Box className={classes.navRow}>
              {step > 0 ? (
                <Button
                  type='button'
                  variant='outlined'
                  color='secondary'
                  label='Back'
                  onClick={() => setStep((s) => s - 1)}
                />
              ) : (
                <Button
                  type='button'
                  variant='outlined'
                  color='secondary'
                  label='Cancel'
                  onClick={() => {
                    sessionStorage.removeItem('signUpStep');
                    navigate(constants.Path.SIGNIN);
                  }}
                />
              )}
              {step < STEPS.length - 1 ? (
                <Button
                  type='button'
                  variant='contained'
                  color='primary'
                  label='Continue'
                  onClick={handleNext}
                />
              ) : (
                <Button
                  type='submit'
                  variant='contained'
                  color='primary'
                  loading={isLoading}
                  disabled={isLoading || submitted}
                  label='Submit Registration'
                />
              )}
            </Box>
          </form>

          <Box className={classes.mobileSignin}>
            <Typography variant='body2' color='text.secondary'>
              Already have an account?{' '}
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
  );
};

export default SignUp;
