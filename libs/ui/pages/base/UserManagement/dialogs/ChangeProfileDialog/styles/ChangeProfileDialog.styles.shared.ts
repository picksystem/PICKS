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
    fontSize: 18,
    color: theme.palette.warning.accent,
  },
  badgeLabel: {
    color: theme.palette.warning.accent,
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
  infoBox: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    color: theme.palette.common.white,
    lineHeight: 1.2,
  },
  headerEmail: {
    color: theme.palette.common.white75,
    marginTop: theme.spacing(0.25),
  },
  roleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  roleChip: {
    backgroundColor: theme.palette.common.white20,
    color: theme.palette.common.white,
    fontWeight: 600,
    border: `1px solid ${theme.palette.common.white35}`,
  },
  roleArrowIcon: {
    fontSize: 16,
    color: theme.palette.common.white60,
  },
  newRoleChipSelected: {
    backgroundColor: theme.palette.warning.accentAlpha25,
    color: theme.palette.warning.accent,
    fontWeight: 600,
    border: `1px solid ${theme.palette.warning.accentAlpha50}`,
  },
  newRoleChipEmpty: {
    backgroundColor: theme.palette.common.white10,
    color: theme.palette.common.white40,
    fontWeight: 600,
    border: `1px solid ${theme.palette.common.white20}`,
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
  formattingToolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.25),
    paddingLeft: theme.spacing(0.75),
    paddingRight: theme.spacing(0.75),
    paddingTop: theme.spacing(0.25),
    paddingBottom: theme.spacing(0.25),
    border: '1px solid',
    borderBottom: 0,
    borderRadius: '8px 8px 0 0',
    backgroundColor: theme.palette.grey[50],
    borderColor: theme.palette.divider,
  },
  formattingToolbarError: {
    borderColor: theme.palette.error.main,
  },
  noteTextarea: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '0 0 8px 8px',
    },
  },
  charCountRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(0.5),
  },
  attachmentRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  hiddenInput: {
    display: 'none',
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
