import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  // ── Page container ──────────────────────────────────────────────────────
  container: {
    padding: theme.spacing(3),
    width: '100%',
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
  },

  // ── Section accordions ──────────────────────────────────────────────────
  sectionAccordion: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: `${theme.spacing(1.5)} !important`,
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

  // ── Action toolbar ──────────────────────────────────────────────────────
  actionToolbar: {
    padding: `${theme.spacing(1)} ${theme.spacing(1.5)}`,
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

  selectionInfo: {
    paddingTop: theme.spacing(0.5),
    paddingLeft: theme.spacing(0.5),
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

  // ── TicketTypeCards ─────────────────────────────────────────────────────
  cardGrid: {
    width: '100%',
  },

  card: {
    border: '2px solid',
    borderColor: theme.palette.divider,
    borderRadius: theme.spacing(1),
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    overflow: 'hidden',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
  },

  cardAccentStrip: {
    height: 5,
    width: '100%',
    flexShrink: 0,
  },

  cardContent: {
    paddingBottom: theme.spacing(1),
    flex: 1,
  },

  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
  },

  cardHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.25),
  },

  cardIconBadge: {
    width: 44,
    height: 44,
    borderRadius: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  cardTypeLabel: {
    fontWeight: 700,
    fontSize: '0.92rem',
    lineHeight: 1.3,
  },

  cardTypeKey: {
    fontSize: '0.68rem',
    fontFamily: 'monospace',
    color: theme.palette.text.secondary,
  },

  cardFormatPreviewBox: {
    textAlign: 'center' as const,
    paddingTop: theme.spacing(1.75),
    paddingBottom: theme.spacing(1.75),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    borderRadius: theme.spacing(1.5),
    marginBottom: theme.spacing(2),
    position: 'relative' as const,
    overflow: 'hidden',
  },

  cardFormatLabel: {
    display: 'block',
    fontSize: '0.58rem',
    fontWeight: 700,
    letterSpacing: 2,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(0.5),
  },

  cardFormatValue: {
    fontFamily: 'monospace',
    fontWeight: 800,
    fontSize: '1.35rem',
    letterSpacing: 2.5,
  },

  cardTiles: {
    display: 'flex',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },

  cardTile: {
    flex: 1,
    textAlign: 'center' as const,
    paddingTop: theme.spacing(0.875),
    paddingBottom: theme.spacing(0.875),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    backgroundColor: theme.palette.grey[50],
    borderRadius: theme.spacing(0.5),
    border: `1px solid ${theme.palette.divider}`,
  },

  cardTileLabel: {
    display: 'block',
    fontSize: '0.58rem',
    fontWeight: 700,
    letterSpacing: 1,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(0.25),
  },

  cardTileValue: {
    fontFamily: 'monospace',
    fontWeight: 700,
    fontSize: '0.88rem',
  },

  cardDescription: {
    fontSize: '0.78rem',
    color: theme.palette.text.secondary,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
    minHeight: '2.34em',
    lineHeight: 1.6,
  },

  cardActions: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(1.25),
    paddingTop: theme.spacing(0.75),
    justifyContent: 'flex-end',
    borderTop: `1px solid ${theme.palette.divider}`,
    gap: theme.spacing(0.5),
  },

  // ── TicketTypeFormDialog ────────────────────────────────────────────────
  dialogDecorCircleTop: {
    position: 'absolute' as const,
    top: -50,
    right: -50,
    width: 180,
    height: 180,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.07)',
    pointerEvents: 'none' as const,
  },

  dialogDecorCircleBottom: {
    position: 'absolute' as const,
    bottom: -35,
    left: 80,
    width: 130,
    height: 130,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.05)',
    pointerEvents: 'none' as const,
  },

  dialogHeroBanner: {
    position: 'relative' as const,
    paddingLeft: theme.spacing(2.5),
    paddingRight: theme.spacing(2.5),
    paddingTop: theme.spacing(3),
    paddingBottom: '90px',
    overflow: 'hidden',
    [theme.breakpoints.up('sm')]: {
      paddingLeft: theme.spacing(4),
      paddingRight: theme.spacing(4),
      paddingTop: theme.spacing(3.5),
      paddingBottom: theme.spacing(3.5),
    },
  },

  dialogHeroInner: {
    position: 'relative' as const,
    zIndex: 1,
  },

  dialogHeroTopRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1.25),
    [theme.breakpoints.down('sm')]: {
      gap: theme.spacing(1.5),
    },
    [theme.breakpoints.up('sm')]: {
      gap: theme.spacing(2),
    },
  },

  dialogHeroIconWrap: {
    borderRadius: theme.spacing(1),
    background: 'rgba(255,255,255,0.18)',
    border: '1.5px solid rgba(255,255,255,0.32)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    [theme.breakpoints.down('sm')]: {
      width: 40,
      height: 40,
      borderRadius: theme.spacing(1),
    },
    [theme.breakpoints.up('sm')]: {
      width: 56,
      height: 56,
      borderRadius: theme.spacing(1.5),
    },
  },

  dialogHeroTextWrap: {
    minWidth: 0,
    flex: 1,
  },

  dialogHeroTitle: {
    color: '#fff',
    fontWeight: 800,
    lineHeight: 1.2,
    letterSpacing: '-0.2px',
    [theme.breakpoints.down('sm')]: {
      fontSize: '1rem',
    },
    [theme.breakpoints.up('sm')]: {
      fontSize: '1.3rem',
    },
  },

  dialogHeroChipRow: {
    display: 'flex',
    gap: theme.spacing(0.75),
    marginTop: theme.spacing(0.5),
    flexWrap: 'wrap' as const,
  },

  dialogHeroTagChip: {
    background: 'rgba(255,255,255,0.18)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.35)',
    fontWeight: 700,
    fontSize: '0.6rem',
    height: 18,
    borderRadius: '5px',
  },

  dialogHeroStatusChip: {
    color: '#fff',
    fontWeight: 700,
    fontSize: '0.6rem',
    height: 18,
  },

  dialogHeroFormatRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },

  dialogHeroFormatCode: {
    fontFamily: 'monospace',
    fontWeight: 800,
    color: 'rgba(255,255,255,0.95)',
    textShadow: '0 2px 8px rgba(0,0,0,0.2)',
    lineHeight: 1,
    [theme.breakpoints.down('sm')]: {
      fontSize: '1rem',
      letterSpacing: 1,
    },
    [theme.breakpoints.up('sm')]: {
      fontSize: '1.5rem',
      letterSpacing: 3,
    },
  },

  dialogHeroFormatBadge: {
    paddingLeft: theme.spacing(0.75),
    paddingRight: theme.spacing(0.75),
    paddingTop: theme.spacing(0.25),
    paddingBottom: theme.spacing(0.25),
    borderRadius: theme.spacing(0.5),
    backgroundColor: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.25)',
  },

  dialogHeroFormatBadgeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: '0.58rem',
    fontWeight: 700,
    letterSpacing: 0.8,
  },

  dialogHeroDescription: {
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 1.55,
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.78rem',
    },
    [theme.breakpoints.up('sm')]: {
      fontSize: '0.82rem',
    },
  },

  dialogForm: {
    paddingLeft: theme.spacing(2.5),
    paddingRight: theme.spacing(2.5),
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    [theme.breakpoints.up('sm')]: {
      paddingLeft: theme.spacing(4),
      paddingRight: theme.spacing(4),
    },
  },

  dialogDividerLabel: {
    fontSize: '0.68rem',
    letterSpacing: 0.5,
    fontWeight: 600,
  },

  dialogActivationRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(1.25),
    paddingBottom: theme.spacing(1.25),
    borderRadius: theme.spacing(1),
    border: '1px solid',
    transition: 'all 0.2s ease',
  },

  dialogActivationDescription: {
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },

  dialogActivationLabel: {
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },

  dialogFooter: {
    paddingLeft: theme.spacing(2.5),
    paddingRight: theme.spacing(2.5),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    display: 'flex',
    gap: theme.spacing(1.5),
    borderTop: `1px solid ${theme.palette.divider}`,
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column' as const,
    },
    [theme.breakpoints.up('sm')]: {
      flexDirection: 'row' as const,
      justifyContent: 'flex-end',
      paddingLeft: theme.spacing(4),
      paddingRight: theme.spacing(4),
    },
  },

  dialogSaveBtn: {
    textTransform: 'none' as const,
    borderRadius: theme.spacing(1),
    minWidth: 130,
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      order: 1,
    },
    [theme.breakpoints.up('sm')]: {
      order: 2,
    },
  },

  dialogCancelBtn: {
    textTransform: 'none' as const,
    borderRadius: theme.spacing(1),
    minWidth: 100,
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      order: 2,
    },
    [theme.breakpoints.up('sm')]: {
      order: 1,
    },
  },

  dialogIconPreviewWrap: {
    width: 22,
    height: 22,
    borderRadius: theme.spacing(0.5),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  dialogIconMenuWrap: {
    width: 26,
    height: 26,
    borderRadius: theme.spacing(0.5),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Dialog Paper & Content ───────────────────────────────────────────────
  dialogPaper: {
    borderRadius: theme.spacing(1.5),
    overflow: 'hidden',
  },

  dialogContent: {
    padding: 0,
  },

  // ── Select renderValue layout ────────────────────────────────────────────
  dialogSelectRenderValue: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },

  // ── Priority Tag select ──────────────────────────────────────────────────
  dialogTagDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    flexShrink: 0,
  },

  dialogTagRenderLabel: {
    fontSize: '0.82rem',
    fontWeight: 600,
  },

  dialogTagListItemIcon: {
    minWidth: 30,
  },

  dialogTagMenuDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
  },

  dialogTagSelectedBadge: {
    marginLeft: theme.spacing(1),
    paddingLeft: theme.spacing(0.75),
    paddingRight: theme.spacing(0.75),
    paddingTop: 1,
    paddingBottom: 1,
    borderRadius: theme.spacing(1),
  },

  dialogTagSelectedLabel: {
    fontSize: '0.6rem',
    fontWeight: 700,
  },

  // ── Icon select ──────────────────────────────────────────────────────────
  dialogIconSubheader: {
    fontSize: '0.65rem',
    fontWeight: 800,
    letterSpacing: 1,
    lineHeight: '28px',
    backgroundColor: theme.palette.grey[50],
    color: theme.palette.text.secondary,
  },

  dialogIconListItemIcon: {
    minWidth: 34,
  },

  // ── Prefix field ─────────────────────────────────────────────────────────
  dialogPrefixInput: {
    '& .MuiInputBase-input': {
      fontFamily: 'monospace',
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: '2px',
    },
  },

  // ── Activation row ───────────────────────────────────────────────────────
  dialogActivationFormControl: {
    marginRight: 0,
    marginLeft: theme.spacing(1),
  },
});
