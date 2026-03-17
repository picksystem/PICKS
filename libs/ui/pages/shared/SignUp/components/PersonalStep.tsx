import { Box, Typography, Grid } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { useFieldError } from '@picks/hooks';
import TextField from '../../../../components/TextField/TextField';

interface PersonalStepProps {
  values: { firstName: string; lastName: string; email: string; phone: string };
  touched: Partial<Record<string, boolean>>;
  errors: Partial<Record<string, string>>;
  onChange: React.ChangeEventHandler;
  onBlur: React.FocusEventHandler;
  classes: Record<string, string>;
}

const PersonalStep = ({
  values,
  touched,
  errors,
  onChange,
  onBlur,
  classes,
}: PersonalStepProps) => {
  const reqError = useFieldError();

  return (
    <Box className={classes.sectionCard}>
      <Box className={classes.sectionHeader}>
        <Box className={classes.sectionIcon}>
          <PersonIcon sx={{ fontSize: 16 }} />
        </Box>
        <Typography fontWeight={600} fontSize='0.95rem'>
          Personal Information
        </Typography>
      </Box>
      <Box className={classes.stepContent}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              id='firstName'
              name='firstName'
              label='First Name'
              type='text'
              placeholder='First name'
              value={values.firstName}
              onChange={onChange}
              onBlur={onBlur}
              error={touched.firstName && Boolean(errors.firstName)}
              errorText={reqError(touched.firstName, errors.firstName)}
              fullWidth
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              id='lastName'
              name='lastName'
              label='Last Name'
              type='text'
              placeholder='Last name'
              value={values.lastName}
              onChange={onChange}
              onBlur={onBlur}
              error={touched.lastName && Boolean(errors.lastName)}
              errorText={reqError(touched.lastName, errors.lastName)}
              fullWidth
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              id='email'
              name='email'
              label='Work Email'
              type='email'
              placeholder='you@company.com'
              value={values.email}
              onChange={onChange}
              onBlur={onBlur}
              error={touched.email && Boolean(errors.email)}
              errorText={reqError(touched.email, errors.email)}
              fullWidth
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              id='phone'
              name='phone'
              label='Phone Number'
              type='tel'
              placeholder='+1 (555) 000-0000'
              value={values.phone ?? ''}
              onChange={onChange}
              onBlur={onBlur}
              error={touched.phone && Boolean(errors.phone)}
              errorText={touched.phone ? errors.phone : undefined}
              inputProps={{ inputMode: 'numeric' }}
              fullWidth
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default PersonalStep;
