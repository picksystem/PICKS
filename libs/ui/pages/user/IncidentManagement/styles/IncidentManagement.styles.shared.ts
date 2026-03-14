import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
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
});
