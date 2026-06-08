import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';
import { getBaseStyles as getSharedBaseStyles } from '@serviceops/configbase';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  ...getSharedBaseStyles(theme),
  toolbarButton: {
    padding: `${theme.spacing(0.5)} ${theme.spacing(1.5)}`,
    backgroundColor: 'transparent',
    color: theme.palette.text.secondary,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 500,
    textTransform: 'none' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
});
