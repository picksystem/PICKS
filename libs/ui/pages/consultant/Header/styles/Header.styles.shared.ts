import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  headerAppbar: {
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.common.white,
    width: '100%',
    left: 0,
    right: 0,
    zIndex: 1201,
    boxShadow: `0 2px 4px ${theme.palette.shadow.primary}`,

    [theme.breakpoints.down('sm')]: {
      minHeight: '56px',
    },
  },

  headerToolbar: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '64px',

    [theme.breakpoints.down('sm')]: {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
      minHeight: '56px',
    },
  },

  // Left section: Avatar + User Name
  headerLeft: {
    display: 'flex',
    alignItems: 'center', // Center align items vertically
    gap: theme.spacing(1.5), // Add spacing between Avatar and User Name
  },

  avatar: {
    width: theme.spacing(4), // Set size of Avatar
    height: theme.spacing(4),
  },

  userName: {
    color: theme.palette.common.white,
    fontWeight: 500,
    fontSize: '1rem',

    [theme.breakpoints.down('sm')]: {
      fontSize: '0.9rem',
    },
  },

  // Center section: Welcome, Admin
  headerCenter: {
    display: 'flex',
    justifyContent: 'center', // Center "Welcome, Admin" horizontally
    alignItems: 'center', // Align it vertically
    flex: 1, // Take up space between left and right sections
    textAlign: 'center',

    [theme.breakpoints.down('sm')]: {
      justifyContent: 'center',
      flex: 1,
    },
  },

  headerTitle: {
    color: theme.palette.common.white,
    fontWeight: 600,
    fontSize: '1.2rem',

    [theme.breakpoints.down('md')]: {
      fontSize: '1.1rem',
    },

    [theme.breakpoints.down('sm')]: {
      fontSize: '1rem',
    },
  },

  // Right section: Search, textfield, and icons
  headerRight: {
    display: 'flex',
    alignItems: 'center', // Align all items vertically
    justifyContent: 'flex-end', // Align all items to the right
    gap: theme.spacing(2), // Add spacing between icons/text fields
  },

  // For textfields in the header
  textField: {
    width: '250px', // Default width
    '& .MuiInputBase-input::placeholder': {
      color: theme.palette.common.white, // Placeholder in white
      opacity: 0.7, // Optional transparency for placeholder text
    },
    [theme.breakpoints.down('sm')]: {
      width: '180px', // Smaller width on mobile
    },
  },

  // Style for icons
  icon: {
    width: '1.2em',
    height: '1.2em',
    cursor: 'pointer',
    color: theme.palette.common.white, // Keep icons white
    '&:hover': {
      color: theme.palette.secondary.main, // Highlight icons on hover
    },
  },
});
