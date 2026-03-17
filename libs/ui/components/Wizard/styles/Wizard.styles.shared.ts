import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  root: {
    width: '100%',
  },
  content: {
    padding: theme.spacing(3, 0),
    minHeight: 300,
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: theme.spacing(2, 0),
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  buttonGroup: {
    display: 'flex',
    gap: theme.spacing(1),
  },
});
