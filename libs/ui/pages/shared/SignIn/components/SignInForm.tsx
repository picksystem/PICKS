import { InputAdornment, IconButton } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { constants } from '@picks/utils';
import { useFieldError } from '@picks/hooks';
import { TextField, Typography, Button, Box } from '../../../../components';

interface SignInFormProps {
  formik: {
    values: { email: string; password: string };
    errors: { email?: string; password?: string };
    touched: { email?: boolean; password?: boolean };
    handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    handleBlur: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    handleSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
  };
  isLoading: boolean;
  showPassword: boolean;
  onTogglePassword: () => void;
  onNavigate: (path: string) => void;
}

const SignInForm = ({
  formik,
  isLoading,
  showPassword,
  onTogglePassword,
  onNavigate,
}: SignInFormProps) => {
  const reqError = useFieldError();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <TextField
        id='email'
        name='email'
        label='Work Email'
        type='email'
        placeholder='you@company.com'
        value={formik.values.email}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.email && Boolean(formik.errors.email)}
        errorText={reqError(formik.touched.email, formik.errors.email as string)}
        fullWidth
        required
      />

      <Box>
        <TextField
          id='password'
          name='password'
          label='Password'
          type={showPassword ? 'text' : 'password'}
          placeholder='Enter your password'
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password && Boolean(formik.errors.password)}
          errorText={reqError(formik.touched.password, formik.errors.password as string)}
          fullWidth
          required
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton onClick={onTogglePassword} edge='end' size='small' tabIndex={-1}>
                  {showPassword ? (
                    <VisibilityOffIcon fontSize='small' />
                  ) : (
                    <VisibilityIcon fontSize='small' />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
          <Typography
            variant='body2'
            onClick={() => onNavigate(constants.Path.FORGOT_PASSWORD)}
            sx={{
              fontSize: '0.82rem',
              color: 'primary.main',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Forgot password?
          </Typography>
        </Box>
      </Box>

      <Button
        type='submit'
        variant='contained'
        color='primary'
        loading={isLoading}
        disabled={isLoading}
        label='Sign In'
        size='large'
      />
    </Box>
  );
};

export default SignInForm;
