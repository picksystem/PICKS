import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  container: {
    marginTop: theme.spacing(2),
  },

  dataTablePaper: {
    borderRadius: 8,
    overflow: 'hidden',
  },

  // ── Panel Header ─────────────────────────────────────
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.25, 2),
    borderRadius: '10px 10px 0 0',
    border: '1px solid #0fa6f940',
    borderBottom: 'none',
  },

  panelHeaderIcon: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '1rem',
  },

  panelHeaderTitle: {
    fontWeight: 700,
    fontSize: '0.9rem',
  },

  panelHeaderCount: {
    marginLeft: 'auto',
  },

  // ── Toolbar ──────────────────────────────────────────
  toolbarPaper: {
    borderRadius: 0,
    borderTop: 'none',
    borderBottom: 'none',
    padding: theme.spacing(1),
  },

  toolbarContainer: {
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',

    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      alignItems: 'stretch',
    },
  },

  actionButtons: {
    display: 'flex',
    gap: theme.spacing(1),
    flexWrap: 'nowrap',
  },

  primaryButton: {
    paddingInline: theme.spacing(2),
  },

  dangerButton: {
    paddingInline: theme.spacing(2),
  },

  clearButton: {
    paddingInline: theme.spacing(2),
  },

  // ── Search ───────────────────────────────────────────
  tableSearchField: {
    width: 160,
    marginLeft: 'auto',

    '& .MuiOutlinedInput-root': {
      height: 30,
      fontSize: '0.8rem',
      backgroundColor: theme.palette.common.white,
      borderRadius: 6,
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
      marginLeft: 0,
    },
  },

  // ── Table Cell Styles ────────────────────────────────
  cellTruncate: {
    fontSize: '0.8rem',
    color: theme.palette.text.secondary,
  },

  cellNormal: {
    fontWeight: 500,
    fontSize: '0.82rem',
  },
});
