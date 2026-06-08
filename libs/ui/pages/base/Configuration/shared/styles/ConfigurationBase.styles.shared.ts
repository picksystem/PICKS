import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

/**
 * Shared configuration panel styles that can be extended by individual sections.
 * Use this as a base and spread/override specific styles as needed.
 */
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
    boxShadow: 'none',
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

  sectionEmptyBox: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[50],
    borderRadius: theme.spacing(1.5),
    border: `1px dashed ${theme.palette.divider}`,
    textAlign: 'center' as const,
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
    width: '210px',
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

  tablePaper: {
    borderRadius: theme.spacing(1),
    overflow: 'hidden',
  },

  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    px: 2,
    py: 1.25,
  },

  panelHeaderIconBox: {
    width: 32,
    height: 32,
    borderRadius: 1.5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  panelHeaderIcon: {
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
  },

  panelHeaderTitle: {
    fontWeight: 700,
    fontSize: '0.92rem',
  },

  panelHeaderSubtitle: {
    fontSize: '0.8rem',
    color: theme.palette.text.secondary,
    marginTop: 2,
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
      backgroundColor: '#1e4085',
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
      backgroundColor: 'rgba(211, 47, 47, 0.08)',
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
      backgroundColor: 'rgba(45, 94, 187, 0.08)',
    },
  },
});
