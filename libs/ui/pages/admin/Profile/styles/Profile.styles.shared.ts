import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  // ── Page wrapper ────────────────────────────────────────────────────────────
  container: {
    minHeight: '100vh',
    backgroundColor: theme.palette.background.default,
  },

  // ── Hero banner ─────────────────────────────────────────────────────────────
  heroBanner: {
    background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #0369a1 100%)',
    padding: theme.spacing(4, 4, 0),
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: -80,
      right: -80,
      width: 320,
      height: 320,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.05)',
      pointerEvents: 'none',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: -60,
      left: '40%',
      width: 200,
      height: 200,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.04)',
      pointerEvents: 'none',
    },
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(3, 2, 0),
    },
  },

  heroInner: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: theme.spacing(3),
    position: 'relative',
    zIndex: 1,
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
    },
  },

  // ── Avatar ──────────────────────────────────────────────────────────────────
  avatarWrapper: {
    position: 'relative',
    flexShrink: 0,
    cursor: 'pointer',
    '&:hover $avatarOverlay': { opacity: 1 },
  },

  avatarRing: {
    width: 128,
    height: 128,
    borderRadius: '50%',
    padding: 3,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.3) 100%)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
  },

  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover' as const,
    display: 'block',
  },

  avatarInitials: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    fontSize: '2.4rem',
    fontWeight: 700,
    color: '#fff',
    letterSpacing: '-1px',
    userSelect: 'none',
  },

  avatarOverlay: {
    position: 'absolute',
    inset: 3,
    borderRadius: '50%',
    background: 'rgba(0,0,0,0.55)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    opacity: 0,
    transition: 'opacity 0.2s ease',
    color: '#fff',
    fontSize: '0.7rem',
    fontWeight: 600,
    letterSpacing: 0.5,
  },

  // ── Hero text ────────────────────────────────────────────────────────────────
  heroText: {
    flex: 1,
    paddingBottom: theme.spacing(2.5),
    [theme.breakpoints.down('sm')]: {
      paddingBottom: theme.spacing(1),
    },
  },

  heroName: {
    color: '#fff',
    fontWeight: 700,
    fontSize: '1.75rem',
    lineHeight: 1.2,
    [theme.breakpoints.down('sm')]: { fontSize: '1.4rem' },
  },

  heroEmail: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: '0.9rem',
    marginTop: 2,
  },

  heroBadges: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1.5),
    flexWrap: 'wrap',
  },

  heroMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    marginTop: theme.spacing(1),
    flexWrap: 'wrap',
    [theme.breakpoints.down('sm')]: { gap: theme.spacing(1.5) },
  },

  heroMetaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    color: 'rgba(255,255,255,0.7)',
    fontSize: '0.8rem',
  },

  heroActions: {
    display: 'flex',
    gap: theme.spacing(1),
    alignSelf: 'flex-start',
    paddingTop: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      alignSelf: 'stretch',
      flexDirection: 'column' as const,
      paddingTop: theme.spacing(0.5),
      paddingBottom: theme.spacing(1.5),
      gap: theme.spacing(0.75),
      '& button': { width: '100%', justifyContent: 'flex-start' },
    },
  },

  // ── Tabs bar ─────────────────────────────────────────────────────────────────
  tabsBar: {
    background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #0369a1 100%)',
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
    '& .MuiTab-root': {
      color: 'rgba(255,255,255,0.6)',
      fontWeight: 500,
      minHeight: 48,
      textTransform: 'none',
      fontSize: '0.9rem',
      '&.Mui-selected': { color: '#fff', fontWeight: 600 },
    },
    '& .MuiTabs-indicator': {
      backgroundColor: '#fff',
      height: 3,
      borderRadius: '3px 3px 0 0',
    },
  },

  // ── Content area ─────────────────────────────────────────────────────────────
  content: {
    padding: theme.spacing(3, 4),
    [theme.breakpoints.down('sm')]: { padding: theme.spacing(2, 1.5) },
    [theme.breakpoints.between('sm', 'md')]: { padding: theme.spacing(2.5, 2.5) },
  },

  // ── Section card ─────────────────────────────────────────────────────────────
  sectionCard: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: 8,
    boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 4px 12px rgba(0,0,0,0.04)',
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2.5),
    border: `1px solid ${theme.palette.divider}`,
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2.5),
    paddingBottom: theme.spacing(1.5),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },

  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: theme.shape.borderRadius,
    background: 'linear-gradient(135deg, #2563eb 0%, #0369a1 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    flexShrink: 0,
  },

  sectionTitle: {
    fontWeight: 600,
    fontSize: '0.95rem',
    color: theme.palette.text.primary,
  },

  // ── Fields grid ──────────────────────────────────────────────────────────────
  fieldGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: theme.spacing(2.5),
    [theme.breakpoints.down('sm')]: { gridTemplateColumns: '1fr' },
  },

  // ── Read-only field ───────────────────────────────────────────────────────────
  readField: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },

  readLabel: {
    fontSize: '0.72rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: theme.palette.text.secondary,
  },

  readValue: {
    fontSize: '0.9rem',
    color: theme.palette.text.primary,
    fontWeight: 500,
    padding: theme.spacing(0.75, 1.5),
    backgroundColor: theme.palette.grey[50],
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    minHeight: 36,
    display: 'flex',
    alignItems: 'center',
  },

  // ── Password strength ─────────────────────────────────────────────────────────
  strengthRow: {
    display: 'flex',
    gap: 4,
    marginTop: 6,
  },

  strengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: 4,
    transition: 'background-color 0.3s ease',
  },

  strengthLabel: {
    fontSize: '0.75rem',
    fontWeight: 600,
    marginTop: 4,
  },

  // ── Security info grid ────────────────────────────────────────────────────────
  securityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: theme.spacing(2),
    [theme.breakpoints.down('sm')]: { gridTemplateColumns: '1fr' },
  },

  securityItem: {
    padding: theme.spacing(1.5, 2),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.grey[50],
    border: `1px solid ${theme.palette.divider}`,
  },

  // ── Save bar ──────────────────────────────────────────────────────────────────
  saveBar: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(1.5),
    marginTop: theme.spacing(3),
    paddingTop: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column' as const,
      '& button': { width: '100%' },
    },
  },
});
