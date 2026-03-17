import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  root: {
    borderRadius: 10,
    marginBottom: 10,
    boxShadow: `0 4px 12px ${theme.palette.shadow.light}`,
    overflow: 'hidden',

    '&:before': {
      display: 'none',
    },
  },

  title: {
    fontWeight: 600,
    fontSize: '1rem',
  },

  details: {
    padding: 10,
  },
});
