import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  // ── Full-page wrapper ──────────────────────────────────────────────────────
  pageWrapper: {
    display: 'flex',
    minHeight: '100vh',
    overflow: 'hidden',
  },

  // ── Left hero panel ────────────────────────────────────────────────────────
  leftPanel: {
    width: 420,
    flexShrink: 0,
    background: 'linear-gradient(160deg, #1e3a8a 0%, #2563eb 45%, #0369a1 100%)',
    position: 'relative',
    padding: theme.spacing(6, 5),
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    [theme.breakpoints.down('md')]: { display: 'none' },
  },

  circle1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 300,
    height: 300,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.06)',
    pointerEvents: 'none',
  },

  circle2: {
    position: 'absolute',
    bottom: 100,
    left: -60,
    width: 240,
    height: 240,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.05)',
    pointerEvents: 'none',
  },

  circle3: {
    position: 'absolute',
    bottom: -40,
    right: 40,
    width: 160,
    height: 160,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.07)',
    pointerEvents: 'none',
  },

  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    position: 'relative',
    zIndex: 1,
  },

  brandIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  featureRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(2),
    position: 'relative',
    zIndex: 1,
  },

  featureIconWrap: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  signinLink: {
    marginTop: 'auto' as const,
    color: 'rgba(255,255,255,0.7)',
    fontSize: '0.875rem',
    cursor: 'pointer',
    position: 'relative',
    zIndex: 1,
    '&:hover': { color: '#fff' },
    '& strong': { color: '#fff' },
  },

  // ── Right form panel ───────────────────────────────────────────────────────
  rightPanel: {
    flex: 1,
    overflowY: 'auto' as const,
    backgroundColor: theme.palette.background.default,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: theme.spacing(6, 4),
    [theme.breakpoints.down('sm')]: { padding: theme.spacing(4, 2) },
  },

  formContainer: {
    width: '100%',
    maxWidth: 600,
    marginTop: 'auto' as const,
    marginBottom: 'auto' as const,
  },

  // ── Form header (avatar + title) ───────────────────────────────────────────
  formHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(4),
  },

  avatarPreview: {
    width: '60px !important' as unknown as number,
    height: '60px !important' as unknown as number,
    fontSize: '1.4rem !important',
    fontWeight: '700 !important',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%) !important',
    color: '#fff !important',
    flexShrink: 0,
    boxShadow: '0 4px 14px rgba(37,99,235,0.4)',
  },

  // ── Step progress ──────────────────────────────────────────────────────────
  stepRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(4),
    padding: theme.spacing(2, 2.5),
    backgroundColor: theme.palette.background.paper,
    borderRadius: 12,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: `1px solid ${theme.palette.divider}`,
  },

  stepItem: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
  },

  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.3s ease',
    zIndex: 1,
  },

  stepDone: {
    background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
    color: '#fff',
    boxShadow: '0 2px 8px rgba(22,163,74,0.35)',
  },

  stepActive: {
    background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
    color: '#fff',
    boxShadow: '0 2px 10px rgba(37,99,235,0.4)',
  },

  stepIdle: {
    background: theme.palette.grey[100],
    color: theme.palette.text.disabled,
    border: `1px solid ${theme.palette.divider}`,
  },

  stepLabel: {
    fontSize: '0.72rem',
    fontWeight: 500,
    color: theme.palette.text.disabled,
    marginLeft: theme.spacing(0.75),
    whiteSpace: 'nowrap' as const,
  },

  stepLabelActive: {
    color: theme.palette.primary.main,
    fontWeight: 700,
  },

  stepConnector: {
    flex: 1,
    height: 2,
    background: theme.palette.grey[200],
    margin: theme.spacing(0, 1),
    borderRadius: 1,
    transition: 'background 0.3s ease',
  },

  stepConnectorDone: {
    background: 'linear-gradient(90deg, #16a34a, #22c55e)',
  },

  // ── Section card ──────────────────────────────────────────────────────────
  sectionCard: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: 12,
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
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
    width: 30,
    height: 30,
    borderRadius: 8,
    background: 'linear-gradient(135deg, #2563eb 0%, #0369a1 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    flexShrink: 0,
  },

  // ── Step content area ──────────────────────────────────────────────────────
  stepContent: {
    marginBottom: theme.spacing(3),
  },

  // ── Navigation row ─────────────────────────────────────────────────────────
  navRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
    paddingTop: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column' as const,
      justifyContent: 'flex-start',
      '& > button, & > a': { width: '100%' },
    },
  },

  // ── Mobile sign-in link ─────────────────────────────────────────────────────
  mobileSignin: {
    textAlign: 'center' as const,
    marginTop: theme.spacing(3),
    [theme.breakpoints.up('md')]: { display: 'none' },
  },

  brandIcon28: {
    fontSize: '28px !important',
    color: '#fff !important',
  },

  brandTitle: {
    color: '#fff !important',
    letterSpacing: '-0.5px !important',
    fontWeight: '800 !important',
  },

  heroHeading: {
    color: '#fff !important',
    marginTop: `${theme.spacing(5)} !important`,
    marginBottom: `${theme.spacing(1.5)} !important`,
    lineHeight: '1.3 !important',
    position: 'relative' as const,
    zIndex: 1,
    fontWeight: '700 !important',
  },

  heroSubtitle: {
    color: 'rgba(255,255,255,0.7) !important',
    fontSize: '0.9rem !important',
    marginBottom: `${theme.spacing(5)} !important`,
    position: 'relative' as const,
    zIndex: 1,
  },

  featureIconInner: {
    fontSize: '17px !important',
    color: '#fff !important',
  },

  featureLabel: {
    color: 'rgba(255,255,255,0.85) !important',
    fontSize: '0.875rem !important',
  },

  stepIcon: {
    fontSize: '18px !important',
  },

  // ── Old layout classes ─────────────────────────────────────────────────────
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(4, 2),
  },

  card: {
    padding: theme.spacing(4),
    maxWidth: 680,
    width: '100%',
    borderRadius: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(3),
      margin: theme.spacing(2),
    },
  },

  cardTitle: {
    fontWeight: 600,
    fontSize: '1.75rem',
    textAlign: 'center' as const,
    marginBottom: theme.spacing(1),
  },

  cardSubtitle: {
    color: theme.palette.text.secondary,
    textAlign: 'center' as const,
    marginBottom: theme.spacing(3),
  },

  cardSectionTitle: {
    fontWeight: 600,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(0.5),
  },

  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: theme.spacing(2),
  },

  buttonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(2),
    marginTop: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column' as const,
      justifyContent: 'flex-start',
    },
  },

  cancelButton: {
    padding: theme.spacing(1.25, 3),
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },

  submitButton: {
    padding: theme.spacing(1.25, 3),
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },

  links: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: theme.spacing(2),
  },

  link: {
    color: theme.palette.primary.main,
    cursor: 'pointer',
    '&:hover': { textDecoration: 'underline' },
  },
});
