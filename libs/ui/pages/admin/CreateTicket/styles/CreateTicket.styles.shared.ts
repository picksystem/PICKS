import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  container: {
    padding: theme.spacing(3),
  },

  // ── Ticket type selection page ─────────────────────────────────────────
  selectionPage: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    overflow: 'hidden',
  },

  scrollContent: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: theme.spacing(3),
    paddingBottom: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
      paddingBottom: theme.spacing(1.5),
    },
  },

  heroHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(4),
    padding: theme.spacing(3, 4),
    background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #0369a1 100%)',
    borderRadius: 16,
    boxShadow: '0 8px 32px rgba(37,99,235,0.3)',
    position: 'relative' as const,
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute' as const,
      top: -60,
      right: -60,
      width: 200,
      height: 200,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.06)',
      pointerEvents: 'none',
    },
    '&::after': {
      content: '""',
      position: 'absolute' as const,
      bottom: -40,
      left: 60,
      width: 140,
      height: 140,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.05)',
      pointerEvents: 'none',
    },
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2.5, 2.5),
      marginBottom: theme.spacing(3),
      borderRadius: 12,
    },
  },

  heroIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    position: 'relative' as const,
    zIndex: 1,
  },

  heroTitle: {
    color: '#fff',
    fontWeight: 800,
    fontSize: '1.5rem',
    letterSpacing: '-0.3px',
    position: 'relative' as const,
    zIndex: 1,
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.2rem',
    },
  },

  heroSubtitle: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: '0.875rem',
    marginTop: theme.spacing(0.25),
    position: 'relative' as const,
    zIndex: 1,
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.8rem',
    },
  },

  ticketTypeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: theme.spacing(2),
    flex: 1,
    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: '1fr',
      gap: theme.spacing(1.5),
    },
  },

  ticketCard: {
    position: 'relative' as const,
    backgroundColor: theme.palette.background.paper,
    borderRadius: 16,
    padding: theme.spacing(2.5),
    paddingTop: theme.spacing(2.25),
    cursor: 'pointer',
    overflow: 'hidden',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: theme.spacing(1.25),
    outline: 'none',
    userSelect: 'none' as const,
  },

  ticketAccentBar: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },

  ticketIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  ticketCardContent: {
    flex: 1,
    minWidth: 0,
  },

  ticketCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
  },

  ticketCardTitle: {
    fontWeight: 700,
    fontSize: '0.95rem',
    color: theme.palette.text.primary,
    lineHeight: 1.3,
  },

  ticketTag: {
    height: 20,
    borderRadius: '6px !important',
    flexShrink: 0,
  },

  ticketCardDesc: {
    fontSize: '0.8rem',
    color: theme.palette.text.secondary,
    lineHeight: 1.6,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
  },

  // ── CTA bar ────────────────────────────────────────────────────────────
  ctaBar: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1.75, 3),
    backgroundColor: theme.palette.background.paper,
    borderTop: `1px solid ${theme.palette.divider}`,
    boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column' as const,
      alignItems: 'stretch',
      gap: theme.spacing(1.5),
      padding: theme.spacing(2),
    },
  },

  ctaLeft: {
    display: 'flex',
    alignItems: 'center',
  },

  ctaSelected: {
    fontSize: '0.95rem',
    color: theme.palette.text.secondary,
  },

  ctaButtons: {
    display: 'flex',
    gap: theme.spacing(1.5),
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column' as const,
      gap: theme.spacing(1),
      '& .MuiButton-root': { width: '100%' },
    },
  },

  title: {
    marginBottom: theme.spacing(3),
    fontWeight: 600,
    fontSize: '2.125rem',
    [theme.breakpoints.down('sm')]: {
      marginBottom: theme.spacing(2),
      fontSize: '1.5rem',
    },
    [theme.breakpoints.between('sm', 'md')]: {
      marginBottom: theme.spacing(2.5),
      fontSize: '1.75rem',
    },
    [theme.breakpoints.between('md', 'lg')]: {
      fontSize: '2rem',
    },
  },

  description: {
    color: theme.palette.text.secondary,
    fontSize: '1rem',
    lineHeight: 1.6,
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.875rem',
      lineHeight: 1.4,
    },
    [theme.breakpoints.between('sm', 'md')]: {
      fontSize: '0.9rem',
      lineHeight: 1.5,
    },
  },

  formContainer: {
    marginTop: theme.spacing(3),
  },

  sectionTitle: {
    fontWeight: 600,
    fontSize: '1.1rem',
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(3),
  },

  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: '1fr',
    },
  },

  fullWidth: {
    gridColumn: '1 / -1',
  },

  twoColumns: {
    gridColumn: 'span 2',
    [theme.breakpoints.down('sm')]: {
      gridColumn: '1 / -1',
    },
  },

  accordionSection: {
    marginTop: theme.spacing(3),
  },

  buttonContainer: {
    display: 'flex',
    gap: theme.spacing(2),
    marginTop: theme.spacing(4),
    justifyContent: 'flex-end',
    flexWrap: 'wrap' as const,

    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column' as const,
      '& .MuiButton-root': {
        width: '100%',
      },
    },
  },

  ticketNumber: {
    backgroundColor: theme.palette.grey[100],
  },

  attachedFilesTitle: {
    fontWeight: 500,
    marginBottom: theme.spacing(1),
  },

  alert: {
    marginBottom: theme.spacing(2),
  },

  formControlFull: {
    width: '100%',
  },

  comingSoonBox: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: theme.spacing(3),
  },

  actionButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: theme.spacing(3),
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2),
    flexWrap: 'wrap' as const,
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column' as const,
      '& .MuiButton-root': { width: '100%' },
    },
  },
});
