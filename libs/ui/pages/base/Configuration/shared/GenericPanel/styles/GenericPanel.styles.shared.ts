import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  container: {
    padding: 3,
  },

  title: {
    marginBottom: 3,
    fontWeight: 600,
    fontSize: '2.125rem',
    [theme.breakpoints.down('sm')]: {
      marginBottom: 2,
      fontSize: '1.5rem',
    },
    [theme.breakpoints.between('sm', 'md')]: {
      marginBottom: 2.5,
      fontSize: '1.75rem',
    },
    [theme.breakpoints.between('md', 'lg')]: {
      fontSize: '2rem',
    },
  },

  description: {
    color: theme.palette.text.secondary,
    fontSize: '1rem',
    lineHeight: 1.6,
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.875rem',
      lineHeight: 1.4,
    },
    [theme.breakpoints.between('sm', 'md')]: {
      fontSize: '0.9rem',
      lineHeight: 1.5,
    },
  },

  actionToolbar: {
    padding: '8px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
    borderRadius: 0,
    border: 'none',
  },

  toolbarButtons: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: '6px',
    '& > button': {
      width: '100%',
    },
    '& > span': {
      display: 'none',
    },
    [theme.breakpoints.up('sm')]: {
      flexDirection: 'row',
      alignItems: 'center',
      '& > button': {
        width: 'auto',
      },
      '& > span': {
        display: 'block',
      },
    },
  },

  newButtonContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
    '& > button': {
      width: '100%',
    },
    [theme.breakpoints.up('sm')]: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  },

  searchFieldContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: 'auto',
    },
  },

  toolbarDivider: {
    width: '1px',
    height: '20px',
    bgcolor: 'divider',
    alignSelf: 'center',
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

  tableSearchFieldHidden: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
      width: '160px',
      flexShrink: 0,
      flexGrow: 0,
    },
  },

  tablePaper: {
    overflow: 'hidden',
  },

  sectionAccordion: {
    marginTop: theme.spacing(2.5),
    width: '100%',
    '&::before': { display: 'none' },
  },

  sectionHeaderContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
  },

  sectionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 1.5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  sectionIcon: {
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
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
});
