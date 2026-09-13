import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';
import { createAppStyles } from '@serviceops/theme';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  dialog: {
    '& .MuiDialog-paper': {
      maxWidth: '520px',
      width: '100%',
      borderRadius: '12px',
      overflow: 'hidden',
      padding: 0,
      margin: 0,
    },
  },

  // Gradient header banner
  headerBanner: {
    background:
      theme.palette.gradient?.headerBlue ||
      'linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #0369a1 100%)',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerTitleArea: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
  },

  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.18)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
  },

  headerTitle: {
    color: '#fff',
    fontSize: '1.1rem',
    fontWeight: 700,
    lineHeight: 1.2,
  },

  headerSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: '0.8rem',
    fontWeight: 400,
    lineHeight: 1.3,
    marginTop: '2px',
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    color: 'rgba(255,255,255,0.85)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s ease, color 0.2s ease',
    '&:hover': {
      background: 'rgba(255,255,255,0.2)',
      color: '#fff',
    },
  },

  // Empty state
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(6, 3, 4),
    textAlign: 'center',
  },

  emptyBellContainer: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: theme.palette.primary.light,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing(2),
  },

  emptyBellIcon: {
    fontSize: '2rem',
    color: theme.palette.primary.main,
  },

  emptyTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(0.5),
  },

  emptySubtitle: {
    fontSize: '0.9rem',
    color: theme.palette.text.secondary,
  },

  // Footer
  footer: {
    padding: theme.spacing(2, 3, 2.5),
    borderTop: `1px solid ${theme.palette.divider}`,
    textAlign: 'center',
  },

  viewAllButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    background: 'none',
    border: 'none',
    color: theme.palette.primary.main,
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    padding: theme.spacing(0.5, 1),
    borderRadius: '6px',
    transition: 'background 0.15s ease',
    '&:hover': {
      background: theme.palette.primary.light,
    },
  },
});

export const useStyles = createAppStyles((theme: Theme) => getBaseStyles(theme), {
  admin: {
    root: {},
  },
  user: {
    root: {},
  },
  consultant: {
    root: {},
  },
});
