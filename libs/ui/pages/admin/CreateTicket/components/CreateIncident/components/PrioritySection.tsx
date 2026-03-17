import SearchIcon from '@mui/icons-material/Search';
import { Box, Typography, TextField, Select } from '@picks/component';
import { useFieldError } from '@picks/hooks';
import { useStyles } from '../styles';

interface PrioritySectionProps {
  values: {
    impact: string;
    urgency: string;
    priority: string;
    status: string;
    assignmentGroup: string;
    primaryResource: string;
    secondaryResources: string;
  };
  touched: Partial<Record<string, boolean>>;
  errors: Partial<Record<string, string>>;
  impactOptions: { value: string; label: string }[];
  urgencyOptions: { value: string; label: string }[];
  priorityOptions: { value: string; label: string }[];
  statusOptions: { value: string; label: string }[];
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onBlur: React.FocusEventHandler;
  onSelectChange: (field: string, value: string) => void;
}

const PrioritySection = ({
  values,
  touched,
  errors,
  impactOptions,
  urgencyOptions,
  priorityOptions,
  statusOptions,
  onChange,
  onBlur,
  onSelectChange,
}: PrioritySectionProps) => {
  const { classes } = useStyles();
  const reqError = useFieldError();

  return (
    <>
      <Typography className={classes.sectionTitle}>Priority, Status and Assignment</Typography>
      <Box className={classes.formGrid}>
        <Select
          label='Impact'
          options={impactOptions}
          value={values.impact}
          onChange={(e) => onSelectChange('impact', e.target.value as string)}
          onBlur={onBlur}
          error={!!(touched.impact && errors.impact)}
          errorText={reqError(touched.impact, errors.impact)}
          required
        />
        <Select
          label='Urgency'
          options={urgencyOptions}
          value={values.urgency}
          onChange={(e) => onSelectChange('urgency', e.target.value as string)}
          onBlur={onBlur}
          error={!!(touched.urgency && errors.urgency)}
          errorText={reqError(touched.urgency, errors.urgency)}
          required
        />
        <Select label='Calculated Priority' options={priorityOptions} value={values.priority} disabled />
        <Select
          label='Status'
          options={statusOptions}
          value={values.status}
          onChange={(e) => onSelectChange('status', e.target.value as string)}
        />
        <TextField
          name='assignmentGroup'
          label='Assignment Group'
          value={values.assignmentGroup}
          onChange={onChange}
          onBlur={onBlur}
          icon={<SearchIcon />}
          iconAlignment='right'
          inputProps={{ maxLength: 25 }}
          error={!!(touched.assignmentGroup && errors.assignmentGroup)}
          errorText={reqError(touched.assignmentGroup, errors.assignmentGroup)}
          required
        />
        <TextField
          name='primaryResource'
          label='Primary Resource'
          value={values.primaryResource}
          onChange={onChange}
          onBlur={onBlur}
          icon={<SearchIcon />}
          iconAlignment='right'
          inputProps={{ maxLength: 25 }}
        />
        <TextField
          name='secondaryResources'
          label='Secondary Resource(s)'
          value={values.secondaryResources}
          onChange={onChange}
          onBlur={onBlur}
          icon={<SearchIcon />}
          iconAlignment='right'
          inputProps={{ maxLength: 25 }}
        />
      </Box>
    </>
  );
};

export default PrioritySection;
