import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  tooltip: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
    fontSize: '0.75rem',
    borderRadius: 6,
    padding: theme.spacing(1, 1.5),
    maxWidth: 300,
    boxShadow: `0 4px 12px ${theme.palette.common.black}`,
  },
  arrow: {
    color: theme.palette.common.black,
  },
});
