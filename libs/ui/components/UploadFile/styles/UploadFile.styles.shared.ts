import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  root: {
    border: '2px dashed #ccc',
    borderRadius: 8,
    padding: theme.spacing(4),
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: theme.palette.primary.main,
      backgroundColor: theme.palette.action.hover,
    },
  },
  input: {
    display: 'none',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  helperText: {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(1),
  },
});
