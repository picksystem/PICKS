import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  root: {
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1, 2),
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  title: {
    fontWeight: 600,
    fontSize: '1.25rem',
  },
});
