import { Box, TextField, Button } from '@serviceops/component';
import { useFieldError } from '@serviceops/hooks';
import type { EmailStepProps } from './util';

const EmailStep = ({ form, isSendingOtp }: EmailStepProps) => {
  const reqError = useFieldError();

  return (
    <form onSubmit={form.handleSubmit}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <TextField
          id='email'
          name='email'
          label='Work Email'
          type='email'
          placeholder='you@company.com'
          value={form.values.email}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          error={form.touched.email && Boolean(form.errors.email)}
          errorText={reqError(form.touched.email, form.errors.email as string)}
          fullWidth
        />
        <Button
          type='submit'
          variant='contained'
          color='primary'
          loading={isSendingOtp}
          disabled={isSendingOtp}
          label='Send Recovery Code'
          size='large'
        />
      </Box>
    </form>
  );
};

export default EmailStep;
