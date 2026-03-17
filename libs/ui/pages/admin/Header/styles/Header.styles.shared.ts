import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  headerAppbar: {
    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
    color: theme.palette.common.white,
    width: '100%',
    left: 0,
    right: 0,
    zIndex: 1201,
    boxShadow: `0 2px 12px ${theme.palette.shadow.primary}`,

    [theme.breakpoints.down('sm')]: {
      minHeight: '104px',
    },
  },

  // ── Mobile logo bar (top row, visible only on xs/sm) ──────────
  mobileLogoBar: {
    display: 'none',

    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      height: '48px',
      borderBottom: '1px solid rgba(255,255,255,0.15)',
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
      background: 'rgba(0,0,0,0.08)',
    },
  },

  // ── Desktop logo area (inside toolbar, hidden on mobile) ────────
  desktopLogoArea: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    borderRadius: theme.spacing(1),
    padding: theme.spacing(0.5),
    transition: 'background 0.2s ease',
    '&:hover': {
      background: 'rgba(255,255,255,0.08)',
    },

    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },

  // ── Logo: badge (orange flame gradient) ───────────────────────
  logoBadge: {
    width: 42,
    height: 42,
    borderRadius: '12px',
    background: 'linear-gradient(145deg, #ff4500 0%, #ff6b35 45%, #ffb347 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 0 1.5px rgba(255,255,255,0.22), 0 4px 18px rgba(255,100,30,0.65)',
    flexShrink: 0,
    position: 'relative' as const,
    overflow: 'hidden',
    // diagonal shine stripe
    '&::before': {
      content: '""',
      position: 'absolute' as const,
      top: '-20%',
      left: '-40%',
      width: '45%',
      height: '150%',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.32), transparent)',
      transform: 'skewX(-18deg)',
    },
    // bottom accent glow line
    '&::after': {
      content: '""',
      position: 'absolute' as const,
      bottom: 0,
      left: '10%',
      right: '10%',
      height: '2px',
      background: 'rgba(255,255,255,0.5)',
      borderRadius: '0 0 12px 12px',
    },
  },

  logoBadgeLetter: {
    color: theme.palette.common.white,
    fontWeight: 900,
    fontSize: '1.4rem',
    lineHeight: 1,
    letterSpacing: '-0.04em',
    fontStyle: 'italic' as const,
    textShadow: '0 1px 4px rgba(0,0,0,0.35)',
    position: 'relative' as const,
    zIndex: 1,
  },

  logoWordmark: {
    color: theme.palette.common.white,
    fontWeight: 900,
    fontSize: '1.25rem',
    letterSpacing: '0.14em',
    lineHeight: 1,
    textShadow: '0 1px 3px rgba(0,0,0,0.25)',
  },

  logoTagline: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: '0.5rem',
    letterSpacing: '0.22em',
    lineHeight: 1,
    marginTop: '4px',
    textTransform: 'uppercase' as const,
    fontWeight: 600,

    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },

  // ── Divider between logo and user section ───────────────────────
  logoDivider: {
    width: '1px',
    height: '28px',
    background: 'rgba(255,255,255,0.20)',
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(1.5),
    flexShrink: 0,

    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },

  headerToolbar: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '64px',
    height: '64px',

    [theme.breakpoints.down('md')]: {
      paddingLeft: theme.spacing(1.5),
      paddingRight: theme.spacing(1.5),
    },

    [theme.breakpoints.down('sm')]: {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
      minHeight: '56px',
      height: '56px',
    },
  },

  // Left section: Avatar + User Name
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),

    [theme.breakpoints.down('lg')]: {
      gap: theme.spacing(1),
    },

    [theme.breakpoints.down('sm')]: {
      gap: theme.spacing(0.75),
    },
  },

  avatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),

    [theme.breakpoints.down('md')]: {
      width: theme.spacing(3.5),
      height: theme.spacing(3.5),
    },

    [theme.breakpoints.down('sm')]: {
      width: theme.spacing(3),
      height: theme.spacing(3),
    },
  },

  userName: {
    color: theme.palette.common.white,
    fontWeight: 500,
    fontSize: '1rem',

    [theme.breakpoints.down('sm')]: {
      fontSize: '0.9rem',
    },
  },

  headerCenter: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
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

  // Welcome text - hidden below md
  welcomeText: {
    display: 'flex',
    alignItems: 'center',

    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
  },

  // Right section
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: theme.spacing(1.5),

    [theme.breakpoints.down('lg')]: {
      gap: theme.spacing(1),
    },

    [theme.breakpoints.down('sm')]: {
      gap: theme.spacing(0.75),
    },
  },

  // Desktop search - hidden below lg
  headerFields: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),

    [theme.breakpoints.down('lg')]: {
      display: 'none',
    },
  },

  // Mobile search bar - visible only below lg
  mobileSearch: {
    display: 'none',

    [theme.breakpoints.down('lg')]: {
      display: 'flex',
      alignItems: 'center',
      flex: 1,
      maxWidth: '220px',
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
    },

    [theme.breakpoints.down('md')]: {
      maxWidth: '180px',
    },

    [theme.breakpoints.down('sm')]: {
      maxWidth: '140px',
      marginLeft: theme.spacing(0.5),
      marginRight: theme.spacing(0.5),
    },
  },

  mobileSearchField: {
    width: '100%',
    '& .MuiOutlinedInput-root': {
      height: '32px',
      fontSize: '0.8rem',
      borderRadius: 6,
      paddingLeft: theme.spacing(0.5),
      paddingRight: theme.spacing(0.5),
      backgroundColor: theme.palette.common.white,
    },
    '& .MuiInputBase-input': {
      padding: `${theme.spacing(0.5)} ${theme.spacing(0.75)}`,
      fontSize: '0.8rem',
      color: theme.palette.text.primary,
    },
    '& .MuiInputBase-input::placeholder': {
      color: theme.palette.text.secondary,
      opacity: 0.7,
      fontSize: '0.75rem',
    },
    '& .MuiInputAdornment-root .MuiSvgIcon-root': {
      fontSize: '1rem',
      color: theme.palette.text.secondary,
    },

    [theme.breakpoints.down('sm')]: {
      '& .MuiOutlinedInput-root': {
        height: '28px',
        fontSize: '0.75rem',
      },
      '& .MuiInputBase-input': {
        padding: `${theme.spacing(0.25)} ${theme.spacing(0.5)}`,
        fontSize: '0.75rem',
      },
      '& .MuiInputBase-input::placeholder': {
        fontSize: '0.7rem',
      },
      '& .MuiInputAdornment-root .MuiSvgIcon-root': {
        fontSize: '0.9rem',
      },
    },
  },

  // Admin chip
  adminChip: {
    backgroundColor: '#ff6b35 !important',
    color: '#ffffff !important',
    fontWeight: 'bold',
    fontSize: '0.7rem',
    height: '22px',
    '& .MuiChip-icon': {
      color: '#ffffff !important',
    },

    [theme.breakpoints.down('sm')]: {
      '& .MuiChip-label': {
        display: 'none',
      },
      '& .MuiChip-icon': {
        margin: 0,
      },
      paddingLeft: theme.spacing(0.5),
      paddingRight: theme.spacing(0.5),
    },
  },

  // Textfields (desktop only)
  textField: {
    width: '200px',
    '& .MuiOutlinedInput-root': {
      height: '34px',
      fontSize: '0.85rem',
      backgroundColor: theme.palette.common.white,
      borderRadius: 6,
    },
    '& .MuiInputBase-input': {
      padding: `${theme.spacing(0.5)} ${theme.spacing(1)}`,
      fontSize: '0.85rem',
      color: theme.palette.text.primary,
    },
    '& .MuiInputBase-input::placeholder': {
      color: theme.palette.text.secondary,
      opacity: 0.7,
    },
    '& .MuiInputAdornment-root .MuiSvgIcon-root': {
      fontSize: '1.1rem',
      color: theme.palette.text.secondary,
    },
  },

  // Ticket search wrapper
  ticketSearchWrapper: {
    position: 'relative',
  },

  // Search results dropdown
  searchDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: theme.spacing(0.5),
    backgroundColor: theme.palette.background.paper,
    borderRadius: 8,
    boxShadow: theme.shadows[8],
    zIndex: 1300,
    maxHeight: '280px',
    overflowY: 'auto',
    minWidth: '200px',
  },

  searchResultItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${theme.spacing(1)} ${theme.spacing(1.5)}`,
    cursor: 'pointer',
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:last-child': {
      borderBottom: 'none',
    },
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },

  searchResultNumber: {
    fontWeight: 600,
    fontSize: '0.85rem',
    color: theme.palette.text.primary,
  },

  searchResultDesc: {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    maxWidth: '120px',
  },

  searchNoResults: {
    padding: theme.spacing(1.5),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    fontSize: '0.8rem',
  },

  // Icons (used on raw MuiSvgIcon AND inside IconButton)
  icon: {
    width: '1.25em',
    height: '1.25em',
    cursor: 'pointer',
    color: theme.palette.common.white,
    transition: 'color 0.15s ease, transform 0.15s ease',
    '&:hover': {
      color: 'rgba(255,255,255,0.85)',
      transform: 'scale(1.12)',
    },
  },

  // Wrapper for raw icons that need an IconButton-like hover circle
  iconBtn: {
    padding: '6px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s ease, transform 0.15s ease',
    '&:hover': {
      background: 'rgba(255,255,255,0.15)',
      transform: 'scale(1.08)',
    },
  },
});
