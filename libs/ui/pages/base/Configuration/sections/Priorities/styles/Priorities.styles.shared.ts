import { Theme } from '@mui/material/styles';
import { alpha } from '@mui/material';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  container: {
    padding: theme.spacing(3),
    width: '100%',
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
  },

  sectionAccordion: {
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

  actionToolbar: {
    padding: '8px 12px',
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

  selectedRowToolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: `${theme.spacing(1)} ${theme.spacing(1.5)}`,
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    borderLeft: `3px solid ${theme.palette.primary.main}`,
    marginBottom: theme.spacing(1),
    borderRadius: '0 6px 6px 0',
  },

  editButton: {
    padding: `${theme.spacing(0.5)} ${theme.spacing(1.5)}`,
    backgroundColor: '#2d5ebb',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 500,
    textTransform: 'none' as const,
    '&:hover': {
      backgroundColor: '#2d5ebb',
    },
  },

  deleteButton: {
    padding: `${theme.spacing(0.5)} ${theme.spacing(1.5)}`,
    backgroundColor: 'transparent',
    color: theme.palette.error.main,
    border: `1px solid ${theme.palette.error.main}`,
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 500,
    textTransform: 'none' as const,
    '&:hover': {
      backgroundColor: alpha(theme.palette.error.main, 0.08),
    },
  },

  clearButton: {
    padding: `${theme.spacing(0.5)} ${theme.spacing(1.5)}`,
    backgroundColor: 'transparent',
    color: '#2d5ebb',
    border: '1px solid #2d5ebb',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 500,
    textTransform: 'none' as const,
    '&:hover': {
      backgroundColor: alpha('#2d5ebb', 0.08),
    },
  },
});
