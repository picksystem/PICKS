import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  dialogPaper: {
    borderRadius: (theme.shape.borderRadius as number) * 3,
    overflow: 'hidden' as const,
  },
  header: {
    background: theme.palette.gradient.headerAmber,
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
    color: theme.palette.common.white75,
  },
  badgeLabel: {
    color: theme.palette.common.white75,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
  timeBoundChip: {
    backgroundColor: theme.palette.common.white20,
    color: theme.palette.common.white,
    fontWeight: 600,
    border: `1px solid ${theme.palette.common.white30}`,
    height: 20,
    fontSize: '0.7rem',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  headerAvatar: {
    width: 52,
    height: 52,
    fontSize: '1.2rem',
    fontWeight: 700,
    backgroundColor: theme.palette.common.white25,
    color: theme.palette.common.white,
    border: `2px solid ${theme.palette.common.white50}`,
  },
  infoBox: {
    flex: 1,
  },
  headerTitle: {
    color: theme.palette.common.white,
    lineHeight: 1.2,
  },
  headerSubtitle: {
    color: theme.palette.common.white80,
    marginTop: theme.spacing(0.25),
  },
  roleChip: {
    backgroundColor: theme.palette.common.white20,
    color: theme.palette.common.white,
    fontWeight: 600,
    border: `1px solid ${theme.palette.common.white35}`,
    fontSize: '0.7rem',
    height: 20,
  },
  activeChip: {
    backgroundColor: theme.palette.success.greenAlpha25,
    color: theme.palette.success.green,
    fontWeight: 600,
    border: `1px solid ${theme.palette.common.white25}`,
    fontSize: '0.7rem',
    height: 20,
  },
  inactiveChip: {
    backgroundColor: theme.palette.common.white10,
    color: theme.palette.common.white50,
    fontWeight: 600,
    border: `1px solid ${theme.palette.common.white25}`,
    fontSize: '0.7rem',
    height: 20,
  },
  closeBtn: {
    position: 'absolute' as const,
    top: 10,
    right: 10,
    color: theme.palette.common.white70,
    '&:hover': {
      color: theme.palette.common.white,
      backgroundColor: theme.palette.common.white10,
    },
  },
  toggleBtn: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    textTransform: 'none' as const,
    fontSize: '0.82rem',
  },
  dialogContent: {
    paddingTop: theme.spacing(2.5),
  },
  bulkList: {
    border: '1px solid',
    borderColor: theme.palette.divider,
    borderRadius: (theme.shape.borderRadius as number) * 2,
    marginBottom: theme.spacing(2),
    maxHeight: 200,
    overflow: 'auto' as const,
  },
  listItem: {
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5),
    '&:hover': { backgroundColor: theme.palette.action.hover },
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
    borderTop: '1px solid',
    borderColor: theme.palette.divider,
  },
  submitBtn: {
    borderRadius: (theme.shape.borderRadius as number) * 2,
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    background: theme.palette.gradient.headerAmber,
    '&:hover': {
      background: `linear-gradient(135deg, ${theme.palette.warning.amberDark} 0%, ${theme.palette.warning.amberDark} 100%)`,
    },
  },
});
