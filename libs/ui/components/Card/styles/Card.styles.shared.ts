import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  root: {
    borderRadius: '12px',
    boxShadow: `0 4px 12px ${theme.palette.shadow.light}`,
    overflow: 'hidden',
    transition: 'box-shadow 0.3s ease',
    '&:hover': {
      boxShadow: `0 6px 20px ${theme.palette.shadow.strong}`,
    },
  },
  header: {
    padding: theme.spacing(2, 3),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  content: {
    padding: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
  },
  footer: {
    padding: theme.spacing(2, 3),
    borderTop: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.grey[100],
  },
});
