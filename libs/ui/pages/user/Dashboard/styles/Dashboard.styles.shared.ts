import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  container: {
    padding: 3,
  },

  title: {
    color: 'orange',
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

  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 3,
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: '1fr',
      gap: 1.5,
    },
    [theme.breakpoints.between('sm', 'md')]: {
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 2,
    },
    [theme.breakpoints.between('md', 'lg')]: {
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 2.5,
    },
    [theme.breakpoints.between('lg', 'xl')]: {
      gridTemplateColumns: 'repeat(3, 1fr)',
    },
  },

  card: {
    height: '100%',
    padding: 2.5,
    [theme.breakpoints.down('sm')]: {
      padding: 1.5,
    },
    [theme.breakpoints.between('sm', 'md')]: {
      padding: 2,
    },
  },

  cardTitle: {
    color: 'blue',
    marginBottom: 2,
    fontSize: '1.25rem',
    [theme.breakpoints.down('sm')]: {
      marginBottom: 1.5,
      fontSize: '1.1rem',
    },
    [theme.breakpoints.between('sm', 'md')]: {
      fontSize: '1.2rem',
    },
  },

  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    [theme.breakpoints.down('sm')]: {
      gap: 1.5,
    },
  },

  input: {
    width: '100%',
    padding: '10px',
    boxSizing: 'border-box',
    fontSize: '16px',
    [theme.breakpoints.down('sm')]: {
      padding: '6px',
      fontSize: '14px',
    },
    [theme.breakpoints.between('sm', 'md')]: {
      padding: '8px',
      fontSize: '15px',
    },
  },

  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '16px',
    [theme.breakpoints.down('sm')]: {
      marginBottom: '6px',
      fontSize: '14px',
    },
    [theme.breakpoints.between('sm', 'md')]: {
      fontSize: '15px',
    },
  },

  button: {
    padding: '12px 24px',
    fontSize: '16px',
    [theme.breakpoints.down('sm')]: {
      padding: '8px 16px',
      fontSize: '14px',
    },
    [theme.breakpoints.between('sm', 'md')]: {
      padding: '10px 20px',
      fontSize: '15px',
    },
  },

  productsContainer: {
    maxHeight: '300px',
    overflowY: 'auto',
    [theme.breakpoints.down('sm')]: {
      maxHeight: '200px',
    },
    [theme.breakpoints.between('sm', 'md')]: {
      maxHeight: '250px',
    },
  },

  productItem: {
    padding: 1,
    marginBottom: 1,
    backgroundColor: theme.palette.grey[100],
    borderRadius: 1,
    fontSize: '16px',
    [theme.breakpoints.down('sm')]: {
      padding: 0.75,
      marginBottom: 0.75,
      fontSize: '14px',
    },
    [theme.breakpoints.between('sm', 'md')]: {
      fontSize: '15px',
    },
  },
});
