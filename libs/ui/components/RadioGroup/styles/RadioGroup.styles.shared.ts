import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  root: {
    marginBottom: theme.spacing(2),
  },
  label: {
    fontSize: '0.95rem',
    fontWeight: 600,
    marginBottom: theme.spacing(1),
    color: theme.palette.text.primary,
  },
  group: {
    '& .MuiFormControlLabel-label': {
      fontSize: '0.95rem',
      [theme.breakpoints.down('sm')]: {
        fontSize: '0.875rem',
      },
    },
  },
  helperText: {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.5),
    marginLeft: theme.spacing(4),
  },
});
