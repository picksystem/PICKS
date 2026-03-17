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
    bottom: 120,
    left: -70,
    width: 260,
    height: 260,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.05)',
    pointerEvents: 'none',
  },

  circle3: {
    position: 'absolute',
    bottom: -50,
    right: 60,
    width: 180,
    height: 180,
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

  signupLink: {
    marginTop: 'auto' as const,
    color: 'rgba(255,255,255,0.7)',
    fontSize: '0.875rem',
    cursor: 'pointer',
    position: 'relative',
    zIndex: 1,
    '&:hover': { color: '#fff' },
    '& strong': { color: '#fff' },
  },

  // ── Right panel ────────────────────────────────────────────────────────────
  rightPanel: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(4),
    backgroundColor: theme.palette.background.default,
    overflow: 'hidden',
    [theme.breakpoints.down('sm')]: { padding: theme.spacing(3, 2) },
  },

  bgShape1: {
    position: 'absolute',
    top: -120,
    right: -120,
    width: 420,
    height: 420,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 70%)',
    pointerEvents: 'none',
  },

  bgShape2: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 320,
    height: 320,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(3,105,161,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },

  // ── Form card ──────────────────────────────────────────────────────────────
  formCard: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: 440,
    backgroundColor: theme.palette.background.paper,
    borderRadius: 20,
    boxShadow: '0 20px 60px rgba(0,0,0,0.13), 0 4px 20px rgba(0,0,0,0.07)',
    overflow: 'hidden',
  },

  cardHeader: {
    background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #0369a1 100%)',
    padding: theme.spacing(4, 4, 3.5),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  formBadge: {
    width: 68,
    height: 68,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.18)',
    border: '2px solid rgba(255,255,255,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  },

  formBody: {
    padding: theme.spacing(3.5, 4, 4),
  },

  oldContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.background.default,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },

  oldCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: '12px',
    padding: theme.spacing(4),
  },

  oldCardHeader: {
    textAlign: 'center' as const,
    marginBottom: theme.spacing(3),
  },

  oldCardIcon: {
    fontSize: '48px !important',
    color: `${theme.palette.primary.main} !important`,
    marginBottom: `${theme.spacing(1)} !important`,
  },

  divider: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },

  dividerCaption: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },

  signupLinkBox: {
    textAlign: 'center' as const,
  },

  signupLinkText: {
    color: `${theme.palette.primary.main} !important`,
    cursor: 'pointer !important',
    fontWeight: '600 !important',
    '&:hover': { textDecoration: 'underline' },
  },

  formTitle: {
    textAlign: 'center' as const,
    marginBottom: theme.spacing(0.5),
  },

  formSubtitle: {
    textAlign: 'center' as const,
    marginBottom: theme.spacing(3.5),
  },

  formBadgeIcon: {
    fontSize: '30px !important',
    color: '#fff !important',
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
});
