import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()((theme) => ({
  container: {
    padding: theme.spacing(3),
    minHeight: '100vh',
    background: 'linear-gradient(145deg, #eef2ff 0%, #f8faff 50%, #eff6ff 100%)',
    [theme.breakpoints.down('sm')]: { padding: theme.spacing(1.5) },
  },

  // ── Hero ────────────────────────────────────────────────────────────────
  hero: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
    padding: theme.spacing(3, 4),
    background: 'linear-gradient(135deg, #312e81 0%, #4338ca 45%, #6366f1 100%)',
    borderRadius: 20,
    marginBottom: theme.spacing(3),
    position: 'relative' as const,
    overflow: 'hidden',
    boxShadow: '0 12px 40px rgba(67,56,202,0.4)',
    '&::before': {
      content: '""',
      position: 'absolute' as const,
      top: -60,
      right: -60,
      width: 220,
      height: 220,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.06)',
      pointerEvents: 'none',
    },
    '&::after': {
      content: '""',
      position: 'absolute' as const,
      bottom: -40,
      left: 100,
      width: 160,
      height: 160,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.04)',
      pointerEvents: 'none',
    },
    [theme.breakpoints.down('sm')]: { padding: theme.spacing(2.5, 2), borderRadius: 14 },
  },

  heroIconBox: {
    width: 58,
    height: 58,
    borderRadius: 16,
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    position: 'relative' as const,
    zIndex: 1,
  },

  heroContent: {
    flex: 1,
    position: 'relative' as const,
    zIndex: 1,
  },

  heroTitle: {
    color: '#fff',
    fontWeight: 800,
    fontSize: '1.5rem',
    letterSpacing: '-0.3px',
    [theme.breakpoints.down('sm')]: { fontSize: '1.2rem' },
  },

  heroSub: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: '0.85rem',
    marginTop: theme.spacing(0.5),
    [theme.breakpoints.down('sm')]: { display: 'none' },
  },

  heroChipRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
    flexWrap: 'wrap' as const,
  },

  // ── Two-column layout ────────────────────────────────────────────────────
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.5fr',
    gap: theme.spacing(2.5),
    alignItems: 'stretch',
    // Force both columns to the same height
    '& > *': { minHeight: 0 },
    [theme.breakpoints.down('md')]: { gridTemplateColumns: '1fr' },
  },

  // ── Input cards ─────────────────────────────────────────────────────────
  inputCard: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: 16,
    boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
    border: `1px solid rgba(226,232,255,0.9)`,
    overflow: 'hidden',
  },

  inputCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.5, 2.5),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },

  inputCardIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 9,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  inputCardTitle: {
    fontWeight: 700,
    fontSize: '0.9rem',
    letterSpacing: '0.1px',
  },

  inputCardBody: {
    padding: theme.spacing(2, 2.5),
    '& .MuiTextField-root, & .MuiFormControl-root': { width: '100%' },
    '& .MuiOutlinedInput-root': {
      borderRadius: 10,
      fontSize: '0.9rem',
      background: '#f8faff',
      '& fieldset': { borderColor: 'rgba(226,232,255,0.9)' },
      '&:hover fieldset': { borderColor: '#6366f1' },
      '&.Mui-focused fieldset': { borderColor: '#4338ca' },
    },
    '& textarea': { wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-wrap' },
  },

  // ── Solutions panel ──────────────────────────────────────────────────────
  solutionsPanel: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: 16,
    boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
    border: `1px solid rgba(226,232,255,0.9)`,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
  },

  solutionsPanelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(2, 2.5),
    background: 'linear-gradient(135deg, #f8faff 0%, #eef2ff 100%)',
    borderBottom: `1px solid ${theme.palette.divider}`,
  },

  solutionsPanelTitle: {
    fontWeight: 700,
    fontSize: '0.95rem',
    color: '#4338ca',
    letterSpacing: '0.1px',
  },

  solutionsPanelBody: {
    padding: theme.spacing(2),
    flex: 1,
    overflowY: 'auto' as const,
    minHeight: 0,
  },

  // ── Match card ───────────────────────────────────────────────────────────
  matchCard: {
    padding: theme.spacing(2, 2.5),
    marginBottom: theme.spacing(1.5),
    cursor: 'pointer',
    border: '1.5px solid rgba(226,232,255,0.9)',
    borderRadius: 14,
    borderLeft: '4px solid',
    borderLeftColor: '#e2e8ff',
    transition: 'all 0.22s ease',
    position: 'relative' as const,
    background: '#fff',
    '&:hover': {
      borderColor: '#6366f1',
      borderLeftColor: '#6366f1',
      boxShadow: '0 4px 20px rgba(99,102,241,0.15)',
      transform: 'translateX(3px)',
    },
  },

  matchCardSelected: {
    borderColor: '#4338ca',
    borderLeftColor: '#4338ca',
    background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)',
    boxShadow: '0 0 0 3px rgba(99,102,241,0.15), 0 4px 20px rgba(99,102,241,0.2)',
    transform: 'translateX(3px)',
  },

  matchCardHighMatch: {
    borderLeftColor: '#16a34a !important',
    '&:hover': { borderColor: '#16a34a', boxShadow: '0 4px 20px rgba(22,163,74,0.15)' },
  },

  matchCardHighMatchSelected: {
    borderColor: '#16a34a',
    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    boxShadow: '0 0 0 3px rgba(22,163,74,0.15), 0 4px 20px rgba(22,163,74,0.2)',
  },

  matchHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1),
    flexWrap: 'wrap' as const,
    gap: theme.spacing(0.5),
  },

  matchNumberRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },

  matchNumber: {
    fontWeight: 800,
    fontSize: '0.85rem',
    color: '#4338ca',
    fontFamily: 'monospace',
    background: '#eef2ff',
    padding: '2px 8px',
    borderRadius: 6,
  },

  matchScoreBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '3px 10px',
    borderRadius: 20,
    fontWeight: 800,
    fontSize: '0.75rem',
    letterSpacing: '0.3px',
  },

  matchDescription: {
    fontWeight: 600,
    fontSize: '0.875rem',
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(0.5),
    lineHeight: 1.4,
  },

  matchDescriptionSub: {
    fontSize: '0.8rem',
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(0.75),
    lineHeight: 1.5,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
  },

  matchResolution: {
    fontSize: '0.8rem',
    color: '#4338ca',
    fontStyle: 'italic' as const,
    background: '#eef2ff',
    padding: theme.spacing(0.75, 1.25),
    borderRadius: 8,
    borderLeft: '3px solid #6366f1',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
  },

  selectedCheckIcon: {
    position: 'absolute' as const,
    top: 10,
    right: 10,
    color: '#4338ca',
    fontSize: '1.1rem',
  },

  // ── Empty state ──────────────────────────────────────────────────────────
  emptyState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: theme.spacing(5, 2),
    gap: theme.spacing(1.5),
  },

  emptyIconBox: {
    width: 72,
    height: 72,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px dashed #a5b4fc',
    marginBottom: theme.spacing(1),
  },

  emptyTitle: {
    fontWeight: 700,
    fontSize: '0.95rem',
    color: '#4338ca',
    textAlign: 'center' as const,
  },

  emptySubtitle: {
    fontSize: '0.82rem',
    color: theme.palette.text.secondary,
    textAlign: 'center' as const,
    maxWidth: 320,
    lineHeight: 1.55,
  },

  // ── Pagination ───────────────────────────────────────────────────────────
  paginationSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(2, 2.5),
    borderTop: `1px solid ${theme.palette.divider}`,
    background: 'linear-gradient(135deg, #f8faff 0%, #eef2ff 100%)',
  },

  paginationLabel: {
    fontSize: '0.78rem',
    color: theme.palette.text.secondary,
    textAlign: 'center' as const,
  },

  // ── Left column ─────────────────────────────────────────────────────────
  leftColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 0,
  },

  // ── Nav header ───────────────────────────────────────────────────────────
  navHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1.25, 2),
    background: 'linear-gradient(135deg,#f8faff 0%,#eef2ff 100%)',
    borderBottom: '1px solid rgba(226,232,255,0.9)',
    minHeight: 52,
  },

  navArrowActive: {
    width: 34,
    height: 34,
    borderRadius: '10px',
    background: 'linear-gradient(135deg,#4338ca,#6366f1)',
    color: '#fff',
    boxShadow: '0 2px 8px rgba(99,102,241,0.35)',
    '&:hover': { background: 'linear-gradient(135deg,#3730a3,#4338ca)' },
  },

  navArrowDisabled: {
    width: 34,
    height: 34,
    borderRadius: '10px',
    background: '#f1f5f9',
    color: '#cbd5e1',
    '&.Mui-disabled': { background: '#f1f5f9', color: '#cbd5e1' },
  },

  navTitleBox: {
    textAlign: 'center' as const,
    flex: 1,
    padding: theme.spacing(0, 1),
  },

  navTitleText: {
    fontWeight: 800,
    fontSize: '0.95rem',
    color: '#4338ca',
    fontFamily: 'monospace',
    letterSpacing: '0.5px',
  },

  navTitleEmpty: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    fontWeight: 600,
  },

  // ── Loading state ────────────────────────────────────────────────────────
  loadingBox: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: theme.spacing(2),
    padding: theme.spacing(4),
  },

  loadingBar: {
    width: '80%',
    borderRadius: 2,
    '& .MuiLinearProgress-bar': {
      background: 'linear-gradient(90deg,#4338ca,#6366f1)',
    },
  },

  // ── Score banner ─────────────────────────────────────────────────────────
  scoreBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(2),
    marginBottom: theme.spacing(1.5),
    borderRadius: '14px',
  },

  scoreCircleInner: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scorePercent: {
    fontSize: '0.95rem',
    fontWeight: 900,
    lineHeight: 1,
  },

  scoreMatchLabel: {
    fontSize: '0.5rem',
    color: '#94a3b8',
    fontWeight: 700,
    letterSpacing: '0.5px',
  },

  scoreDetailsBox: {
    flex: 1,
    minWidth: 0,
  },

  scoreChipRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    flexWrap: 'wrap' as const,
    marginBottom: theme.spacing(0.5),
  },

  statusChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '0.72rem',
    fontWeight: 700,
  },

  scoreCreatedDate: {
    fontSize: '0.7rem',
    color: '#64748b',
    fontWeight: 600,
  },

  // ── Short description section ────────────────────────────────────────────
  shortDescSection: {
    padding: theme.spacing(0, 0.5),
    marginBottom: theme.spacing(1.5),
  },

  shortDescLabel: {
    fontSize: '0.62rem',
    color: '#4338ca',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.7px',
    marginBottom: theme.spacing(0.5),
  },

  shortDescValue: {
    fontSize: '0.98rem',
    fontWeight: 700,
    color: '#1e293b',
    lineHeight: 1.4,
  },

  // ── Description card ─────────────────────────────────────────────────────
  descCard: {
    padding: theme.spacing(1.5),
    marginBottom: theme.spacing(1.5),
    borderRadius: '12px',
    background: 'linear-gradient(135deg,#f8faff,#eef2ff)',
    border: '1px solid rgba(226,232,255,0.9)',
  },

  descCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    marginBottom: theme.spacing(0.75),
  },

  descCardLabel: {
    fontSize: '0.62rem',
    color: '#6366f1',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.7px',
  },

  descCardText: {
    fontSize: '0.83rem',
    color: '#334155',
    lineHeight: 1.6,
  },

  // ── Resolution card ──────────────────────────────────────────────────────
  resCard: {
    padding: theme.spacing(1.5),
    marginBottom: theme.spacing(1.5),
    borderRadius: '12px',
    background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)',
    border: '1px solid #86efac',
    borderLeft: '4px solid #16a34a',
  },

  resCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    marginBottom: theme.spacing(0.75),
  },

  resCardLabel: {
    fontSize: '0.62rem',
    color: '#15803d',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.7px',
  },

  resCardText: {
    fontSize: '0.83rem',
    color: '#15803d',
    lineHeight: 1.6,
  },

  // ── Mark as useful row ───────────────────────────────────────────────────
  markUsefulRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: theme.spacing(0.75, 1),
    borderRadius: '10px',
    background: '#f8faff',
    border: '1px solid rgba(226,232,255,0.9)',
    transition: 'all 0.2s ease',
  },

  markUsefulRowChecked: {
    background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)',
    border: '1px solid #86efac',
  },

  markUsefulLabel: {
    fontSize: '0.83rem',
    fontWeight: 600,
    color: '#64748b',
  },

  markUsefulLabelChecked: {
    color: '#15803d',
  },

  // ── Detail row ───────────────────────────────────────────────────────────
  detailRow: {
    display: 'flex',
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(1.5),
  },

  detailRowIconBox: {
    width: 30,
    height: 30,
    borderRadius: '9px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },

  detailRowContent: {
    minWidth: 0,
    flex: 1,
  },

  detailRowLabel: {
    fontSize: '0.62rem',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.7px',
    marginBottom: 2,
  },

  detailRowValue: {
    fontSize: '0.85rem',
    color: '#1e293b',
    fontWeight: 500,
    lineHeight: 1.5,
    wordBreak: 'break-word' as const,
  },

  // ── Hero chips ───────────────────────────────────────────────────────────
  heroChipTicket: {
    background: 'rgba(255,255,255,0.18)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.3)',
    fontWeight: 700,
    fontSize: '0.72rem',
    fontFamily: 'monospace',
    height: 22,
  },

  heroChipCount: {
    background: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.85)',
    border: '1px solid rgba(255,255,255,0.2)',
    fontSize: '0.72rem',
    height: 22,
  },

  heroChipMatches: {
    background: 'rgba(134,239,172,0.22)',
    color: '#86efac',
    border: '1px solid rgba(134,239,172,0.4)',
    fontWeight: 700,
    fontSize: '0.72rem',
    height: 22,
  },

  // ── Input card icon badges ────────────────────────────────────────────────
  iconBadgeIndigo: {
    background: 'linear-gradient(135deg,#4338ca,#6366f1)',
    boxShadow: '0 3px 10px rgba(99,102,241,0.35)',
  },

  iconBadgeCyan: {
    background: 'linear-gradient(135deg,#0e7490,#06b6d4)',
    boxShadow: '0 3px 10px rgba(6,182,212,0.3)',
  },

  // ── Issue description card (stretchy) ────────────────────────────────────
  issueDescBody: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    '& .MuiTextField-root': { flex: 1 },
    '& .MuiInputBase-root': { height: '100%', alignItems: 'flex-start' },
  },

  // ── Btn variants ─────────────────────────────────────────────────────────
  backBtn: {
    color: '#6366f1',
    borderColor: '#c7d2fe',
    '&:hover': { borderColor: '#6366f1' },
  },

  cancelBtn: {
    color: '#ef4444',
    borderColor: '#fca5a5',
    '&:hover': { borderColor: '#ef4444', backgroundColor: '#fef2f2' },
  },

  draftBtn: {
    color: '#d97706',
    borderColor: '#fde68a',
    '&:hover': { borderColor: '#d97706', backgroundColor: '#fefce8' },
  },

  newIncidentBtn: {
    color: '#4338ca',
    borderColor: '#4338ca',
    '&:hover': { backgroundColor: '#eef2ff' },
  },

  applyBtnActive: {
    background: 'linear-gradient(135deg,#16a34a 0%,#22c55e 100%)',
    boxShadow: '0 4px 16px rgba(22,163,74,0.4)',
    fontWeight: 700,
    '&:hover': { background: 'linear-gradient(135deg,#15803d 0%,#16a34a 100%)' },
  },

  flexSpacer: {
    flex: 1,
  },

  // ── Action buttons ───────────────────────────────────────────────────────
  buttonContainer: {
    display: 'flex',
    gap: theme.spacing(1.5),
    marginTop: theme.spacing(3),
    justifyContent: 'flex-end',
    flexWrap: 'wrap' as const,
    padding: theme.spacing(2.5, 3),
    backgroundColor: theme.palette.background.paper,
    borderRadius: 16,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    '& .MuiButton-root': {
      textTransform: 'none',
      borderRadius: 9,
      padding: theme.spacing(0.875, 2.5),
      fontSize: '0.875rem',
      fontWeight: 600,
    },
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column' as const,
      '& .MuiButton-root': { width: '100%' },
    },
  },
}));
