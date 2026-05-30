import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  actionToolbar: {
    padding: '8px 12px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: theme.spacing(0.5),
    border: 'none',
  },

  toolbarButtons: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: theme.spacing(0.75),
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between',
      alignItems: 'center',
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

  tablePaper: {
    borderRadius: theme.spacing(1),
    overflow: 'hidden',
  },
});
