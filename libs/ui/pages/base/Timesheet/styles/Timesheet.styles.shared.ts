import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  container: {
    padding: theme.spacing(3),
    [theme.breakpoints.down('sm')]: { padding: theme.spacing(1.5) },
    [theme.breakpoints.between('sm', 'md')]: { padding: theme.spacing(2) },
  },

  /* ── Top bar ─────────────────────────────────────────────────── */
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
    gap: theme.spacing(2),
    flexWrap: 'wrap' as const,
  },

  breadcrumbs: {
    gap: theme.spacing(0.5),
    '& > *': { fontSize: '0.8rem' },
  },

  breadcrumbItem: {
    fontSize: '0.8rem',
    color: theme.palette.text.secondary,
  },

  breadcrumbSeparator: {
    color: theme.palette.text.disabled,
    fontSize: '0.8rem',
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

  /* ── Totals row ──────────────────────────────────────────────── */
  totalsRow: {
    display: 'flex' as const,
    alignItems: 'center',
    gap: theme.spacing(0.75),
    padding: theme.spacing(1, 1.5),
    borderTop: `2px solid ${theme.palette.divider}`,
    marginTop: 0,
    flexWrap: 'wrap' as const,
  },

  totalsLabel: {
    minWidth: 140,
    justifyContent: 'flex-end' as const,
  },

  totalsDayCell: {
    width: 40,
    textAlign: 'center' as const,
    fontSize: '0.85rem',
    fontWeight: 700,
    color: theme.palette.text.primary,
  },

  totalsGrandCell: {
    color: theme.palette.primary.dark,
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
