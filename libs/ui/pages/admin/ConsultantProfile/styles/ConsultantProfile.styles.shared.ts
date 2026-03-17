import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  container: {
    padding: theme.spacing(3),
    [theme.breakpoints.down('sm')]: { padding: theme.spacing(1.5) },
    [theme.breakpoints.between('sm', 'md')]: { padding: theme.spacing(2) },
  },

  pageHeader: {
    marginBottom: theme.spacing(2),
  },

  pageHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(0.5),
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: theme.spacing(1),
    },
  },

  title: {
    fontWeight: 600,
    color: theme.palette.text.primary,
    [theme.breakpoints.down('sm')]: { fontSize: '1.15rem' },
  },

  description: {
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.5),
  },

  tabsBox: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(2),
  },

  toolbar: {
    padding: theme.spacing(1.5),
    marginBottom: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
  },

  tableContainer: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    overflowX: 'auto' as const,
  },

  tabsFlex: {
    flex: 1,
  },

  appFilterControl: {
    minWidth: 160,
    [theme.breakpoints.down('sm')]: {
      minWidth: 'unset',
      width: '100%',
    },
  },

  searchField: {
    marginLeft: 'auto',
    width: '220px',
    '& .MuiOutlinedInput-root': {
      height: '34px',
      fontSize: '0.85rem',
      borderRadius: '6px',
      backgroundColor: theme.palette.common.white,
    },
    '& .MuiInputBase-input': { padding: '4px 8px', fontSize: '0.85rem' },
    [theme.breakpoints.down('sm')]: {
      marginLeft: 0,
      width: '100%',
    },
  },

  emptyState: {
    textAlign: 'center' as const,
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
    border: '2px dashed',
    borderColor: theme.palette.divider,
    borderRadius: (theme.shape.borderRadius as number) * 3,
  },

  emptyIcon: {
    fontSize: '48px !important',
    color: `${theme.palette.text.disabled} !important`,
    marginBottom: `${theme.spacing(1)} !important`,
  },

  emptySubtext: {
    marginTop: theme.spacing(1),
  },

  workingTimePaper: {
    padding: theme.spacing(3),
    textAlign: 'center' as const,
    borderRadius: (theme.shape.borderRadius as number) * 3,
  },

  workingTimeIcon: {
    fontSize: '48px !important',
    color: `${theme.palette.text.disabled} !important`,
    marginBottom: `${theme.spacing(1)} !important`,
  },

  alertBox: {
    marginBottom: theme.spacing(2),
  },
});
