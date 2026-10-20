import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  container: {
    padding: theme.spacing(3),
    [theme.breakpoints.down('sm')]: { padding: theme.spacing(1.5) },
    [theme.breakpoints.between('sm', 'md')]: { padding: theme.spacing(2) },
  },

  pageHeader: {
    marginBottom: theme.spacing(2.5),
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: theme.spacing(2.5, 3),
    position: 'relative' as const,
    border: '1px solid #e5e7eb',
    overflow: 'hidden' as const,
    '&::before': {
      content: '""',
      position: 'absolute' as const,
      left: 0,
      top: 0,
      bottom: 0,
      width: 4,
      backgroundColor: '#2563eb',
      borderTopLeftRadius: 12,
      borderBottomLeftRadius: 12,
    },
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
      borderRadius: 8,
    },
  },

  /* ── Top bar (tabs + actions) ─────────────────────────────── */
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(1.5),
    gap: theme.spacing(1),
    flexWrap: 'wrap' as const,
  },

  tabsBar: {
    borderBottom: 'none',
    gap: 0,
  },

  topAction: {
    '& .MuiButton-startIcon': { marginRight: theme.spacing(0.75) },
  },

  /* ── Person / period bar ───────────────────────────────────── */
  periodBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing(2),
    padding: theme.spacing(1, 2),
    marginBottom: theme.spacing(1.5),
    flexWrap: 'wrap' as const,
    background: 'linear-gradient(100deg, #2c1a5c 0%, #3b2a8a 45%, #2d5ebb 100%)',
    borderRadius: 4,
    color: '#ffffff',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    '&::after': {
      content: '""',
      position: 'absolute' as const,
      right: 0,
      top: 0,
      bottom: 0,
      width: '18%',
      background:
        'linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0.05) 60%, transparent 80%)',
      pointerEvents: 'none' as const,
    },
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'center',
      textAlign: 'center',
    },
  },

  personName: {
    fontWeight: 700,
    fontSize: '1rem',
    color: '#ffffff',
  },

  periodControls: {
    position: 'relative' as const,
    zIndex: 1,
    alignItems: 'center',
  },

  periodLabel: {
    fontSize: '0.95rem',
    fontWeight: 700,
    letterSpacing: '0.02em',
    whiteSpace: 'nowrap' as const,
  },

  periodNav: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    color: '#1e3a8a',
    '&:hover': { backgroundColor: '#ffffff' },
  },

  /* ── Summary card ────────────────────────────────────────────── */
  summaryCard: {
    backgroundColor: theme.palette.background.paper,
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: theme.spacing(2.5, 3),
    marginBottom: theme.spacing(2),
    '&::before': {
      content: '""',
      position: 'absolute' as const,
      left: 0,
      top: 0,
      bottom: 0,
      width: 4,
      backgroundColor: '#2563eb',
      borderTopLeftRadius: 12,
      borderBottomLeftRadius: 12,
    },
    position: 'relative' as const,
    overflow: 'hidden' as const,
    [theme.breakpoints.down('sm')]: { padding: theme.spacing(2), borderRadius: 8 },
  },

  summaryRow: {
    marginBottom: theme.spacing(2),
    flexWrap: 'wrap' as const,
  },

  pageTitle: {
    fontWeight: 800,
    color: '#1e293b',
    fontSize: '1.5rem',
    letterSpacing: '-0.01em',
  },

  metaFields: {
    gap: theme.spacing(1),
  },

  periodBox: {
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: theme.spacing(1, 1.5),
    gap: theme.spacing(1),
    flexWrap: 'wrap' as const,
  },

  statsRow: {
    flexWrap: 'wrap' as const,
    gap: theme.spacing(2),
  },

  statCard: {
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: theme.spacing(1.5, 2),
    minWidth: 200,
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: theme.spacing(0.5),
  },

  statIcon: {
    color: theme.palette.text.secondary,
  },

  statField: {
    minWidth: 150,
    '& .MuiOutlinedInput-root': {
      height: 38,
      fontSize: '0.85rem',
    },
    '& .MuiInputBase-input': { padding: '6px 10px' },
  },

  /* ── Lines section ───────────────────────────────────────────── */
  linesSection: {
    backgroundColor: theme.palette.background.paper,
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: theme.spacing(2, 2.5),
  },

  linesHeader: {
    marginBottom: theme.spacing(1.5),
    flexWrap: 'wrap' as const,
    gap: theme.spacing(1),
  },

  addLineBar: {
    display: 'flex' as const,
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1.5),
    flexWrap: 'wrap' as const,
    alignItems: 'flex-end' as const,
  },

  addLineField: {
    minWidth: 180,
  },

  /* ── Table ───────────────────────────────────────────────────── */
  tableContainer: {
    overflowX: 'auto' as const,
    border: '1px solid #e5e7eb',
    borderRadius: 8,
  },

  headerCell: {
    fontWeight: 700,
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    borderBottom: `2px solid ${theme.palette.divider}`,
    whiteSpace: 'nowrap' as const,
    padding: theme.spacing(0.75, 0.75),
  },

  dataRow: {
    '&:hover': {
      backgroundColor: 'rgba(37,99,235,0.03)',
    },
    '& td': {
      padding: theme.spacing(0.5, 0.75),
      verticalAlign: 'middle' as const,
    },
  },

  selectCell: {
    width: 40,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(0.5),
  },

  cellSelectHeader: {
    minWidth: 140,
  },

  checkbox: {
    cursor: 'pointer' as const,
    color: theme.palette.primary.main,
  },

  cellSelect: {
    '& .MuiOutlinedInput-root': {
      height: 30,
      fontSize: '0.8rem',
      minWidth: 120,
    },
    '& .MuiInputBase-input': {
      padding: '3px 8px',
      fontSize: '0.8rem',
    },
  },

  dayCellField: {
    '& .MuiOutlinedInput-root': {
      height: 30,
      minWidth: 36,
      maxWidth: 44,
    },
    '& .MuiOutlinedInput-root .MuiOutlinedInput-input': {
      textAlign: 'center' as const,
      padding: '3px 4px',
      fontSize: '0.8rem',
    },
  },

  dayCell: {
    textAlign: 'center' as const,
    fontSize: '0.8rem',
  },

  totalsGrandCell: {
    color: theme.palette.primary.dark,
  },

  /* ── Day cell with sub-total ───────────────────────────────── */
  dayColumn: {
    minWidth: 84,
    textAlign: 'center' as const,
  },

  daySubTotal: {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    fontWeight: 400,
    marginTop: theme.spacing(0.25),
  },

  /* ── Action toolbar (Copy / Add to favourites / notes / totals) ── */
  linesToolbar: {
    display: 'flex' as const,
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1.5),
    flexWrap: 'wrap' as const,
  },

  toolbarTitle: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: theme.palette.text.primary,
    marginRight: theme.spacing(0.5),
    whiteSpace: 'nowrap' as const,
  },

  toolbarDivider: {
    width: 1,
    height: 20,
    backgroundColor: theme.palette.divider,
    margin: '0 8px',
    alignSelf: 'center',
  },

  toolbarToggle: {
    display: 'inline-flex' as const,
    alignItems: 'center',
    gap: theme.spacing(0.75),
    fontSize: '0.8rem',
    fontWeight: 600,
    color: theme.palette.text.secondary,
    whiteSpace: 'nowrap' as const,
  },

  /* ── Toolbar toggle switch sizing ───────────────────────────── */
  toolbarToggleSwitch: {
    '& .MuiSwitch-root': {
      height: 24,
      width: 44,
      '& .MuiSwitch-switchBase': {
        padding: 3,
      },
      '& .MuiSwitch-thumb': {
        width: 16,
        height: 16,
      },
    },
  },

  /* ── Billable toggle cell ───────────────────────────────────── */
  billableCell: {
    display: 'flex' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(0.5),
    padding: theme.spacing(0.5, 0.75),
  },

  billableSwitch: {
    '& .MuiSwitch-switchBase': {
      padding: 2,
    },
    '& .MuiSwitch-thumb': {
      width: 14,
      height: 14,
    },
  },

  noteInput: {
    '& .MuiOutlinedInput-root': {
      height: 30,
      fontSize: '0.8rem',
      backgroundColor: '#f8fafc',
    },
    '& .MuiInputBase-input': {
      padding: '3px 8px',
      fontSize: '0.8rem',
    },
    '& .MuiIconButton-standard': {
      fontSize: '1.05rem',
    },
  },

  /* ── Status pill ────────────────────────────────────────────── */
  statusCell: {
    whiteSpace: 'nowrap' as const,
  },

  statusPill: {
    display: 'inline-flex' as const,
    alignItems: 'center',
    gap: 6,
    fontSize: '0.75rem',
    fontWeight: 600,
    padding: '3px 10px',
    borderRadius: 999,
    backgroundColor: 'rgba(255,152,0,0.12)',
    color: '#b45309',
  },

  statusPillApproved: {
    backgroundColor: 'rgba(0,138,0,0.1)',
    color: '#008a00',
  },

  /* ── Line actions cell ──────────────────────────────────────── */
  actionsCell: {
    whiteSpace: 'nowrap' as const,
  },

  actionIconButton: {
    p: 0.5,
    borderRadius: 6,
  },

  /* ── Detail totals rows ─────────────────────────────────────── */
  totalsBody: {
    '& tr:last-child td': {
      paddingBottom: 0,
    },
  },

  totalsRow: {
    '& td': {
      borderTop: `1px dashed ${theme.palette.divider}`,
      paddingTop: 0,
      paddingBottom: 0,
      height: 34,
      backgroundColor: theme.palette.background.paper,
      '&:first-child': { paddingLeft: theme.spacing(2) },
    },
    '&:hover td': {
      backgroundColor: theme.palette.background.paper,
    },
  },

  totalsLabelCell: {
    textAlign: 'right' as const,
    paddingLeft: theme.spacing(2),
  },

  totalsDayCell: {
    display: 'flex' as const,
    justifyContent: 'center',
    fontSize: '0.8rem',
    fontWeight: 500,
    color: theme.palette.text.primary,
    '& .MuiOutlinedInput-root': {
      height: 26,
      maxWidth: 44,
      minWidth: 36,
      borderStyle: 'dashed' as const,
      '& .MuiOutlinedInput-input': {
        padding: '2px 4px',
        fontSize: '0.78rem',
      },
    },
  },

  totalsRatioCell: {
    color: theme.palette.text.secondary,
  },

  /* ── Day column width helper ────────────────────────────────── */
  dayColumnWidth: {
    minWidth: 76,
  },

  /* ── Totals row label ──────────────────────────────────────── */
  totalsRowLabel: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: theme.palette.text.primary,
  },

  /* ── Empty state ─────────────────────────────────────────────── */
  emptyState: {
    textAlign: 'center' as const,
    paddingTop: theme.spacing(6),
    paddingBottom: theme.spacing(6),
    border: '2px dashed',
    borderColor: theme.palette.divider,
    borderRadius: (theme.shape.borderRadius as number) * 3,
  },

  emptyIcon: {
    fontSize: '40px !important',
    color: `${theme.palette.text.disabled} !important`,
    marginBottom: `${theme.spacing(1)}!important`,
  },

  /* ── Footer actions ──────────────────────────────────────────── */
  footerActions: {
    marginTop: theme.spacing(3),
    paddingTop: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
  },

  postSubmit: {
    marginTop: theme.spacing(2),
    textAlign: 'center' as const,
  },

  modalFooter: {
    justifyContent: 'center' as const,
  },
});
