import { Box, Typography, InputAdornment, IconButton } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useFieldError } from '@serviceops/hooks';
import TextField from '../../../../components/TextField/TextField';
import Button from '../../../../components/Button/Button';

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

interface ResetStepProps {
  form: {
    values: { newPassword: string; confirmPassword: string };
    errors: { newPassword?: string; confirmPassword?: string };
    touched: { newPassword?: boolean; confirmPassword?: boolean };
    handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    handleBlur: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    handleSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
  };
  isResetting: boolean;
  showNew: boolean;
  showConfirm: boolean;
  onToggleNew: () => void;
  onToggleConfirm: () => void;
}

const ResetStep = ({
  form,
  isResetting,
  showNew,
  showConfirm,
  onToggleNew,
  onToggleConfirm,
}: ResetStepProps) => {
  const reqError = useFieldError();
  const strength = getStrength(form.values.newPassword);

  return (
    <form onSubmit={form.handleSubmit}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Box>
          <TextField
            id='newPassword'
            name='newPassword'
            label='New Password'
            type={showNew ? 'text' : 'password'}
            placeholder='Create a strong password'
            value={form.values.newPassword}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            error={form.touched.newPassword && Boolean(form.errors.newPassword)}
            errorText={reqError(form.touched.newPassword, form.errors.newPassword as string)}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton onClick={onToggleNew} edge='end' size='small' tabIndex={-1}>
                    {showNew ? (
                      <VisibilityOffIcon fontSize='small' />
                    ) : (
                      <VisibilityIcon fontSize='small' />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {form.values.newPassword && (
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
        </Box>

        <TextField
          id='confirmPassword'
          name='confirmPassword'
          label='Confirm Password'
          type={showConfirm ? 'text' : 'password'}
          placeholder='Re-enter your new password'
          value={form.values.confirmPassword}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          error={form.touched.confirmPassword && Boolean(form.errors.confirmPassword)}
          errorText={reqError(form.touched.confirmPassword, form.errors.confirmPassword as string)}
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton onClick={onToggleConfirm} edge='end' size='small' tabIndex={-1}>
                  {showConfirm ? (
                    <VisibilityOffIcon fontSize='small' />
                  ) : (
                    <VisibilityIcon fontSize='small' />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          type='submit'
          variant='contained'
          color='primary'
          loading={isResetting}
          disabled={isResetting}
          label='Reset Password'
          size='large'
        />
      </Box>
    </form>
  );
};

export default ResetStep;
