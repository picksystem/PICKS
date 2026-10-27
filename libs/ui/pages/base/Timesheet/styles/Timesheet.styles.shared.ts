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
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing(2),
    padding: theme.spacing(1, 2),
    marginBottom: theme.spacing(1),
    flexWrap: 'wrap' as const,
    backgroundColor: '#ffffff',
    borderRadius: 4,
    border: '1px solid #e5e7eb',
    color: '#111827',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    '&::after': {
      content: '""',
      position: 'absolute' as const,
      right: 0,
      top: 0,
      bottom: 0,
      width: '18%',
      background: 'linear-gradient(115deg, transparent 30%, rgba(0,0,0,0.03) 50%, transparent 80%)',
      pointerEvents: 'none' as const,
    },
  },

  personName: {
    fontWeight: 700,
    fontSize: '1rem',
    color: '#111827',
  },

  periodControls: {
    position: 'relative' as const,
    zIndex: 1,
    alignItems: 'center',
  },

  periodNav: {
    backgroundColor: '#ffffff',
    border: '1px solid #d1d5db',
    color: '#1e3a8a',
    minWidth: 36,
    height: 36,
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 0,
    '&:hover': {
      backgroundColor: '#f3f4f6',
      border: '1px solid #9ca3af',
    },
  },

  periodLabel: {
    fontSize: '0.95rem',
    fontWeight: 700,
    letterSpacing: '0.02em',
    whiteSpace: 'nowrap' as const,
  },

  /* ── Summary stat cards (top of page, below topBar) ────────── */
  statCardsRow: {
    display: 'flex' as const,
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(2),
    flexWrap: 'wrap' as const,
    alignItems: 'flex-start' as const,
  },

  statCardWrapper: {
    flex: '1 1 140px',
    minWidth: 140,
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: theme.spacing(1.25, 1.5),
    display: 'flex' as const,
    alignItems: 'center',
    gap: theme.spacing(1.25),
  },

  statCardIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    display: 'flex' as const,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  statCardValue: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#111827',
    lineHeight: 1.1,
  },

  statCardLabel: {
    marginTop: 1,
    fontSize: '0.85rem',
    color: '#6b7280',
    fontWeight: 500,
    lineHeight: 1.3,
  },

  /* ── Totals row detail label cell ─────────────────────────── */
  totalsDetailLabelCell: {
    textAlign: 'right' as const,
    paddingLeft: theme.spacing(2),
    fontSize: '0.8rem',
    color: theme.palette.text.secondary,
  },

  statCardRow2: {
    display: 'flex' as const,
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(1.5),
    flexWrap: 'wrap' as const,
    alignItems: 'flex-start' as const,
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
    padding: theme.spacing(1.5, 2),
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
    fontSize: '0.7rem',
    color: theme.palette.text.secondary,
    borderBottom: `2px solid ${theme.palette.divider}`,
    whiteSpace: 'nowrap' as const,
    padding: theme.spacing(0.5, 0.5),
  },

  dataRow: {
    '&:hover': {
      backgroundColor: 'rgba(37,99,235,0.03)',
    },
    '& td': {
      padding: theme.spacing(0.4, 0.5),
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

  noteCell: {
    minWidth: 170,
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
      height: 28,
      minWidth: 30,
      maxWidth: 40,
    },
    '& .MuiOutlinedInput-root .MuiOutlinedInput-input': {
      textAlign: 'center' as const,
      padding: '2px 3px',
      fontSize: '0.78rem',
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
    minWidth: 56,
    maxWidth: 72,
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
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1.5),
    gap: theme.spacing(0.5, 0.75),
    flexWrap: 'wrap' as const,
    background: '#ffffff',
    border: '1px solid rgba(226, 232, 255, 0.8)',
    borderRadius: 12,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0,0,0,0.04)',
    padding: theme.spacing(0.75, 1.25),
  },

  timesheetIconPill: {
    width: 30,
    height: 30,
    borderRadius: 8,
    display: 'flex' as const,
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.15s ease',
    flexShrink: 0,
    '.timesheetActionButton:hover &': {
      transform: 'scale(1.08)',
    },
  },

  timesheetActionButton: {
    flex: '0 0 auto',
    display: 'flex' as const,
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(0.5, 0.75),
    gap: 3,
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    borderRadius: 10,
    minWidth: 60,
    position: 'relative' as const,
    overflow: 'hidden',

    '&:hover': {
      transform: 'translateY(-2px)',
      background: 'rgba(99, 102, 241, 0.07)',
      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)',
    },

    '&:active': {
      transform: 'translateY(0)',
      background: 'rgba(99, 102, 241, 0.12)',
    },
  },

  timesheetActionLabel: {
    fontSize: '0.7rem',
    lineHeight: 1.2,
    color: '#475569',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
    textAlign: 'center' as const,
    letterSpacing: '0.2px',
  },

  toolbarTitle: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: theme.palette.text.primary,
    marginRight: theme.spacing(0.5),
    whiteSpace: 'nowrap' as const,
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

  /* ── Note buttons (Add external / internal comment) ───────── */
  noteButton: {
    display: 'flex' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
    border: `1px solid ${theme.palette.primary.main}`,
    borderRadius: 10,
    padding: theme.spacing(0.5, 1),
    cursor: 'pointer',
    transition: 'box-shadow 0.15s ease, background-color 0.15s ease',
    '&:hover': {
      boxShadow: `0 0 0 3px ${theme.palette.primary.main}22`,
      backgroundColor: `${theme.palette.primary.main}08`,
    },
  },

  noteButtonLabel: {
    fontSize: '0.85rem',
    fontWeight: 500,
    color: theme.palette.text.primary,
    whiteSpace: 'nowrap' as const,
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

  /* ── Status legend (below the lines table) ─────────────────── */
  statusLegend: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    flexWrap: 'wrap' as const,
    marginTop: theme.spacing(1.5),
    paddingTop: theme.spacing(1.5),
    borderTop: `1px dashed ${theme.palette.divider}`,
  },

  statusLegendItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    fontSize: '0.8rem',
    fontWeight: 600,
    color: theme.palette.text.primary,
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
