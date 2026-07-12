import { Theme, alpha } from '@mui/material/styles';
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
  charCountRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(0.5),
  },
  attachmentRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1, 1.5),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: (theme.shape.borderRadius as number) * 2,
    backgroundColor: theme.palette.grey[50],
  },
  hiddenInput: {
    display: 'none',
  },
  dropzone: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(0.5),
    padding: theme.spacing(2.5),
    border: `2px dashed ${theme.palette.divider}`,
    borderRadius: (theme.shape.borderRadius as number) * 2,
    backgroundColor: theme.palette.grey[50],
    cursor: 'pointer',
    textAlign: 'center' as const,
    transition: 'all 0.2s ease',
    '&:hover': {
      borderColor: theme.palette.primary.main,
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
    },
  },
  dropzoneActive: {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.06),
  },
  dropzoneIcon: {
    fontSize: 28,
    color: theme.palette.text.secondary,
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
