import { Box } from '@mui/material';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import { createStyles } from '@serviceops/theme';

const useStyles = createStyles((theme) => ({
  requiredErrorWrapper: {
    display: 'inline-flex',
    alignItems: 'flex-start',
    gap: theme.spacing(0.5),
  },
  requiredErrorIcon: {
    fontSize: '1.1rem',
  },
}));

export const useFieldError = () => {
  const { classes } = useStyles();

  const reqError = (touched: unknown, error: string | undefined) => {
    if (!touched || !error) return undefined;
    const label =
      error === 'required' || error.toLowerCase().includes('required') ? 'Required' : error;
    return (
      <Box component='span' className={classes.requiredErrorWrapper}>
        <ArrowCircleRightIcon className={classes.requiredErrorIcon} />
        {label}
      </Box>
    );
  };

  return reqError;
};
