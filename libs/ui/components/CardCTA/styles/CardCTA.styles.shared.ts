import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  root: {
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: `0 4px 12px ${theme.palette.shadow.medium}`,
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: `0 8px 24px ${theme.palette.shadow.dark}`,
    },
  },
  media: {
    height: 200,
  },
  content: {
    padding: theme.spacing(3),
  },
  title: {
    fontWeight: 700,
    fontSize: '1.25rem',
    marginBottom: theme.spacing(1),
  },
  description: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(2),
  },
});
