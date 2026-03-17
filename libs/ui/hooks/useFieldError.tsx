import { Box } from '@mui/material';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import { createStyles } from '@picks/theme';

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
    if (error === 'required' || error.toLowerCase().includes('required'))
      return (
        <Box component='span' className={classes.requiredErrorWrapper}>
          <ArrowCircleRightIcon className={classes.requiredErrorIcon} />
          Required
        </Box>
      );
    return error;
  };

  return reqError;
};
