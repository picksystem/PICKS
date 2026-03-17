import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  root: {
    cursor: 'pointer',
    transition: 'color 0.2s ease',
    textDecoration: 'none',
    '&:hover': {
      opacity: 0.8,
    },
  },
});
