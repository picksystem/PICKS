import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'opacity 0.3s ease',
    '&:hover': {
      opacity: 0.8,
    },
  },
  image: {
    maxWidth: '100%',
    height: 'auto',
    objectFit: 'contain',
  },
});
