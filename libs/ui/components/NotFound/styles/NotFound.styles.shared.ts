import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.default,
    padding: 3,
    marginTop: 70,
  },

  code: {
    fontSize: '4rem',
    fontWeight: 700,
    color: theme.palette.primary.main,
    marginBottom: 1,
  },

  message: {
    fontSize: '1.2rem',
    color: theme.palette.text.secondary,
  },
});
