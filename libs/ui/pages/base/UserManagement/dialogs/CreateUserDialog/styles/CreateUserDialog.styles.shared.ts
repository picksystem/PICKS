import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  dialogPaper: {
    borderRadius: (theme.shape.borderRadius as number) * 3,
    overflow: 'hidden' as const,
    '& .MuiFormLabel-asterisk': {
      color: theme.palette.error.main,
    },
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
  draftChip: {
    backgroundColor: theme.palette.warning.accentAlpha20,
    color: theme.palette.warning.accent,
    fontWeight: 600,
    border: `1px solid ${theme.palette.warning.accentAlpha40}`,
    height: 20,
    fontSize: '0.7rem',
    '& .MuiChip-icon': {
      color: theme.palette.warning.accent,
      fontSize: 12,
    },
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  headerAvatar: {
    width: 56,
    height: 56,
    fontSize: '1.6rem',
    backgroundColor: theme.palette.common.white25,
    color: theme.palette.common.white,
    border: `2px solid ${theme.palette.common.white50}`,
  },
  headerTitle: {
    color: theme.palette.common.white,
    lineHeight: 1.2,
  },
  headerSubtitle: {
    color: theme.palette.common.white75,
    marginTop: theme.spacing(0.25),
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
  monoInput: {
    '& input': { fontFamily: 'monospace' },
  },
});
