import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  dialogPaper: {
    borderRadius: (theme.shape.borderRadius as number) * 3,
    overflow: 'hidden' as const,
  },
  header: {
    background: theme.palette.gradient.headerBlueDark,
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(2.5),
    color: theme.palette.common.white,
    position: 'relative' as const,
  },
  badgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  badgeIcon: {
    fontSize: 16,
    color: theme.palette.common.white70,
  },
  badgeLabel: {
    color: theme.palette.common.white70,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  headerAvatar: {
    width: 56,
    height: 56,
    fontSize: '1.4rem',
    fontWeight: 700,
    backgroundColor: theme.palette.common.white25,
    color: theme.palette.common.white,
    border: `2px solid ${theme.palette.common.white50}`,
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    flexWrap: 'wrap' as const,
  },
  headerTitle: {
    color: theme.palette.common.white,
    lineHeight: 1.2,
  },
  unsavedChip: {
    backgroundColor: theme.palette.warning.accentAlpha25,
    color: theme.palette.warning.accent,
    fontWeight: 600,
    border: `1px solid ${theme.palette.warning.accentAlpha50}`,
    height: 20,
    fontSize: '0.7rem',
  },
  headerEmail: {
    color: theme.palette.common.white75,
    marginTop: theme.spacing(0.25),
  },
  chipRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
    flexWrap: 'wrap' as const,
  },
  roleChip: {
    backgroundColor: theme.palette.common.white20,
    color: theme.palette.common.white,
    fontWeight: 600,
    border: `1px solid ${theme.palette.common.white35}`,
  },
  activeChip: {
    backgroundColor: theme.palette.success.greenAlpha25,
    color: theme.palette.success.green,
    fontWeight: 600,
    border: `1px solid ${theme.palette.success.greenAlpha40}`,
  },
  inactiveChip: {
    backgroundColor: theme.palette.common.white10,
    color: theme.palette.common.white50,
    fontWeight: 600,
    border: `1px solid ${theme.palette.common.white20}`,
  },
  metaCaption: {
    color: theme.palette.common.white50,
  },
  closeBtn: {
    position: 'absolute' as const,
    top: 12,
    right: 12,
    color: theme.palette.common.white70,
    '&:hover': {
      color: theme.palette.common.white,
      backgroundColor: theme.palette.common.white10,
    },
  },
  actions: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    gap: theme.spacing(1.5),
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column' as const,
      padding: theme.spacing(1.5, 2),
      '& .MuiButton-root': { width: '100%' },
    },
  },
});
