import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(() => ({
  dialogHeader: {
    background: 'linear-gradient(135deg, #065f46 0%, #059669 100%)',
    padding: '24px 24px 20px',
    color: '#fff',
  },

  dialogHeaderBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },

  dialogHeaderBadgeIcon: {
    fontSize: '18px !important',
    color: '#6ee7b7 !important',
  },

  dialogHeaderBadgeText: {
    color: '#6ee7b7 !important',
    letterSpacing: '1px !important',
    textTransform: 'uppercase' as const,
    fontWeight: '700 !important',
  },

  dialogHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dialogHeaderTitle: {
    color: '#fff !important',
    lineHeight: '1.2 !important',
    fontWeight: '700 !important',
  },

  dialogHeaderSubtitle: {
    color: 'rgba(255,255,255,0.75) !important',
    marginTop: '4px !important',
  },

  dialogCloseButton: {
    color: 'rgba(255,255,255,0.7) !important',
    '&:hover': { color: '#fff !important', backgroundColor: 'rgba(255,255,255,0.1) !important' },
  },

  dialogActions: {
    padding: '16px 24px',
    gap: 12,
    '@media (max-width: 599px)': {
      flexDirection: 'column' as const,
      padding: '12px 16px',
      gap: 8,
      '& .MuiButton-root': { width: '100%' },
    },
  },

  cancelButton: {
    borderRadius: '8px !important',
  },

  saveButton: {
    borderRadius: '8px !important',
    paddingLeft: '24px !important',
    paddingRight: '24px !important',
  },

  selectField: {
    '& .MuiOutlinedInput-root': { borderRadius: 8 },
  },

  textField: {
    '& .MuiOutlinedInput-root': { borderRadius: 8 },
  },
}));
