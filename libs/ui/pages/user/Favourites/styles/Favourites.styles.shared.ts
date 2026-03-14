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

  tableContainer: {
    width: '100%',
    overflowX: 'auto',
    [theme.breakpoints.down('md')]: {
      '& table': {
        minWidth: '600px',
      },
    },
  },

  tableHeadRow: {
    backgroundColor: theme.palette.grey[100],
  },

  tableHeadCell: {
    fontWeight: 600,
    fontSize: '1rem',
    padding: 2,
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.875rem',
      padding: 1,
    },
    [theme.breakpoints.between('sm', 'md')]: {
      fontSize: '0.9rem',
      padding: 1.5,
    },
  },

  tableRow: {
    '&:hover': {
      backgroundColor: theme.palette.grey[50],
    },
  },

  tableCell: {
    fontSize: '0.9rem',
    padding: 1.5,
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.8rem',
      padding: 0.75,
    },
    [theme.breakpoints.between('sm', 'md')]: {
      fontSize: '0.875rem',
      padding: 1,
    },
  },
});
