import {
  Box,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  SelectChangeEvent,
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import SearchIcon from '@mui/icons-material/Search';
import { useFieldError } from '@serviceops/hooks';
import TextField from '../../../../components/TextField/TextField';

interface WorkDetailsStepProps {
  values: {
    workLocation: string;
    department: string;
    employeeId: string;
    businessUnit: string;
    managerName: string;
    reasonForAccess: string;
    role: string;
  };
  touched: Partial<Record<string, boolean>>;
  errors: Partial<Record<string, string>>;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onRoleChange: (event: SelectChangeEvent<string>) => void;
  onBlur: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  classes: Record<string, string>;
}

const WorkDetailsStep = ({
  values,
  touched,
  errors,
  onChange,
  onRoleChange,
  onBlur,
  classes,
}: WorkDetailsStepProps) => {
  const reqError = useFieldError();

  return (
    <Box className={classes.sectionCard}>
      <Box className={classes.sectionHeader}>
        <Box className={classes.sectionIcon}>
          <WorkIcon sx={{ fontSize: 16 }} />
        </Box>
        <Typography fontWeight={600} fontSize='0.95rem'>
          Work Details
        </Typography>
      </Box>
      <Box className={classes.stepContent}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              id='workLocation'
              name='workLocation'
              label='Work Location'
              type='text'
              placeholder='City, Country'
              value={values.workLocation}
              onChange={onChange}
              onBlur={onBlur}
              error={touched.workLocation && Boolean(errors.workLocation)}
              errorText={reqError(touched.workLocation, errors.workLocation)}
              fullWidth
              required
              icon={<SearchIcon sx={{ fontSize: 22 }} />}
              iconAlignment='right'
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              id='department'
              name='department'
              label='Department'
              type='text'
              placeholder='e.g. IT Support'
              value={values.department ?? ''}
              onChange={onChange}
              onBlur={onBlur}
              error={touched.department && Boolean(errors.department)}
              errorText={touched.department ? errors.department : undefined}
              fullWidth
              icon={<SearchIcon sx={{ fontSize: 22 }} />}
              iconAlignment='right'
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              id='employeeId'
              name='employeeId'
              label='Employee ID (Optional)'
              type='text'
              placeholder='e.g. 12345'
              value={values.employeeId}
              onChange={onChange}
              onBlur={onBlur}
              error={touched.employeeId && Boolean(errors.employeeId)}
              errorText={touched.employeeId ? errors.employeeId : undefined}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              id='businessUnit'
              name='businessUnit'
              label='Business Unit (Optional)'
              type='text'
              placeholder='e.g. Operations'
              value={values.businessUnit}
              onChange={onChange}
              onBlur={onBlur}
              error={touched.businessUnit && Boolean(errors.businessUnit)}
              errorText={touched.businessUnit ? errors.businessUnit : undefined}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              id='managerName'
              name='managerName'
              label='Reporting Manager'
              type='text'
              placeholder="Your manager's full name"
              value={values.managerName}
              onChange={onChange}
              onBlur={onBlur}
              error={touched.managerName && Boolean(errors.managerName)}
              errorText={reqError(touched.managerName, errors.managerName)}
              fullWidth
              required
              icon={<SearchIcon sx={{ fontSize: 22 }} />}
              iconAlignment='right'
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              id='reasonForAccess'
              name='reasonForAccess'
              label='Reason for Access'
              type='text'
              placeholder='Briefly describe why you need access to ServiceOps...'
              value={values.reasonForAccess}
              onChange={onChange}
              onBlur={onBlur}
              error={touched.reasonForAccess && Boolean(errors.reasonForAccess)}
              errorText={reqError(touched.reasonForAccess, errors.reasonForAccess)}
              fullWidth
              required
              multiline
              minRows={3}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth required error={touched.role && Boolean(errors.role)}>
              <InputLabel id='role-label' required>
                Requested Role
              </InputLabel>
              <Select
                labelId='role-label'
                id='role'
                name='role'
                value={values.role}
                label='Requested Role'
                onChange={onRoleChange}
                onBlur={onBlur}
              >
                <MenuItem value='admin'>Admin</MenuItem>
                <MenuItem value='user'>User</MenuItem>
                <MenuItem value='consultant'>Consultant</MenuItem>
              </Select>
              <FormHelperText>
                All sign-ups require admin approval before you can access the system.
              </FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default WorkDetailsStep;
