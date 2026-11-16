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

  /* ── Leave-balance card row ─────────────────────────────────── */
  balanceRow: {
    display: 'flex' as const,
    flexWrap: 'wrap' as const,
    gap: theme.spacing(1.25),
    marginBottom: theme.spacing(3),
  },

  /* Compact card, reference layout: label (left) + value (right) on one
     row, a slim progress bar (available / total) beneath it. Roomy
     padding so the content floats inside the card. */
  balanceCard: {
    flex: '1 1 170px',
    minWidth: 170,
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: theme.spacing(2, 2.25),
  },

  /* label left, value right, vertically centered against each other */
  balanceCardHeader: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between',
    gap: theme.spacing(1),
  },

  balanceLabel: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#1e293b',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis',
  },

  balanceValue: {
    fontWeight: 700,
    fontSize: '1.1rem',
    color: '#1e2a5e',
    lineHeight: 1.1,
    whiteSpace: 'nowrap' as const,
  },

  /* slim track at the card's bottom; the fill's width = available/total */
  balanceBarTrack: {
    position: 'relative' as const,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden' as const,
  },

  balanceBarFill: {
    position: 'absolute' as const,
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 2,
  },

  /* The three leave tables are Configuration-style GenericPanel('plain')
     components (accordion + accent box + panel toolbar + navy-header
     DataTable), so no custom section styles are needed here. */
  panelStack: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: theme.spacing(2.5),
  },
});
