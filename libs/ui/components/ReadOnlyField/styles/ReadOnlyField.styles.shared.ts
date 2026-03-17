import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  root: {
    marginBottom: theme.spacing(2),
    '& .MuiInputBase-input': {
      cursor: 'default',
    },
  },
});
