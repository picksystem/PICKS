import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  container: {
    padding: theme.spacing(3),
    [theme.breakpoints.down('sm')]: { padding: theme.spacing(1.5) },
    [theme.breakpoints.between('sm', 'md')]: { padding: theme.spacing(2) },
  },

  pageHeader: {
    marginBottom: theme.spacing(2.5),
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: theme.spacing(2.5, 3),
    position: 'relative',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 4,
      backgroundColor: '#2563eb',
      borderTopLeftRadius: 12,
      borderBottomLeftRadius: 12,
    },
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
      borderRadius: 8,
    },
  },

  pageHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(0.5),
    position: 'relative',
    zIndex: 1,
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column' as const,
      alignItems: 'flex-start',
      gap: theme.spacing(1),
    },
  },

  title: {
    fontWeight: 800,
    color: '#1e293b',
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.2rem',
    },
  },

  description: {
    color: '#64748b',
    marginTop: theme.spacing(0.5),
    fontSize: '0.875rem',
    position: 'relative',
    zIndex: 1,
  },
});
