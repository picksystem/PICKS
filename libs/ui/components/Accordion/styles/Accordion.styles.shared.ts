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

  header: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    width: '100%',
  },

  icon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    flexShrink: 0,
  },

  textContainer: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: 1.2,
  },

  title: {
    fontWeight: 600,
    fontSize: '1rem',
  },

  description: {
    fontSize: '0.8rem',
    color: theme.palette.text.secondary,
    marginTop: 2,
  },

  details: {
    padding: 10,
  },
});
