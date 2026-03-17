import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  drawer: {
    whiteSpace: 'nowrap',
    transition: 'width 0.3s ease',
    flexShrink: 0,

    '& .MuiDrawer-paper': {
      color: theme.palette.sidebar.textTransparent,
      borderRight: 'none',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      zIndex: 1200,
      boxSizing: 'border-box',
      top: '64px',
      height: 'calc(100vh - 64px)',
      width: 250,
      padding: theme.spacing(1.25),

      [theme.breakpoints.between('md', 'lg')]: {
        width: 250,
        padding: theme.spacing(1),
      },

      [theme.breakpoints.between('sm', 'md')]: {
        width: 200,
        padding: theme.spacing(1),
        height: 'calc(100vh - 56px)',
      },

      [theme.breakpoints.down('sm')]: {
        width: 195,
        padding: theme.spacing(0.75),
        top: '56px',
        height: 'calc(100vh - 56px)',
      },
    },
  },

  drawerCollapsed: {
    '& .MuiDrawer-paper': {
      width: 72,

      [theme.breakpoints.between('md', 'lg')]: {
        width: 70,
      },

      [theme.breakpoints.between('sm', 'md')]: {
        width: 70,
      },

      [theme.breakpoints.down('sm')]: {
        width: 68,
      },
    },
  },

  iconMarginExpanded: {
    marginRight: theme.spacing(1.5),

    [theme.breakpoints.between('md', 'lg')]: {
      marginRight: theme.spacing(1),
    },

    [theme.breakpoints.between('sm', 'md')]: {
      marginRight: theme.spacing(0.75),
    },

    [theme.breakpoints.down('sm')]: {
      marginRight: theme.spacing(0.5),
    },
  },

  iconMarginCollapsed: {
    marginRight: 0,
  },

  listItem: {
    padding: theme.spacing(1.25),
    margin: theme.spacing(0.25, 0),
    borderRadius: theme.spacing(1),
    color: theme.palette.sidebar.text,
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',

    // Desktop
    fontSize: '1rem',

    // Tablet
    [theme.breakpoints.between('md', 'lg')]: {
      padding: theme.spacing(0.875),
      fontSize: '0.9rem',
    },

    // Small tablet
    [theme.breakpoints.between('sm', 'md')]: {
      padding: theme.spacing(0.75),
      fontSize: '0.85rem',
    },

    // Mobile
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(0.625),
      fontSize: '0.8rem',
    },

    '&:hover': {
      backgroundColor: theme.palette.sidebar.hoverBg,
      color: theme.palette.common.white,
      '& .MuiListItemIcon-root': {
        color: theme.palette.common.white,
      },
    },
  },

  activeItem: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    '& .MuiListItemIcon-root': {
      color: theme.palette.common.white,
    },
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },

  icon: {
    color: theme.palette.sidebar.text,
    minWidth: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',

    '& .MuiSvgIcon-root': {
      // Desktop
      fontSize: '1.5rem',

      // Tablet
      [theme.breakpoints.between('md', 'lg')]: {
        fontSize: '1.3rem',
      },

      // Small tablet
      [theme.breakpoints.between('sm', 'md')]: {
        fontSize: '1.2rem',
      },

      // Mobile
      [theme.breakpoints.down('sm')]: {
        fontSize: '1.15rem',
      },
    },
  },

  text: {
    opacity: 1,
    transition: 'opacity 0.3s ease, width 0.3s ease',
    whiteSpace: 'nowrap',
    overflow: 'hidden',

    '& .MuiListItemText-primary': {
      // Desktop
      fontSize: '1rem',

      // Tablet
      [theme.breakpoints.between('md', 'lg')]: {
        fontSize: '0.9rem',
      },

      // Small tablet
      [theme.breakpoints.between('sm', 'md')]: {
        fontSize: '0.85rem',
      },

      // Mobile
      [theme.breakpoints.down('sm')]: {
        fontSize: '0.8rem',
      },
    },
  },

  subItem: {
    paddingLeft: 6.875,
    color: theme.palette.sidebar.subItemText,
    borderRadius: 1,
    display: 'flex',
    fontSize: '0.9rem',
    [theme.breakpoints.down('sm')]: {
      paddingLeft: 4,
      fontSize: '0.8rem',
    },
    [theme.breakpoints.between('sm', 'md')]: {
      paddingLeft: 5,
      fontSize: '0.85rem',
    },

    '&:hover': {
      backgroundColor: theme.palette.sidebar.hoverBg,
      color: theme.palette.common.white,
    },
  },

  subText: {
    opacity: 1,
    transition: 'opacity 0.2s',
    fontSize: '0.9rem',
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.8rem',
    },
    [theme.breakpoints.between('sm', 'md')]: {
      fontSize: '0.85rem',
    },
  },

  subTextCollapsed: {
    opacity: 0,
  },

  toggleButtonCenter: {
    display: 'flex !important',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.sidebar.border}`,
    marginBottom: theme.spacing(0.5),
    transition: 'all 0.3s ease',
    position: 'sticky',
    top: 0,
    backgroundColor: 'inherit',
    zIndex: 10,

    [theme.breakpoints.between('md', 'lg')]: {
      padding: theme.spacing(0.75),
    },

    [theme.breakpoints.between('sm', 'md')]: {
      padding: theme.spacing(0.75),
    },

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(0.5),
    },

    '& .MuiIconButton-root': {
      padding: theme.spacing(0.75),
      color: theme.palette.common.white,
      backgroundColor: theme.palette.sidebar.buttonBg,
      borderRadius: '50%',
      minWidth: '40px',
      minHeight: '40px',
      transition: 'all 0.3s ease',
      boxShadow: `0 2px 4px ${theme.palette.sidebar.shadow}`,

      '&:hover': {
        backgroundColor: theme.palette.sidebar.buttonHoverBg,
        color: theme.palette.common.white,
        transform: 'scale(1.1)',
        boxShadow: `0 4px 8px ${theme.palette.sidebar.shadowHover}`,
      },

      '& .MuiSvgIcon-root': {
        fontSize: '1.5rem',
        [theme.breakpoints.down('sm')]: {
          fontSize: '1.25rem',
        },
      },
    },
  },

  toggleButtonRight: {
    display: 'flex !important',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 5,
    borderBottom: `1px solid ${theme.palette.sidebar.border}`,
    marginBottom: 0,
    transition: 'all 0.3s ease',
    position: 'sticky',
    top: 0,
    backgroundColor: 'inherit',
    zIndex: 10,

    [theme.breakpoints.between('md', 'lg')]: {
      padding: theme.spacing(0.75),
    },

    [theme.breakpoints.between('sm', 'md')]: {
      padding: theme.spacing(0.75),
    },

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(0.5),
    },

    '& .MuiIconButton-root': {
      padding: theme.spacing(0.75),
      color: theme.palette.common.white,
      backgroundColor: theme.palette.sidebar.buttonBg,
      borderRadius: '50%',
      minWidth: '40px',
      minHeight: '40px',
      transition: 'all 0.3s ease',
      boxShadow: `0 2px 4px ${theme.palette.sidebar.shadow}`,

      '&:hover': {
        backgroundColor: theme.palette.sidebar.buttonHoverBg,
        color: theme.palette.common.white,
        transform: 'scale(1.1)',
        boxShadow: `0 4px 8px ${theme.palette.sidebar.shadowHover}`,
      },

      '& .MuiSvgIcon-root': {
        fontSize: '1.5rem',
        [theme.breakpoints.down('sm')]: {
          fontSize: '1.25rem',
        },
      },
    },
  },
});
