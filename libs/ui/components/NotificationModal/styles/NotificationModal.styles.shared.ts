import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  modal: {
    // Full-screen fixed container — display:flex centers the card
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(3),
    pointerEvents: 'none',
    // Mobile: center, full-width card
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: `${theme.spacing(2)} ${theme.spacing(2)}`,
    },
  },
  card: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.75, 2.5),
    borderRadius: 16,
    minWidth: 300,
    maxWidth: 460,
    outline: 'none',
    pointerEvents: 'auto',
    border: '1px solid rgba(255,255,255,0.18)',
    // Mobile: stretch to fill viewport width minus modal padding
    [theme.breakpoints.down('sm')]: {
      minWidth: 0,
      width: '100%',
      maxWidth: '100%',
      borderRadius: 14,
      padding: theme.spacing(1.5, 2),
    },
  },
  iconPill: {
    width: 44,
    height: 44,
    minWidth: 44,
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  icon: {
    fontSize: 26,
    color: '#fff',
  },
  textBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.25),
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: '0.68rem',
    fontWeight: 800,
    color: 'rgba(255,255,255,0.75)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.9px',
    lineHeight: 1,
  },
  message: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#fff',
    lineHeight: 1.4,
  },
  closeBtn: {
    color: 'rgba(255,255,255,0.65)',
    padding: theme.spacing(0.5),
    flexShrink: 0,
    borderRadius: '8px',
    '&:hover': {
      background: 'rgba(255,255,255,0.15)',
      color: '#fff',
    },
  },
});
