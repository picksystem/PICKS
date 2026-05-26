import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  container: {
    padding: theme.spacing(3),
    width: '100%',
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
  },

  sectionAccordion: {
    marginTop: theme.spacing(2.5),
    width: '100%',
    '&::before': { display: 'none' },
    border: '1px solid rgba(0, 0, 0, 0.12)',
    borderRadius: '12px !important',
  },
});
