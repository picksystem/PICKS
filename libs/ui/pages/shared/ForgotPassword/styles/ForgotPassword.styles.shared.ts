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
    right: 50,
    width: 170,
    height: 170,
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

  // ── Numbered recovery steps on left panel ──────────────────────────────────
  recoveryStep: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(2.5),
    position: 'relative',
    zIndex: 1,
  },

  recoveryNum: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'rgba(255,255,255,0.6)',
    flexShrink: 0,
    marginTop: 2,
    transition: 'all 0.3s ease',
  },

  recoveryNumActive: {
    background: 'rgba(255,255,255,0.95)',
    color: '#1e3a8a',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
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
    maxWidth: 460,
    backgroundColor: theme.palette.background.paper,
    borderRadius: 20,
    boxShadow: '0 20px 60px rgba(0,0,0,0.13), 0 4px 20px rgba(0,0,0,0.07)',
    overflow: 'hidden',
  },

  cardHeader: {
    background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #0369a1 100%)',
    padding: theme.spacing(3.5, 4, 3),
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
    padding: theme.spacing(3, 4, 4),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2.5, 2, 3),
    },
  },

  // ── Step progress strip ────────────────────────────────────────────────────
  stepRow: {
    position: 'relative',
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2, 4, 1.5),
    backgroundColor: theme.palette.grey[50],
    borderRadius: 10,
    border: `1px solid ${theme.palette.divider}`,
    // Mobile: match SignUp's horizontal connector style
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(1.5, 2),
      backgroundColor: theme.palette.background.paper,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    },
  },

  stepTrackBg: {
    position: 'absolute' as const,
    top: 28,
    left: 48,
    right: 48,
    height: 2,
    background: theme.palette.grey[200],
    borderRadius: 1,
    // Hide on mobile (connector lines used instead)
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },

  stepTrackFill: {
    position: 'absolute' as const,
    top: 28,
    left: 48,
    height: 2,
    background: 'linear-gradient(90deg, #16a34a, #22c55e)',
    borderRadius: 1,
    transition: 'width 0.4s ease',
    // Hide on mobile (connector lines used instead)
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },

  stepItemsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative' as const,
    zIndex: 1,
    // Mobile: stretch to fill the stepRow flex container
    [theme.breakpoints.down('sm')]: {
      flex: 1,
      justifyContent: 'space-between',
    },
  },

  stepItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: theme.spacing(0.75),
    // Mobile: horizontal layout matching SignUp
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'row' as const,
      alignItems: 'center',
      flex: 1,
      gap: 0,
    },
  },

  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.3s ease',
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
    fontSize: '0.65rem',
    fontWeight: 500,
    color: theme.palette.text.disabled,
    textAlign: 'center' as const,
    lineHeight: 1.2,
    maxWidth: 64,
    // Mobile: show label beside icon like SignUp
    [theme.breakpoints.down('sm')]: {
      textAlign: 'left' as const,
      marginLeft: theme.spacing(0.75),
      whiteSpace: 'nowrap' as const,
      maxWidth: 'unset',
    },
  },

  stepLabelActive: {
    color: theme.palette.primary.main,
    fontWeight: 700,
  },

  stepConnector: {
    display: 'none',
  },

  stepConnectorDone: {},

  // ── Email chip in OTP step ─────────────────────────────────────────────────
  emailChip: {
    backgroundColor: `${theme.palette.primary.main}14`,
    color: theme.palette.primary.main,
    fontWeight: 500,
    borderRadius: 8,
    border: `1px solid ${theme.palette.primary.main}30`,
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
    marginBottom: `${theme.spacing(4)} !important`,
    position: 'relative' as const,
    zIndex: 1,
  },

  recoveryStepTitle: {
    fontSize: '0.9rem !important',
    lineHeight: '1.3 !important',
  },

  recoveryStepActiveTitle: {
    color: '#fff !important',
  },

  recoveryStepInactiveTitle: {
    color: 'rgba(255,255,255,0.45) !important',
  },

  recoveryStepCaption: {},

  recoveryStepActiveCaption: {
    color: 'rgba(255,255,255,0.65) !important',
  },

  recoveryStepInactiveCaption: {
    color: 'rgba(255,255,255,0.3) !important',
  },

  securityNote: {
    marginTop: theme.spacing(3),
    padding: '10px 16px',
    borderRadius: (theme.shape.borderRadius as number) * 2,
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    position: 'relative' as const,
    zIndex: 1,
  },

  securityNoteText: {
    color: 'rgba(255,255,255,0.65) !important',
    fontSize: '0.78rem !important',
  },

  stepIcon: {
    fontSize: '15px !important',
  },
});
