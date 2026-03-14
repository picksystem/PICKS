import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()((theme) => ({
  formContainer: {
    '& .MuiFormLabel-asterisk': { color: theme.palette.error.main },
    '& .MuiInputLabel-asterisk': { color: theme.palette.error.main },
  },

  // ── Hero header ──────────────────────────────────────────────────────────
  heroHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
    padding: theme.spacing(3, 4),
    borderRadius: 16,
    marginBottom: theme.spacing(3),
    position: 'relative' as const,
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute' as const,
      top: -50,
      right: -50,
      width: 180,
      height: 180,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.07)',
      pointerEvents: 'none',
    },
    '&::after': {
      content: '""',
      position: 'absolute' as const,
      bottom: -30,
      left: 80,
      width: 120,
      height: 120,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.05)',
      pointerEvents: 'none',
    },
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2.5, 2),
      borderRadius: 12,
    },
  },

  heroIcon: {
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
    fontSize: '1.4rem',
    letterSpacing: '-0.3px',
    position: 'relative' as const,
    zIndex: 1,
    [theme.breakpoints.down('sm')]: { fontSize: '1.15rem' },
  },

  heroNumber: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '0.78rem',
    fontWeight: 500,
    marginTop: theme.spacing(0.25),
    position: 'relative' as const,
    zIndex: 1,
    letterSpacing: '0.5px',
  },

  heroSub: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: '0.82rem',
    marginTop: theme.spacing(0.5),
    position: 'relative' as const,
    zIndex: 1,
    [theme.breakpoints.down('sm')]: { display: 'none' },
  },

  // ── Section card ─────────────────────────────────────────────────────────
  sectionCard: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: 14,
    borderLeft: '4px solid',
    borderLeftColor: theme.palette.primary.main,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    marginBottom: theme.spacing(2.5),
    overflow: 'hidden',
  },

  sectionCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.5, 2.5),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },

  sectionIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 9,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  sectionCardTitle: {
    fontWeight: 700,
    fontSize: '0.95rem',
    letterSpacing: '0.1px',
  },

  sectionCardBody: {
    padding: theme.spacing(2.5, 3),
    [theme.breakpoints.down('sm')]: { padding: theme.spacing(2) },
  },

  sectionTitle: {
    display: 'none',
  },

  // ── Form grid ────────────────────────────────────────────────────────────
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: theme.spacing(2),
    [theme.breakpoints.down('md')]: { gridTemplateColumns: 'repeat(2, 1fr)' },
    [theme.breakpoints.down('sm')]: { gridTemplateColumns: '1fr' },
  },

  fullWidth: { gridColumn: '1 / -1' },

  twoColumns: {
    gridColumn: 'span 2',
    [theme.breakpoints.down('sm')]: { gridColumn: '1 / -1' },
  },

  // ── Action buttons bar ───────────────────────────────────────────────────
  buttonContainer: {
    display: 'flex',
    gap: theme.spacing(1.5),
    marginTop: theme.spacing(2),
    justifyContent: 'flex-end',
    flexWrap: 'wrap' as const,
    padding: theme.spacing(2.5, 3),
    backgroundColor: theme.palette.background.paper,
    borderRadius: 14,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    '& .MuiButton-root': {
      textTransform: 'none',
      borderRadius: 8,
      padding: theme.spacing(0.875, 2.5),
      fontSize: '0.875rem',
      fontWeight: 600,
    },
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column' as const,
      '& .MuiButton-root': { width: '100%' },
    },
  },

  ticketNumber: {
    '& .MuiInputBase-root': {
      backgroundColor: theme.palette.grey[100],
    },
    '& .MuiInputBase-input': {
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
    },
  },

  attachedFilesTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(1),
    fontSize: '0.875rem',
  },

  attachedFilesList: { marginTop: theme.spacing(2) },

  alert: { marginBottom: theme.spacing(2) },

  manualCallerSection: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },

  manualCallerFields: {
    marginTop: theme.spacing(1.5),
    padding: theme.spacing(2.5),
    background: `linear-gradient(135deg, ${theme.palette.primary.main}06 0%, ${theme.palette.primary.main}0a 100%)`,
    borderRadius: 10,
    border: `1px solid ${theme.palette.primary.main}25`,
  },

  checkboxRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    flexWrap: 'wrap' as const,
  },
}));
