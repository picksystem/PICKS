import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
    borderRadius: 8,
  },
  listItem: {
    borderRadius: 4,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
});
