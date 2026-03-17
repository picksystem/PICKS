import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  mainContent: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    transition: 'all 0.3s ease',
    backgroundColor: theme.palette.grey[50],
    overflowX: 'auto',
    overflowY: 'auto',
    width: 'calc(100% - 250px)',
    marginLeft: '250px',
    marginTop: '64px',
    padding: theme.spacing(3),
    minHeight: 'calc(100vh - 64px)',

    [theme.breakpoints.between('md', 'lg')]: {
      width: 'calc(100% - 225px)',
      padding: theme.spacing(2.5),
    },

    [theme.breakpoints.between('sm', 'md')]: {
      width: 'calc(100% - 200px)',
      marginLeft: '200px',
      padding: theme.spacing(2),
      marginTop: '56px',
      minHeight: 'calc(100vh - 56px)',
    },

    [theme.breakpoints.down('sm')]: {
      width: 'calc(100% - 195px)',
      marginLeft: '195px',
      padding: theme.spacing(1.5),
      marginTop: '104px',
      minHeight: 'calc(100vh - 104px)',
    },
  },

  mainContentCollapsed: {
    width: 'calc(100% - 72px)',
    marginLeft: '72px',

    [theme.breakpoints.between('md', 'lg')]: {
      width: 'calc(100% - 70px)',
      marginLeft: '70px',
    },

    [theme.breakpoints.between('sm', 'md')]: {
      width: 'calc(100% - 70px)',
      marginLeft: '70px',
    },

    [theme.breakpoints.down('sm')]: {
      width: 'calc(100% - 68px)',
      marginLeft: '68px',
    },
  },
});
