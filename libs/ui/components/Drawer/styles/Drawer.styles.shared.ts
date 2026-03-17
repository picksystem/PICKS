import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  root: {
    [theme.breakpoints.down('sm')]: {
      '& .MuiDrawer-paper': {
        width: 0,
      },
    },
    [theme.breakpoints.up('sm')]: {
      '& .MuiDrawer-paper': {
        width: 250,
      },
    },
  },

  paper: {
    overflowX: 'hidden',
    borderRight: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
  },

  header: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: 2,
  },

  content: {
    padding: 2,
  },
});
