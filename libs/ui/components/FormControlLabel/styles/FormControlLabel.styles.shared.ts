import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  root: {
    margin: 0,
    '& .MuiFormControlLabel-label': {
      fontSize: '0.95rem',
    },
  },
});
