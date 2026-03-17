import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  root: {
    position: 'sticky',
    top: 80,
    padding: theme.spacing(2),
  },
  nav: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  navItem: {
    padding: theme.spacing(1, 0),
  },
  navLink: {
    textDecoration: 'none',
    color: theme.palette.text.secondary,
    cursor: 'pointer',
    transition: 'color 0.3s ease',
    '&:hover': {
      color: theme.palette.primary.main,
    },
  },
  active: {
    color: theme.palette.primary.main,
    fontWeight: 600,
    borderLeft: `3px solid ${theme.palette.primary.main}`,
    paddingLeft: theme.spacing(1),
  },
});
