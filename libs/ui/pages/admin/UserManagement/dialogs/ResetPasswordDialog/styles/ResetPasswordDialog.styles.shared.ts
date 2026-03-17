import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  dialogPaper: {
    borderRadius: (theme.shape.borderRadius as number) * 3,
    overflow: 'hidden' as const,
  },
  header: {
    background: theme.palette.gradient.headerRed,
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
  adminActionChip: {
    backgroundColor: theme.palette.warning.accentAlpha25,
    color: theme.palette.warning.accent,
    fontWeight: 700,
    border: `1px solid ${theme.palette.warning.accentAlpha40}`,
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
    backgroundColor: theme.palette.common.white20,
    color: theme.palette.common.white,
    border: `2px solid ${theme.palette.common.white40}`,
  },
  infoBox: {
    flex: 1,
  },
  headerTitle: {
    color: theme.palette.common.white,
    lineHeight: 1.2,
  },
  headerEmail: {
    color: theme.palette.common.white80,
    marginTop: theme.spacing(0.25),
  },
  roleChip: {
    backgroundColor: theme.palette.common.white20,
    color: theme.palette.common.white,
    fontWeight: 600,
    border: `1px solid ${theme.palette.common.white30}`,
    fontSize: '0.7rem',
    height: 20,
  },
  metaCaption: {
    color: theme.palette.common.white55,
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
  dialogContent: {
    paddingTop: theme.spacing(2.5),
  },
  modeToggleAuto: {
    flex: 1,
    textTransform: 'none' as const,
    fontSize: '0.82rem',
    '&.Mui-selected': {
      backgroundColor: theme.palette.error.redAlpha10,
      color: theme.palette.error.main,
      borderColor: theme.palette.error.main,
    },
  },
  modeToggleManual: {
    flex: 1,
    textTransform: 'none' as const,
    fontSize: '0.82rem',
    '&.Mui-selected': {
      backgroundColor: theme.palette.error.redAlpha10,
      color: theme.palette.error.main,
      borderColor: theme.palette.error.main,
    },
  },
  strengthBar: {
    height: 6,
    borderRadius: 3,
    '& .MuiLinearProgress-bar': { borderRadius: 3 },
    backgroundColor: theme.palette.grey[200],
  },
  rulesBox: {
    backgroundColor: theme.palette.grey[50],
    borderRadius: (theme.shape.borderRadius as number) * 2,
    padding: theme.spacing(1.5),
    marginBottom: theme.spacing(2),
    border: '1px solid',
    borderColor: theme.palette.divider,
  },
  ruleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    marginTop: theme.spacing(0.5),
  },
  ruleIconValid: {
    fontSize: 14,
    color: theme.palette.success.main,
  },
  ruleIconInvalid: {
    fontSize: 14,
    color: theme.palette.text.disabled,
  },
  ruleTextValid: {
    color: theme.palette.success.main,
    fontWeight: 600,
  },
  ruleTextInvalid: {
    color: theme.palette.text.disabled,
  },
  notifyRow: {
    display: 'flex',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
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
});
