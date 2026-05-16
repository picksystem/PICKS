import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  root: {},
  iconStart: {
    marginRight: theme.spacing(1),
  },
  iconEnd: {
    marginLeft: theme.spacing(1),
  },
});
