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
    position: 'relative',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
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
    fontWeight: 800,
    color: '#1e293b',
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.2rem',
    },
  },

  description: {
    color: '#64748b',
    marginTop: theme.spacing(0.5),
    fontSize: '0.875rem',
    position: 'relative',
    zIndex: 1,
  },

  searchField: {
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

  tableContainer: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    overflowX: 'auto' as const,
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
    marginBottom: `${theme.spacing(1)}!important`,
  },
});
