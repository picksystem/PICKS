import { CSSObject, Theme } from '@mui/material/styles';

export const colorPalette = {
  main: '#0369a1',
  sl: '#059669',
  app: '#2563eb',
  que: '#7c3aed',
  res: '#be185d',
  cat: '#d97706',
};

const centerFlex: CSSObject = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  container: {
    padding: theme.spacing(3),
    width: '100%',
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
  },

  sectionTitle: {
    fontWeight: 700,
    fontSize: '0.95rem',
  },

  sectionSubtitle: {
    fontSize: '0.8rem',
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.25),
  },

  // ── Header ─────────────────────
  sectionHeaderRoot: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
  },

  sectionIconBox: {
    width: 32,
    height: 32,
    borderRadius: theme.shape.borderRadius,
    ...centerFlex,
    flexShrink: 0,
  },

  sectionIcon: {
    color: '#fff',
    fontSize: '1rem',
  },

  details: {
    padding: theme.spacing(2),
  },

  // ── Tabs container ─────────────
  panelTabs: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },

  // ── Base button styles only ────
  panelButtonBase: {
    textTransform: 'none',
  },
});
