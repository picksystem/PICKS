import { Box, Typography, Chip } from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { useFieldError } from '@serviceops/hooks';
import TextField from '../../../../components/TextField/TextField';
import Button from '../../../../components/Button/Button';

interface OtpStepProps {
  email: string;
  form: {
    values: { otp: string };
    errors: { otp?: string };
    touched: { otp?: boolean };
    handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    handleBlur: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    handleSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
  };
  isVerifying: boolean;
  emailChipClass: string;
  onResend: () => void;
}

const OtpStep = ({ email, form, isVerifying, emailChipClass, onResend }: OtpStepProps) => {
  const reqError = useFieldError();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Chip
          icon={<MailOutlineIcon sx={{ fontSize: '18px !important' }} />}
          label={email}
          className={emailChipClass}
        />
      </Box>
      <form onSubmit={form.handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            id='otp'
            name='otp'
            label='6-digit OTP'
            type='text'
            placeholder='Enter the code from your email'
            value={form.values.otp}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            error={form.touched.otp && Boolean(form.errors.otp)}
            errorText={reqError(form.touched.otp, form.errors.otp as string)}
            inputProps={{ maxLength: 6, inputMode: 'numeric' }}
            fullWidth
          />
          <Button
            type='submit'
            variant='contained'
            color='primary'
            loading={isVerifying}
            disabled={isVerifying}
            label='Verify Code'
            size='large'
          />
        </Box>
      </form>
      <Box sx={{ textAlign: 'center', mt: 2.5 }}>
        <Typography variant='body2' color='text.secondary'>
          Didn&apos;t receive the code?{' '}
          <Typography
            component='span'
            variant='body2'
            sx={{
              color: 'primary.main',
              cursor: 'pointer',
              fontWeight: 600,
              '&:hover': { textDecoration: 'underline' },
            }}
            onClick={onResend}
          >
            Resend OTP
          </Typography>
        </Typography>
      </Box>
    </Box>
  );
};

export default OtpStep;
