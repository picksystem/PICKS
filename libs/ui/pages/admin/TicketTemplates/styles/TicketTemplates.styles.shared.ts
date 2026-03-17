import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  container: {
    padding: theme.spacing(3),
    width: '100%',

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
  },

  actionsCell: {
    display: 'flex',
    gap: theme.spacing(1),
    justifyContent: 'center',
  },

  sectionAccordion: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: `${theme.spacing(1.5)} !important`,
    marginTop: theme.spacing(2.5),
    width: '100%',
    '&::before': { display: 'none' },
  },

  sectionTitle: {
    fontWeight: 700,
    fontSize: '0.95rem',
  },

  sectionSubtitle: {
    fontSize: '0.8rem',
    color: theme.palette.text.secondary,
    marginTop: 2,
  },

  sectionBody: {
    padding: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
    lineHeight: 1.7,
  },

  actionToolbar: {
    padding: `${theme.spacing(1)} ${theme.spacing(1.5)}`,
    marginBottom: theme.spacing(1.5),
    display: 'flex',
    flexDirection: 'column' as const,
    gap: theme.spacing(0.5),
  },

  toolbarButtons: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: theme.spacing(0.75),
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column' as const,
      alignItems: 'stretch',
    },
  },

  toolbarDivider: {
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },

  buttonLabel: {},

  selectionInfo: {
    paddingTop: theme.spacing(0.5),
    paddingLeft: theme.spacing(0.5),
  },

  deleteDialog: {
    '& .MuiDialogTitle-root': {
      fontWeight: 700,
    },
  },

  tableSearchField: {
    flexShrink: 0,
    width: '160px',
    '& .MuiOutlinedInput-root': {
      height: '30px',
      fontSize: '0.8rem',
      backgroundColor: theme.palette.common.white,
      borderRadius: '6px',
    },
    '& .MuiInputBase-input': {
      padding: '4px 6px',
      fontSize: '0.8rem',
    },
    '& .MuiInputBase-input::placeholder': {
      opacity: 0.7,
    },
    '& .MuiInputAdornment-root .MuiSvgIcon-root': {
      fontSize: '1.1rem',
      color: theme.palette.text.secondary,
    },
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      flexShrink: 1,
    },
    [theme.breakpoints.up('sm')]: {
      flexGrow: 0,
    },
  },
});
