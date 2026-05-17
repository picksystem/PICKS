import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const colorPalette = {
  main: '#0369a1',
  aup: '#2563eb',
  cr: '#7c3aed',
  wt: '#0891b2',
};

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  container: {
    padding: theme.spacing(3),
    width: '100%',

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
  },

  // ── Accordion ───────────────────────────────────────
  sectionAccordion: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: `${theme.spacing(1.5)} !important`,
    marginTop: theme.spacing(2.5),
    width: '100%',

    '&::before': {
      display: 'none',
    },
  },

  sectionHeaderSummary: {
    paddingRight: theme.spacing(2),
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
  },

  sectionHeaderIcon: {
    width: 32,
    height: 32,
    borderRadius: theme.spacing(1.5),
    backgroundColor: colorPalette.main,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
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

  accordionDetails: {
    padding: theme.spacing(2),
  },

  // ── Toolbar ─────────────────────────────────────────
  actionToolbar: {
    padding: theme.spacing(1, 1.5),
    marginBottom: theme.spacing(1.5),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
  },

  toolbarButtons: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing(0.75),

    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      alignItems: 'stretch',
    },
  },

  // ── Tab Buttons ────────────────────────────────────
  tabButton: {
    textTransform: 'none',
    fontWeight: 600,
    borderRadius: 8,
    padding: '6px 12px',
    transition: 'all 0.2s ease-in-out',
    border: '1px solid transparent',

    '&:hover': {
      opacity: 0.9,
    },

    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },

  tabButtonActive: {
    color: theme.palette.common.white,
  },

  tabButtonInactive: {
    backgroundColor: 'transparent',
  },

  tabButtonIcon: {
    fontSize: '1rem',
  },
});
