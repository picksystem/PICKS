import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  root: {
    borderRadius: 8,
    marginBottom: theme.spacing(2),
    boxShadow: `0 2px 8px ${theme.palette.shadow.medium}`,
    '& .MuiAlert-icon': {
      alignItems: 'center',
    },
    '& .MuiAlert-message': {
      padding: theme.spacing(1, 0),
      fontSize: '0.875rem',
      [theme.breakpoints.down('sm')]: {
        fontSize: '0.8rem',
      },
    },
  },
});
