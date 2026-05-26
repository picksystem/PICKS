import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  accordion: {
    boxShadow: 'none',
    border: '1px solid rgba(0, 0, 0, 0.12)',
    borderRadius: '12px !important',
    '&::before': { display: 'none' },
  },

  accordionSummary: {
    pr: 2,
  },

  expandIcon: {
    color: '#2d5ebb',
  },

  headerContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  iconBox: {
    width: 32,
    height: 32,
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  icon: {
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
  },

  title: {
    fontWeight: 700,
    fontSize: '0.95rem',
  },

  subtitle: {
    fontSize: '0.8rem',
    color: theme.palette.text.secondary,
    marginTop: 2,
  },

  accordionDetails: {
    p: 2,
  },
});
