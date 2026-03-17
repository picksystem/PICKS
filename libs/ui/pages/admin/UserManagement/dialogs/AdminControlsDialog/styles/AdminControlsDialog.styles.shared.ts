import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  dialogPaper: {
    borderRadius: (theme.shape.borderRadius as number) * 3,
    overflow: 'hidden' as const,
    boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
  },

  // ── Header ──────────────────────────────────────────
  header: {
    background: theme.palette.gradient.headerBlue,
    padding: theme.spacing(2.5, 3),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    position: 'relative' as const,
    '&::after': {
      content: '""',
      position: 'absolute' as const,
      bottom: 0,
      left: 0,
      right: 0,
      height: '1px',
      background: 'rgba(255,255,255,0.15)',
    },
  },
  headerIconWrap: {
    width: 48,
    height: 48,
    borderRadius: '14px',
    background: 'rgba(255,255,255,0.18)',
    border: '1.5px solid rgba(255,255,255,0.30)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backdropFilter: 'blur(8px)',
  },
  headerIcon: {
    color: theme.palette.common.white,
    fontSize: 24,
  },
  headerTextBox: {
    flex: 1,
  },
  headerTitle: {
    color: theme.palette.common.white,
    fontSize: '1.1rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.01em',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: '0.75rem',
    fontWeight: 400,
    letterSpacing: '0.02em',
    marginTop: '2px',
  },
  headerChip: {
    background: 'rgba(255,255,255,0.22)',
    color: theme.palette.common.white,
    fontSize: '0.7rem',
    fontWeight: 600,
    height: 22,
    border: '1px solid rgba(255,255,255,0.30)',
    '& .MuiChip-label': { px: 1 },
  },
  headerCloseBtn: {
    color: 'rgba(255,255,255,0.75)',
    '&:hover': {
      color: theme.palette.common.white,
      background: 'rgba(255,255,255,0.15)',
    },
  },

  // ── Dialog Content ───────────────────────────────────
  dialogContent: {
    padding: theme.spacing(1.5),
    background: theme.palette.background.default,
    '& .MuiAccordion-root:first-of-type': {
      borderTopLeftRadius: `${(theme.shape.borderRadius as number) * 2}px !important`,
      borderTopRightRadius: `${(theme.shape.borderRadius as number) * 2}px !important`,
    },
    '& .MuiAccordion-root:last-of-type': {
      borderBottomLeftRadius: `${(theme.shape.borderRadius as number) * 2}px !important`,
      borderBottomRightRadius: `${(theme.shape.borderRadius as number) * 2}px !important`,
    },
  },

  // ── Accordion ────────────────────────────────────────
  accordion: {
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: `${(theme.shape.borderRadius as number) * 2}px !important`,
    marginBottom: theme.spacing(1),
    transition: 'box-shadow 0.2s ease',
    '&:before': { display: 'none' },
    '&.Mui-expanded': {
      boxShadow: `0 4px 20px rgba(0,0,0,0.08)`,
      borderColor: theme.palette.primary.border,
    },
    '&:last-child': { marginBottom: 0 },
  },

  accordionSummary: {
    borderRadius: `${(theme.shape.borderRadius as number) * 2}px`,
    minHeight: 60,
    padding: theme.spacing(0, 2),
    '&.Mui-expanded': {
      minHeight: 60,
      borderBottom: `1px solid ${theme.palette.divider}`,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      background: theme.palette.primary.blueAlpha03,
    },
    '& .MuiAccordionSummary-content': {
      margin: 0,
    },
    '& .MuiAccordionSummary-content.Mui-expanded': {
      margin: 0,
    },
  },

  accordionSummaryInner: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    flex: 1,
    padding: theme.spacing(1, 0),
  },

  accordionTitle: {
    fontSize: '0.9rem',
    fontWeight: 700,
    lineHeight: 1.3,
    color: theme.palette.text.primary,
  },

  accordionSubtitle: {
    fontSize: '0.72rem',
    color: theme.palette.text.secondary,
    marginTop: '1px',
  },

  expandIcon: {
    color: theme.palette.text.secondary,
    fontSize: 20,
  },

  activeCheckIcon: {
    color: theme.palette.success.complete,
    fontSize: 18,
    flexShrink: 0,
  },

  accordionDetails: {
    padding: theme.spacing(2, 2.5),
  },

  // ── Section Icons ────────────────────────────────────
  sectionIconCircle: {
    width: 34,
    height: 34,
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sectionIconBlue: {
    background: theme.palette.gradient.sectionBlue,
    boxShadow: `0 4px 10px ${theme.palette.primary.blueAlpha04}`,
  },
  sectionIconPurple: {
    background: theme.palette.gradient.sectionPurple,
    boxShadow: '0 4px 10px rgba(124,58,237,0.20)',
  },
  sectionIconTeal: {
    background: 'linear-gradient(135deg,#0d9488,#14b8a6)',
    boxShadow: '0 4px 10px rgba(20,184,166,0.25)',
  },
  sectionIconWhite: {
    fontSize: 16,
    color: theme.palette.common.white,
  },

  // ── Page Style Box ───────────────────────────────────
  pageStyleBox: {
    marginBottom: theme.spacing(1.5),
    padding: theme.spacing(1.5, 2),
    borderRadius: (theme.shape.borderRadius as number) * 1.5,
    border: `1px solid ${theme.palette.divider}`,
    background: theme.palette.primary.blueAlpha03,
    '&:last-child': { marginBottom: 0 },
  },

  // ── Theme Grid ───────────────────────────────────────
  activeThemeChip: {
    background: theme.palette.primary.blueAlpha04,
    color: theme.palette.primary.main,
    fontSize: '0.7rem',
    fontWeight: 600,
    height: 22,
    border: `1px solid ${theme.palette.primary.border}`,
    flexShrink: 0,
  },

  themeGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: theme.spacing(1),
    [theme.breakpoints.down('sm')]: { gridTemplateColumns: '1fr' },
  },

  themeCard: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1, 1.25),
    borderRadius: (theme.shape.borderRadius as number) * 1.5,
    border: '1.5px solid',
    borderColor: theme.palette.divider,
    background: theme.palette.background.paper,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    '&:hover': {
      borderColor: theme.palette.primary.main,
      background: theme.palette.primary.blueAlpha03,
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    },
  },

  themeCardSelected: {
    borderColor: theme.palette.primary.main,
    background: theme.palette.primary.blueAlpha03,
    boxShadow: `0 0 0 2px ${theme.palette.primary.main}33`,
  },

  themeSwatch: {
    width: 26,
    height: 26,
    borderRadius: '8px',
    flexShrink: 0,
    border: '1px solid rgba(0,0,0,0.08)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },

  themeCardLabel: {
    flex: 1,
    fontSize: '0.8rem',
    fontWeight: 500,
    color: theme.palette.text.primary,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  themeCheckIcon: {
    flexShrink: 0,
  },

  // ── Dialog Actions ───────────────────────────────────
  dialogActions: {
    padding: theme.spacing(1.5, 2.5, 2),
    gap: theme.spacing(1),
    background: theme.palette.background.paper,
    borderTop: `1px solid ${theme.palette.divider}`,
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column' as const,
      padding: theme.spacing(1.5, 2),
      '& .MuiButton-root': { width: '100%' },
    },
  },
});
