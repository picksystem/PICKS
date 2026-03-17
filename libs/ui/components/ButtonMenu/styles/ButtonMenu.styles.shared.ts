import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  menu: {
    '& .MuiPaper-root': {
      borderRadius: 8,
      marginTop: theme.spacing(1),
      boxShadow: `0 4px 12px ${theme.palette.shadow.dark}`,
    },
  },
  menuItem: {
    padding: theme.spacing(1.5, 2),
    fontSize: '0.875rem',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
});
