import SearchIcon from '@mui/icons-material/Search';
import { Box, Typography, TextField } from '@picks/component';
import { useFieldError } from '@picks/hooks';
import { useStyles } from '../styles';

interface CategorizationSectionProps {
  values: {
    businessCategory: string;
    serviceLine: string;
    application: string;
    applicationCategory: string;
    applicationSubCategory: string;
  };
  touched: Partial<Record<string, boolean>>;
  errors: Partial<Record<string, string>>;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onBlur: React.FocusEventHandler;
}

const CategorizationSection = ({
  values,
  touched,
  errors,
  onChange,
  onBlur,
}: CategorizationSectionProps) => {
  const { classes } = useStyles();
  const reqError = useFieldError();

  return (
    <>
      <Typography className={classes.sectionTitle}>Categorization</Typography>
      <Box className={classes.formGrid}>
        <TextField
          name='businessCategory'
          label='Business Category'
          value={values.businessCategory}
          onChange={onChange}
          onBlur={onBlur}
          icon={<SearchIcon />}
          iconAlignment='right'
          inputProps={{ maxLength: 50 }}
          error={!!(touched.businessCategory && errors.businessCategory)}
          errorText={reqError(touched.businessCategory, errors.businessCategory)}
          required
        />
        <TextField
          name='serviceLine'
          label='Service Line'
          value={values.serviceLine}
          onChange={onChange}
          onBlur={onBlur}
          icon={<SearchIcon />}
          iconAlignment='right'
          inputProps={{ maxLength: 50 }}
          error={!!(touched.serviceLine && errors.serviceLine)}
          errorText={reqError(touched.serviceLine, errors.serviceLine)}
          required
        />
        <TextField
          name='application'
          label='Application / Product'
          value={values.application}
          onChange={onChange}
          onBlur={onBlur}
          icon={<SearchIcon />}
          iconAlignment='right'
          inputProps={{ maxLength: 50 }}
          error={!!(touched.application && errors.application)}
          errorText={reqError(touched.application, errors.application)}
          required
        />
        <TextField
          name='applicationCategory'
          label='Application / Product Category'
          value={values.applicationCategory}
          onChange={onChange}
          onBlur={onBlur}
          icon={<SearchIcon />}
          iconAlignment='right'
          inputProps={{ maxLength: 50 }}
        />
        <TextField
          name='applicationSubCategory'
          label='Application / Product Sub-category'
          value={values.applicationSubCategory}
          onChange={onChange}
          onBlur={onBlur}
          icon={<SearchIcon />}
          iconAlignment='right'
          inputProps={{ maxLength: 50 }}
        />
      </Box>
    </>
  );
};

export default CategorizationSection;
