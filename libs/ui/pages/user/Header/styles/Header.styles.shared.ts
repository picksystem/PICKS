import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  headerAppbar: {
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.common.white,
    width: '100%',
    left: 0,
    right: 0,
    zIndex: 1201,
    boxShadow: `0 2px 4px ${theme.palette.shadow.primary}`,

    [theme.breakpoints.down('sm')]: {
      minHeight: '56px',
    },
  },

  headerToolbar: {
    paddingLeft: 3,
    paddingRight: 3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '64px',

    [theme.breakpoints.down('sm')]: {
      paddingLeft: 2,
      paddingRight: 2,
      minHeight: '56px',
    },
  },

  headerTitle: {
    textAlign: 'center',
    color: theme.palette.common.white,
    fontWeight: 600,
    fontSize: '1.2rem',

    [theme.breakpoints.down('md')]: {
      fontSize: '1.1rem',
    },

    [theme.breakpoints.down('sm')]: {
      fontSize: '1rem',
    },
  },

  headerSpacer: {
    flexGrow: 1,
  },

  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
  },
});
