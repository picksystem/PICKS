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
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: `${theme.spacing(1.5)} !important`,
    marginTop: theme.spacing(2.5),
    width: '100%',
    '&::before': { display: 'none' },
  },

  sectionTitle: {
    fontWeight: 700,
    fontSize: '0.95rem',
  },

  sectionSubtitle: {
    fontSize: '0.8rem',
    color: theme.palette.text.secondary,
    marginTop: 2,
  },

  actionToolbar: {
    padding: `${theme.spacing(1)} ${theme.spacing(1.5)}`,
    marginBottom: theme.spacing(1.5),
    display: 'flex',
    flexDirection: 'column' as const,
    gap: theme.spacing(0.5),
  },

  toolbarButtons: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: theme.spacing(0.75),
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column' as const,
      alignItems: 'stretch',
    },
  },
});