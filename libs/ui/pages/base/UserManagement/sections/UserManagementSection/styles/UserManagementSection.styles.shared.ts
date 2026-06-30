import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  container: {
    padding: theme.spacing(3),
    position: 'relative',
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1.5),
    },
    [theme.breakpoints.between('sm', 'md')]: {
      padding: theme.spacing(2),
    },
  },

  pageHeader: {
    marginBottom: theme.spacing(2.5),
    background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #0369a1 100%)',
    borderRadius: 12,
    padding: theme.spacing(3, 3.5),
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: -60,
      right: -60,
      width: 240,
      height: 240,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.05)',
      pointerEvents: 'none',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: -40,
      left: '30%',
      width: 160,
      height: 160,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.04)',
      pointerEvents: 'none',
    },
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
      borderRadius: 8,
    },
  },

  pageHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(0.5),
    position: 'relative',
    zIndex: 1,
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column' as const,
      alignItems: 'flex-start',
      gap: theme.spacing(1),
    },
  },

  title: {
    fontWeight: 700,
    color: '#fff',
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.2rem',
    },
  },

  description: {
    color: 'rgba(255,255,255,0.75)',
    marginTop: theme.spacing(0.5),
    fontSize: '0.875rem',
    position: 'relative',
    zIndex: 1,
  },

  toolbar: {
    padding: theme.spacing(1),
    marginTop: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1.25),
    },
  },

  toolbarStack: {
    display: 'flex',
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: theme.spacing(0.5),
    alignItems: 'center',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column' as const,
      alignItems: 'stretch',
      gap: theme.spacing(0.75),
      '& > span': { width: '100%' },
      '& .MuiButton-root': { width: '100%', justifyContent: 'flex-start' },
    },
  },

  buttonLabel: {},

  tabsBox: {
    display: 'flex',
    alignItems: 'center',
    borderBottom: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column' as const,
      alignItems: 'stretch',
    },
  },

  tableContainer: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    overflowX: 'auto' as const,
  },

  tabsSearchField: {
    marginLeft: theme.spacing(2),
    flexShrink: 0,
    width: '220px',
    '& .MuiOutlinedInput-root': {
      height: '34px',
      fontSize: '0.85rem',
      backgroundColor: theme.palette.common.white,
      borderRadius: '6px',
    },
    '& .MuiInputBase-input': {
      padding: '4px 8px',
      fontSize: '0.85rem',
    },
    '& .MuiInputBase-input::placeholder': {
      opacity: 0.7,
    },
    '& .MuiInputAdornment-root .MuiSvgIcon-root': {
      fontSize: '1.1rem',
      color: theme.palette.text.secondary,
    },
    [theme.breakpoints.down('sm')]: {
      marginLeft: 0,
      marginTop: theme.spacing(1),
      width: '100%',
    },
  },

  adminControlsBtn: {
    flexShrink: 0,
  },

  adminControlsWrapper: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(1),
  },

  toolbarSearchField: {
    marginLeft: 'auto',
    width: '220px',
    '& .MuiOutlinedInput-root': {
      height: '34px',
      fontSize: '0.85rem',
      backgroundColor: theme.palette.common.white,
      borderRadius: '6px',
    },
    '& .MuiInputBase-input': {
      padding: '4px 8px',
      fontSize: '0.85rem',
    },
    '& .MuiInputBase-input::placeholder': {
      opacity: 0.7,
    },
    '& .MuiInputAdornment-root .MuiSvgIcon-root': {
      fontSize: '1.1rem',
      color: theme.palette.text.secondary,
    },
  },

  selectionIndicator: {
    display: 'block',
    marginTop: theme.spacing(0.75),
    paddingLeft: theme.spacing(0.5),
  },

  dividerMobile: {
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },

  sectionAccordion: {
    marginBottom: theme.spacing(2),
  },

  actionToolbar: {
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      marginBottom: theme.spacing(1.5),
    },
  },

  toolbarButtons: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: theme.spacing(0.5),
    alignItems: 'center',
    padding: 8,
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column' as const,
      alignItems: 'stretch',
      gap: theme.spacing(0.75),
      '& > span': { width: '100%' },
      '& .MuiButton-root': { width: '100%', justifyContent: 'flex-start' },
    },
  },

  tablePaper: {
    borderRadius: theme.shape.borderRadius,
    overflowX: 'auto' as const,
  },
});
