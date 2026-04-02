import { Box, Typography, Grid, Alert } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { useFieldError } from '@serviceops/hooks';
import TextField from '../../../../components/TextField/TextField';

function getStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const colors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'];
  return { score, label: pw ? labels[score] : '', color: pw ? colors[score] : '' };
}

interface SecurityStepProps {
  values: { password: string; confirmPassword: string };
  errors: Partial<Record<string, string>>;
  step2Touched: { password: boolean; confirmPassword: boolean };
  step2Submitted: boolean;
  onPasswordChange: React.ChangeEventHandler;
  onPasswordBlur: (e: React.FocusEvent) => void;
  onConfirmChange: React.ChangeEventHandler;
  onConfirmBlur: (e: React.FocusEvent) => void;
  classes: Record<string, string>;
}

const SecurityStep = ({
  values,
  errors,
  step2Touched,
  step2Submitted,
  onPasswordChange,
  onPasswordBlur,
  onConfirmChange,
  onConfirmBlur,
  classes,
}: SecurityStepProps) => {
  const reqError = useFieldError();
  const strength = getStrength(values.password);

  return (
    <Box className={classes.sectionCard}>
      <Box className={classes.sectionHeader}>
        <Box className={classes.sectionIcon}>
          <LockIcon sx={{ fontSize: 16 }} />
        </Box>
        <Typography fontWeight={600} fontSize='0.95rem'>
          Account Security
        </Typography>
      </Box>
      <Box className={classes.stepContent}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              id='password'
              name='password'
              label='Password'
              type='password'
              placeholder='Create a strong password'
              value={values.password}
              onChange={onPasswordChange}
              onBlur={onPasswordBlur}
              error={(step2Touched.password || step2Submitted) && Boolean(errors.password)}
              errorText={reqError(step2Touched.password || step2Submitted, errors.password)}
              fullWidth
              required
            />
            {values.password && (
              <Box sx={{ mt: 1 }}>
                <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Box
                      key={n}
                      sx={{
                        flex: 1,
                        height: 4,
                        borderRadius: 2,
                        bgcolor: n <= strength.score ? strength.color : 'grey.200',
                        transition: 'background-color 0.3s ease',
                      }}
                    />
                  ))}
                </Box>
                <Typography variant='caption' sx={{ color: strength.color, fontWeight: 600 }}>
                  {strength.label}
                </Typography>
              </Box>
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              id='confirmPassword'
              name='confirmPassword'
              label='Confirm Password'
              type='password'
              placeholder='Re-enter your password'
              value={values.confirmPassword}
              onChange={onConfirmChange}
              onBlur={onConfirmBlur}
              error={
                (step2Touched.confirmPassword || step2Submitted) && Boolean(errors.confirmPassword)
              }
              errorText={reqError(
                step2Touched.confirmPassword || step2Submitted,
                errors.confirmPassword,
              )}
              fullWidth
              required
            />
          </Grid>
        </Grid>
        <Alert severity='info' sx={{ mt: 2, borderRadius: 2 }}>
          Admin approval may take a minimum of 3 days. You will be notified once your account is
          approved.
        </Alert>
      </Box>
    </Box>
  );
};

export default SecurityStep;
