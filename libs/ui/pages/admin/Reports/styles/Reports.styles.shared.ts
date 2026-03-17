import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  container: {
    padding: 3,
  },

  title: {
    marginBottom: 3,
    fontWeight: 600,
    fontSize: '2.125rem',
    [theme.breakpoints.down('sm')]: {
      marginBottom: 2,
      fontSize: '1.5rem',
    },
    [theme.breakpoints.between('sm', 'md')]: {
      marginBottom: 2.5,
      fontSize: '1.75rem',
    },
    [theme.breakpoints.between('md', 'lg')]: {
      fontSize: '2rem',
    },
  },

  description: {
    color: theme.palette.text.secondary,
    fontSize: '1rem',
    lineHeight: 1.6,
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.875rem',
      lineHeight: 1.4,
    },
    [theme.breakpoints.between('sm', 'md')]: {
      fontSize: '0.9rem',
      lineHeight: 1.5,
    },
  },
});
