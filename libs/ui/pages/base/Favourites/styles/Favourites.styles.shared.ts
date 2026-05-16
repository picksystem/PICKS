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
    background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #0369a1 100%)',
    borderRadius: 12,
    padding: theme.spacing(3, 3.5),
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: -60,
      right: -60,
      width: 240,
      height: 240,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.05)',
      pointerEvents: 'none',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: -40,
      left: '30%',
      width: 160,
      height: 160,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.04)',
      pointerEvents: 'none',
    },
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
      borderRadius: 8,
    },
  },

  pageHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(0.5),
    position: 'relative',
    zIndex: 1,
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column' as const,
      alignItems: 'flex-start',
      gap: theme.spacing(1),
    },
  },

  title: {
    fontWeight: 700,
    color: '#fff',
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.2rem',
    },
  },

  description: {
    color: 'rgba(255,255,255,0.75)',
    marginTop: theme.spacing(0.5),
    fontSize: '0.875rem',
    position: 'relative',
    zIndex: 1,
  },

  tabsBox: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
  },

  tabsFlex: {
    flex: 1,
  },

  searchField: {
    marginLeft: theme.spacing(2),
    flexShrink: 0,
    width: '220px',
    '& .MuiOutlinedInput-root': {
      height: '34px',
      fontSize: '0.85rem',
      backgroundColor: theme.palette.common.white,
      borderRadius: '6px',
    },
    '& .MuiInputBase-input': { padding: '4px 8px', fontSize: '0.85rem' },
    '& .MuiInputBase-input::placeholder': { opacity: 0.7 },
    '& .MuiInputAdornment-root .MuiSvgIcon-root': {
      fontSize: '1.1rem',
      color: theme.palette.text.secondary,
    },
  },

  emptyState: {
    textAlign: 'center' as const,
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
    border: '2px dashed',
    borderColor: theme.palette.divider,
    borderRadius: (theme.shape.borderRadius as number) * 3,
    marginTop: theme.spacing(2),
  },

  emptyIcon: {
    fontSize: '48px !important',
    color: `${theme.palette.text.disabled} !important`,
    marginBottom: `${theme.spacing(1)} !important`,
  },

  emptySubtext: {
    marginTop: theme.spacing(1),
  },

  tableContainer: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    overflowX: 'auto' as const,
  },
});
