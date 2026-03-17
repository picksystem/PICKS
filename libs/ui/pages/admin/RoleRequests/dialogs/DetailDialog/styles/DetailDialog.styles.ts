import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(() => ({
  dialogHeader: {
    background: 'linear-gradient(135deg, #1e429f 0%, #3b5bdb 100%)',
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
    color: '#93c5fd !important',
  },

  dialogHeaderBadgeText: {
    color: '#93c5fd !important',
    letterSpacing: '1px !important',
    textTransform: 'uppercase' as const,
    fontWeight: '700 !important',
  },

  dialogHeaderUserRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },

  dialogHeaderAvatar: {
    width: '56px !important',
    height: '56px !important',
    fontSize: '1.4rem !important',
    fontWeight: '700 !important',
    backgroundColor: 'rgba(255,255,255,0.25) !important',
    color: '#fff !important',
    border: '2px solid rgba(255,255,255,0.5) !important',
  },

  dialogHeaderUserInfo: {
    flex: 1,
    minWidth: 0,
  },

  dialogHeaderTitle: {
    color: '#fff !important',
    lineHeight: '1.2 !important',
    fontWeight: '700 !important',
  },

  dialogHeaderSubtitle: {
    color: 'rgba(255,255,255,0.75) !important',
    marginTop: '2px !important',
  },

  dialogHeaderChipsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap' as const,
  },

  roleChip: {
    backgroundColor: 'rgba(255,255,255,0.2) !important',
    color: '#fff !important',
    fontWeight: '600 !important',
    border: '1px solid rgba(255,255,255,0.35) !important',
  },

  pendingChip: {
    backgroundColor: 'rgba(245,158,11,0.3) !important',
    color: '#fff !important',
    fontWeight: '600 !important',
    border: '1px solid rgba(245,158,11,0.6) !important',
  },

  approvedChip: {
    backgroundColor: 'rgba(16,185,129,0.3) !important',
    color: '#fff !important',
    fontWeight: '600 !important',
    border: '1px solid rgba(16,185,129,0.6) !important',
  },

  rejectedChip: {
    backgroundColor: 'rgba(239,68,68,0.3) !important',
    color: '#fff !important',
    fontWeight: '600 !important',
    border: '1px solid rgba(239,68,68,0.6) !important',
  },

  closeButton: {
    color: 'rgba(255,255,255,0.7) !important',
    '&:hover': { color: '#fff !important', backgroundColor: 'rgba(255,255,255,0.1) !important' },
  },

  sectionTitle: {
    marginBottom: '8px !important',
  },

  reasonBox: {
    padding: '12px',
    backgroundColor: 'action.hover',
    borderRadius: 4,
    borderLeft: '3px solid',
    borderColor: 'primary.main',
  },

  dialogActions: {
    padding: '16px 24px',
    gap: 12,
    '@media (max-width: 599px)': {
      flexDirection: 'column' as const,
      padding: '12px 16px',
      gap: 8,
    },
  },

  closeActionButton: {
    borderRadius: '8px !important',
    '@media (max-width: 599px)': {
      width: '100% !important',
    },
  },

  rejectButton: {
    borderRadius: '8px !important',
    '@media (max-width: 599px)': {
      width: '100% !important',
    },
  },

  approveButton: {
    borderRadius: '8px !important',
    '@media (max-width: 599px)': {
      width: '100% !important',
    },
  },
}));
