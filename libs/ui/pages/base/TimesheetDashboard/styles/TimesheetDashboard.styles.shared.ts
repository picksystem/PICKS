import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

const NAVY = '#1e2a5e';

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

  /* ── Layout ─────────────────────────────────────────────────── */
  layout: {
    display: 'grid' as const,
    gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr) minmax(0, 1fr)',
    gap: theme.spacing(2),
    [theme.breakpoints.down('lg')]: { gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)' },
    [theme.breakpoints.down('md')]: { gridTemplateColumns: '1fr' },
  },

  /* ── Card shell ─────────────────────────────────────────────── */
  card: {
    backgroundColor: theme.palette.background.paper,
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: theme.spacing(2, 2.5),
    minWidth: 0,
  },

  cardTitle: {
    fontWeight: 700,
    color: '#1e293b',
    fontSize: '1.05rem',
    marginBottom: theme.spacing(1.5),
  },

  /* ── Calendar ────────────────────────────────────────────────── */
  calendarHeader: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(1.5),
  },

  monthLabel: {
    fontWeight: 700,
    fontSize: '1rem',
    color: '#1e293b',
  },

  navButton: {
    width: 28,
    height: 28,
    color: NAVY,
    backgroundColor: '#fff',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '50%' as const,
    padding: 0,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    '&:hover': { backgroundColor: '#f8fafc' },
  },

  calendarGrid: {
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    overflow: 'hidden' as const,
  },

  /* Header row: the 7 day columns + the narrow right-side marker strip
     (the navy band extends to the card edge, as in the reference). */
  gridRow: {
    display: 'grid' as const,
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr)) 34px',
  },

  weekdayCell: {
    backgroundColor: NAVY,
    color: '#fff',
    fontWeight: 700,
    fontSize: '0.85rem',
    textAlign: 'center' as const,
    padding: theme.spacing(1),
  },

  /* the header's empty 8th column — the marker strip has no label */
  weekMarkSpacer: {
    backgroundColor: NAVY,
    borderLeft: `1px solid rgba(255, 255, 255, 0.12)`,
  },

  /* One calendar week: the 7 day cells + the 34px marker strip. The strip
     holds the week's edit mark, pinned to its bottom-right corner (the last
     position of the cell), as in the reference layout. */
  calendarWeek: {
    display: 'grid' as const,
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr)) 34px',
    borderBottom: '1px solid #f1f5f9',
    '&:last-child': { borderBottom: 'none' },
  },

  /* the far-right marker strip: one edit mark per week row, anchored to the
     strip's bottom-right corner. The strip itself is clickable (it opens the
     day menu for the week) — the day cells remain the primary target. */
  weekMarkColumn: {
    borderLeft: '1px solid #f1f5f9',
    display: 'flex' as const,
    alignItems: 'flex-end' as const,
    justifyContent: 'flex-end' as const,
    padding: theme.spacing(0.5, 0.5, 0.75),
    background: '#fff',
    minHeight: 68,
  },

  /* the edit mark: a small boxed note/pencil chip, as in the reference */
  weekMark: {
    width: 22,
    height: 22,
    display: 'flex' as const,
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #cbd5e1',
    borderRadius: 4,
    backgroundColor: '#fff',
    boxSizing: 'border-box' as const,
  },

  /* weeks with no entries (trailing next-month week) keep the mark but read
     as disabled */
  weekMarkFaded: {
    opacity: 0.35,
    cursor: 'default',
  },

  dayCell: {
    borderRight: '1px solid #f1f5f9',
    minHeight: 68,
    padding: theme.spacing(0.5, 0.75),
    background: '#fff',
    '&:nth-child(7n)': { borderRight: 'none' },
  },

  dayNumber: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#1e293b',
  },

  dayNumberOutside: {
    color: '#cbd5e1',
  },

  dayNumberToday: {
    color: NAVY,
    fontWeight: 800,
  },

  dayTimes: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: 2,
    marginTop: theme.spacing(0.5),
  },

  dayTime: {
    fontSize: '0.65rem',
    color: '#475569',
  },

  dayBorderBottomMissed: {
    borderBottom: `3px solid ${theme.palette.warning.main}`,
  },

  dayBorderBottomDraft: {
    borderBottom: `3px solid ${theme.palette.primary.main}`,
  },

  dayBorderBottomApproved: {
    borderBottom: `3px solid ${theme.palette.success.main}`,
  },

  dayBorderBottomRejected: {
    borderBottom: `3px solid ${theme.palette.error.main}`,
  },

  holidayBg: {
    backgroundColor: '#fafafa',
  },

  todayBg: {
    backgroundColor: 'rgba(37,99,235,0.06)',
  },

  /* ── Legend ──────────────────────────────────────────────────── */
  legend: {
    display: 'flex' as const,
    flexWrap: 'wrap' as const,
    gap: theme.spacing(2),
    marginTop: theme.spacing(1.5),
  },

  legendItem: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: theme.spacing(0.75),
    fontSize: '0.8rem',
    color: '#475569',
  },

  legendLine: {
    width: 18,
    height: 3,
    borderRadius: 2,
    display: 'inline-block' as const,
  },

  /* ── List cards (My Action / My Approvals / Upcoming / Holidays) ── */
  listRow: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: theme.spacing(1, 0.5),
    borderBottom: `1px solid #f1f5f9`,
    cursor: 'pointer' as const,
    '&:last-child': { borderBottom: 'none' },
    '&:hover': { background: 'rgba(37,99,235,0.04)' },
  },

  listRowDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    '&:hover': { background: 'transparent' },
  },

  listRowText: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    minWidth: 0,
  },

  listRowTitle: {
    fontWeight: 500,
    fontSize: '0.9rem',
    color: '#1e293b',
  },

  listRowSubtitle: {
    fontSize: '0.78rem',
    color: '#64748b',
  },

  chevron: {
    color: NAVY,
    fontSize: 20,
    flexShrink: 0,
  },

  approvalRow: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: theme.spacing(1),
    padding: theme.spacing(0.75, 0.5),
    borderBottom: `1px solid #f1f5f9`,
    cursor: 'pointer' as const,
    '&:last-child': { borderBottom: 'none' },
    '&:hover': { background: 'rgba(37,99,235,0.04)' },
  },

  approvalLabel: {
    flex: 1,
    fontSize: '0.88rem',
    color: '#1e293b',
  },

  approvalCount: {
    minWidth: 22,
    height: 22,
    borderRadius: '11px' as const,
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.dark,
    fontSize: '0.7rem',
    fontWeight: 700,
    padding: `${theme.spacing(0)} ${theme.spacing(0.75)}`,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  /* ── Time-off balance ────────────────────────────────────────── */
  balanceRow: {
    display: 'grid' as const,
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(1.5),
  },

  balanceValue: {
    fontWeight: 800,
    fontSize: '1.35rem',
    color: '#1e293b',
  },

  balanceLabel: {
    fontSize: '0.8rem',
    color: '#475569',
    marginTop: theme.spacing(0.25),
  },

  leaveTable: {
    border: '1px solid #e5e7eb',
    borderRadius: 4,
    padding: theme.spacing(0, 1.5),
    marginBottom: theme.spacing(0.5),
  },

  leaveTableRow: {
    display: 'grid' as const,
    gridTemplateColumns: 'repeat(4, 1fr)',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(0.9, 0.25),
    fontSize: '0.82rem',
  },

  leaveTableHead: {
    borderBottom: '2px solid #1e293b',
  },

  leaveTableHeaderCell: {
    fontWeight: 700,
    fontSize: '0.9rem',
    color: '#1e293b',
  },

  leaveStatusIcon: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'flex-start',
  },

  legendChip: {
    display: 'inline-flex' as const,
    alignItems: 'center' as const,
    gap: theme.spacing(0.5),
    fontSize: '0.8rem',
    color: '#475569',
  },

  legendDot: {
    width: 10,
    height: 10,
    borderRadius: '50%' as const,
    border: '2px solid',
    display: 'inline-block' as const,
  },

  /* ── Event rows ─────────────────────────────────────────────── */
  eventRow: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: theme.spacing(1),
    padding: theme.spacing(0.75, 0.25),
    borderBottom: `1px solid #f1f5f9`,
    '&:last-child': { borderBottom: 'none' },
  },

  eventDateBox: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: theme.palette.background.paper,
    border: '1px solid #e5e7eb',
    display: 'flex' as const,
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexShrink: 0,
  },

  eventDateDay: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: '#1e293b',
  },

  eventDateMonth: {
    fontSize: '0.6rem',
    color: '#64748b',
  },

  /* ── Holiday row ────────────────────────────────────────────── */
  holidayNote: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: theme.spacing(1.5),
    fontSize: '0.82rem',
    color: '#475569',
    marginBottom: theme.spacing(1.5),
  },

  /* ── Day popup menu ─────────────────────────────────────────── */
  dayMenu: {
    '& .MuiMenu-paper': {
      borderRadius: 8,
      boxShadow: '0 4px 16px rgba(30,42,94,0.18)',
      minWidth: 220,
    },
  },

  dayMenuItem: {
    fontSize: '0.88rem',
    color: '#1e293b',
    '&.Mui-selected': {
      backgroundColor: 'rgba(37,99,235,0.08)',
      '&:hover': { backgroundColor: 'rgba(37,99,235,0.14)' },
    },
  },
});
