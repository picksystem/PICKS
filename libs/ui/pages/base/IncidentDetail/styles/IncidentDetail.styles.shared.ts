import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  container: {
    padding: theme.spacing(2),
    background: 'linear-gradient(145deg, #eef2ff 0%, #f8faff 50%, #eff6ff 100%)',
    minHeight: '100vh',

    [theme.breakpoints.down('md')]: {
      padding: theme.spacing(1.5),
    },

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1),
    },
  },

  // Mobile-only compact header bar
  mobileHeaderBar: {
    display: 'none',

    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 0,
      padding: '10px 14px',
      background: 'linear-gradient(135deg, #1a237e 0%, #283593 40%, #1565c0 100%)',
      color: theme.palette.common.white,
      borderRadius: '16px 16px 0 0',
      boxShadow: '0 4px 20px rgba(26, 35, 126, 0.4)',
    },
  },

  mobileHeaderCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(0.75),
    flex: 1,
    minWidth: 0,
    flexWrap: 'nowrap' as const,
    overflow: 'hidden',
  },

  mobileIncidentNumber: {
    fontWeight: 800,
    fontSize: '1.1rem',
    color: 'inherit',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    letterSpacing: '0.5px',
  },

  mobileTitleBar: {
    display: 'none',

    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing(0.5),
      padding: '8px 14px',
      background: 'rgba(26, 35, 126, 0.08)',
      backdropFilter: 'blur(10px)',
      borderLeft: '1px solid rgba(26, 35, 126, 0.15)',
      borderRight: '1px solid rgba(26, 35, 126, 0.15)',
      borderBottom: '1px solid rgba(26, 35, 126, 0.15)',
      borderRadius: '0 0 12px 12px',
      marginBottom: theme.spacing(1),
    },
  },

  mobileTitleText: {
    fontSize: '0.875rem',
    color: '#2d3a8c',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'center' as const,
    flex: 1,
    minWidth: 0,
  },

  // Header (desktop)
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1.5),
    gap: theme.spacing(1),
    padding: '14px 20px',
    background: 'linear-gradient(135deg, #1a237e 0%, #283593 40%, #1565c0 80%, #1976d2 100%)',
    color: theme.palette.common.white,
    borderRadius: '20px',
    boxShadow: '0 8px 32px rgba(26, 35, 126, 0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
    position: 'relative' as const,
    overflow: 'hidden',

    '&::before': {
      content: '""',
      position: 'absolute',
      top: '-50%',
      right: '-5%',
      width: '300px',
      height: '300px',
      background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
      pointerEvents: 'none',
    },

    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },

  headerCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(1),
    flex: 1,
    flexWrap: 'wrap' as const,
  },

  callerAvatar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
    color: '#fff',
    fontSize: '0.875rem',
    fontWeight: 700,
    letterSpacing: '0.5px',
    flexShrink: 0,
    textTransform: 'uppercase' as const,
    cursor: 'pointer',
    overflow: 'hidden',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.4)',
    '&:hover': {
      transform: 'scale(1.15)',
      boxShadow: '0 4px 16px rgba(25, 118, 210, 0.6)',
    },
    '& img': {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
  },

  callerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
  },

  mobileCallerAvatar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 26,
    height: 26,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)',
    color: '#fff',
    fontSize: '0.875rem',
    fontWeight: 700,
    letterSpacing: '0.5px',
    flexShrink: 0,
    textTransform: 'uppercase' as const,
    boxShadow: '0 2px 6px rgba(25, 118, 210, 0.3)',
  },

  headerNavButton: {
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '50%',
    color: 'inherit',
    transition: 'background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
    backdropFilter: 'blur(10px)',
    '&:hover': {
      background: 'rgba(255,255,255,0.28)',
      transform: 'scale(1.12)',
      boxShadow: '0 0 12px rgba(255,255,255,0.3)',
    },
  },

  headerIcon: {
    color: 'rgba(255,255,255,0.85)',
    padding: '4px',
    transition: 'transform 0.2s ease, color 0.2s ease',
    '&:hover': {
      transform: 'scale(1.2)',
      color: '#fff',
    },
  },

  // NavButton disabled state
  navButtonDisabled: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'no-drop',
    padding: '4px',
    borderRadius: '50%',
    opacity: 0.4,
  },

  // Incident number badge in desktop header
  headerIncidentNumber: {
    fontSize: '1rem',
    color: 'inherit',
    letterSpacing: '0.5px',
    fontFamily: '"Roboto Mono", monospace',
    background: 'rgba(255,255,255,0.15)',
    padding: '2px 10px',
    borderRadius: '8px',
    whiteSpace: 'nowrap' as const,
    fontWeight: 800,
  },

  // Small copy icon button inside header
  headerSmallIconButton: {
    padding: '2px',
    color: 'rgba(255,255,255,0.85)',
    '&:hover': {
      color: '#fff',
      transform: 'scale(1.2)',
    },
  },

  // Mobile draft expiry timer (below mobile header bar)
  mobileDraftTimer: {
    display: 'none',

    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing(0.75),
      marginBottom: theme.spacing(1),
      padding: theme.spacing(0.75, 1.5),
      background: `linear-gradient(135deg, ${theme.palette.warning.light}40, ${theme.palette.warning.light}20)`,
      border: `1px solid ${theme.palette.warning.main}`,
      borderRadius: '12px',
      boxShadow: `0 2px 12px ${theme.palette.warning.main}25`,
      width: '100%',
    },
  },

  mobileDraftTimerExpired: {
    [theme.breakpoints.down('sm')]: {
      background: `linear-gradient(135deg, ${theme.palette.error.light}40, ${theme.palette.error.light}20)`,
      border: `1px solid ${theme.palette.error.main}`,
      boxShadow: `0 2px 12px ${theme.palette.error.main}25`,
    },
  },

  // Sub-header info row (compact cards)
  infoRow: {
    display: 'flex',
    alignItems: 'stretch',
    marginBottom: theme.spacing(1.5),
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0,0,0,0.04)',
    overflow: 'hidden',
    border: '1px solid rgba(226, 232, 255, 0.8)',

    [theme.breakpoints.down('md')]: {
      flexWrap: 'wrap' as const,
    },

    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column' as const,
      borderRadius: '12px',
    },
  },

  infoItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: theme.spacing(0.5),
    flex: 1,
    padding: '12px 16px',
    borderRight: '1px solid rgba(226, 232, 255, 0.9)',
    minWidth: 0,
    transition: 'background 0.2s ease',

    '&:hover': {
      background: 'rgba(99, 102, 241, 0.04)',
    },

    '&:last-child': {
      borderRight: 'none',
    },

    [theme.breakpoints.down('md')]: {
      flex: '1 1 calc(50% - 1px)',
      borderBottom: '1px solid rgba(226, 232, 255, 0.9)',
    },

    [theme.breakpoints.down('sm')]: {
      flex: '1 1 100%',
      borderRight: 'none',
      borderBottom: '1px solid rgba(226, 232, 255, 0.9)',
      padding: '10px 14px',
      flexDirection: 'row' as const,
      justifyContent: 'space-between',
      alignItems: 'center',
      '&:last-child': {
        borderBottom: 'none',
      },
    },
  },

  infoLabel: {
    fontSize: '0.68rem',
    color: '#6366f1',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.8px',
    whiteSpace: 'nowrap' as const,
  },

  infoValue: {
    fontSize: '0.875rem',
    color: '#1e293b',
    fontWeight: 600,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    maxWidth: '100%',
  },

  // InfoRow: caller avatar box
  infoCallerBox: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
  },

  // InfoRow: ETA edit icon
  etaEditIcon: {
    fontSize: '0.875rem',
    color: '#999',
    opacity: 0,
    transition: 'opacity 0.2s',
  },

  // InfoRow: ETA text field
  etaTextField: {
    maxWidth: 130,
    '& .MuiInputBase-root': { height: 28 },
  },

  // InfoRow: caller value text
  infoCallerText: {
    fontSize: '0.8rem',
    color: '#1e293b',
    fontWeight: 600,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    maxWidth: 90,
    minWidth: 0,
  },

  // SLA progress bar
  slaBar: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    width: '100%',
    minWidth: 80,

    [theme.breakpoints.down('sm')]: {
      justifyContent: 'flex-end',
      maxWidth: 160,
    },
  },

  slaProgress: {
    flex: 1,
    height: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    '& .MuiLinearProgress-bar': {
      borderRadius: 8,
    },

    [theme.breakpoints.down('sm')]: {
      height: 6,
    },
  },

  slaPercent: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: '#1e293b',
    whiteSpace: 'nowrap' as const,
    minWidth: 36,
    textAlign: 'right' as const,
  },

  // Action buttons (stunning toolbar)
  actionButtonsRow: {
    display: 'flex',
    alignItems: 'stretch',
    marginBottom: theme.spacing(1.5),
    padding: '6px 8px',
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0,0,0,0.04)',
    border: '1px solid rgba(226, 232, 255, 0.8)',
    overflowX: 'auto' as const,
    overflowY: 'hidden' as const,
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'none' as const,
    gap: '4px',

    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },

  actionButton: {
    flex: '0 0 auto',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 10px',
    gap: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    borderRadius: '12px',
    minWidth: 64,
    position: 'relative' as const,
    overflow: 'hidden',

    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      borderRadius: '12px',
      background: 'transparent',
      transition: 'background 0.2s ease',
    },

    '&:hover': {
      transform: 'translateY(-2px)',
      background: 'rgba(99, 102, 241, 0.07)',
      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)',
    },

    '&:active': {
      transform: 'translateY(0)',
      background: 'rgba(99, 102, 241, 0.12)',
    },

    [theme.breakpoints.up('xl')]: {
      flex: 1,
    },

    [theme.breakpoints.down('sm')]: {
      padding: '6px 8px',
      gap: '3px',
      minWidth: 52,
      minHeight: 52,

      '& .MuiIconButton-root': {
        width: 28,
        height: 28,
        padding: '2px',
      },
      '& .MuiSvgIcon-root': {
        fontSize: '1.25rem !important' as CSSObject['fontSize'],
      },
    },
  },

  actionLabel: {
    fontSize: '0.7rem',
    lineHeight: 1.2,
    color: '#475569',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
    textAlign: 'center' as const,
    letterSpacing: '0.2px',

    [theme.breakpoints.down('sm')]: {
      fontSize: '0.6rem',
    },
  },

  // ActionBar: icon pill (colored icon background)
  iconPill: {
    width: 36,
    height: 36,
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.15s ease',
    '.actionButton:hover &': {
      transform: 'scale(1.08)',
    },
  },

  // Timer
  timerContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    flexShrink: 0,
  },

  timerDisplay: {
    fontFamily: '"Roboto Mono", monospace',
    fontSize: '1rem',
    fontWeight: 700,
    minWidth: 70,
    color: '#1e293b',
    letterSpacing: '0.5px',
  },

  timerIconButton: {
    padding: '3px',
  },

  // Draft expiry timer badge (desktop only, below header row)
  draftTimerBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(0.75),
    padding: theme.spacing(1, 2),
    marginBottom: theme.spacing(1.5),
    background: `linear-gradient(135deg, ${theme.palette.warning.light}35, ${theme.palette.warning.light}15)`,
    border: `1px solid ${theme.palette.warning.main}60`,
    borderRadius: '12px',
    boxShadow: `0 2px 12px ${theme.palette.warning.main}20`,
    width: '100%',

    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },

  draftTimerExpired: {
    background: `linear-gradient(135deg, ${theme.palette.error.light}35, ${theme.palette.error.light}15)`,
    border: `1px solid ${theme.palette.error.main}60`,
    boxShadow: `0 2px 12px ${theme.palette.error.main}20`,
  },

  // Header title (pipe separator + truncated title)
  headerTitle: {
    fontSize: '1.05rem',
    color: 'rgba(255,255,255,0.95)',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 340,
    letterSpacing: '0.2px',

    [theme.breakpoints.down('md')]: {
      maxWidth: 180,
    },
  },

  headerPipeSeparator: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '1.1rem',
    margin: '0 4px',
    userSelect: 'none' as const,
  },

  // Support plan note + Timer/Summary row
  noteAndTimerRow: {
    display: 'flex',
    alignItems: 'stretch',
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(1.5),

    // Stack vertically on anything below full desktop (< 1280px)
    [theme.breakpoints.down('lg')]: {
      flexDirection: 'column' as const,
      gap: theme.spacing(1),
    },
  },

  supportPlanNote: {
    flex: 1,
    padding: '14px 18px',
    background: 'linear-gradient(135deg, #fffde7 0%, #fff8e1 100%)',
    border: '1px solid #ffe082',
    borderRadius: '14px',
    fontSize: '0.8rem',
    lineHeight: 1.6,
    color: '#4a3728',
    boxShadow: '0 2px 12px rgba(255, 193, 7, 0.12)',
    borderLeft: '4px solid #f59e0b',

    '& strong': {
      display: 'block',
      fontSize: '0.85rem',
      color: '#b45309',
      marginBottom: '6px',
      fontWeight: 700,
      letterSpacing: '0.3px',
    },

    '& ul': {
      margin: '4px 0 0 0',
      paddingLeft: '16px',
    },

    '& li': {
      marginBottom: '3px',
    },

    [theme.breakpoints.down('md')]: {
      padding: '12px 14px',
      fontSize: '0.78rem',
      lineHeight: 1.55,
      '& strong': {
        fontSize: '0.82rem',
        marginBottom: '4px',
      },
      '& li': {
        marginBottom: '2px',
      },
    },

    [theme.breakpoints.down('sm')]: {
      padding: '10px 12px',
      fontSize: '0.75rem',
      lineHeight: 1.5,
      '& strong': {
        fontSize: '0.8rem',
      },
      '& ul': {
        paddingLeft: '14px',
      },
    },
  },

  // Time Summary card
  timerAndSummaryRow: {
    display: 'flex',
    flexDirection: 'column' as const,
    flexShrink: 0,
    border: '1px solid rgba(226, 232, 255, 0.8)',
    borderRadius: '14px',
    backgroundColor: theme.palette.background.paper,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
    overflow: 'hidden',
  },

  timeSummaryHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    background: 'linear-gradient(135deg, #f8faff 0%, #eef2ff 100%)',
    borderBottom: '1px solid rgba(226, 232, 255, 0.9)',
    flexWrap: 'wrap' as const,
    gap: theme.spacing(0.75),
  },

  timeSummaryHeading: {
    fontSize: '0.8rem',
    fontWeight: 800,
    color: '#4338ca',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.8px',
  },

  // Time Summary 2×2 grid cells
  timeSummaryWrap: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    borderTop: '1px solid rgba(226,232,255,0.9)',
  },

  timeSummaryCell: {
    flex: '1 1 calc(50% - 1px)',
    padding: '8px 12px',
    borderRight: '1px solid rgba(226,232,255,0.9)',
    borderBottom: '1px solid rgba(226,232,255,0.9)',
    minWidth: 0,
    '&:nth-of-type(2n)': { borderRight: 'none' },
    '&:nth-last-of-type(-n+2)': { borderBottom: 'none' },
  },

  timeSummaryCellLabel: {
    fontSize: '0.6rem',
    color: '#6366f1',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.7px',
    marginBottom: '2px',
    whiteSpace: 'nowrap' as const,
  },

  timeSummaryCellValue: {
    fontSize: '0.82rem',
    fontWeight: 700,
    color: '#1e293b',
    whiteSpace: 'nowrap' as const,
    lineHeight: 1.3,
  },

  timeSummaryCellSub: {
    fontSize: '0.58rem',
    color: '#94a3b8',
    fontWeight: 500,
    marginTop: '1px',
  },

  // ETA editable field
  etaEditable: {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 6px',
    borderRadius: '8px',
    transition: 'background 0.2s ease',
    '&:hover': {
      background: 'rgba(99, 102, 241, 0.08)',
      textDecoration: 'underline',
    },
    '&:hover .eta-edit-icon': {
      opacity: 1,
    },
  },

  // Description Section
  descriptionCard: {
    marginBottom: theme.spacing(1.5),
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
    border: '1px solid rgba(226,232,255,0.8)',
    overflow: 'hidden',
  },

  descriptionCardHeader: {
    padding: '10px 16px',
    background: 'linear-gradient(135deg, #f8faff 0%, #eef2ff 100%)',
    borderBottom: '1px solid rgba(226,232,255,0.9)',
  },

  descriptionSectionTitle: {
    fontWeight: 800,
    fontSize: '0.78rem',
    color: '#4338ca',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.8px',
  },

  descriptionCardBody: {
    padding: theme.spacing(2),
  },

  descriptionShortTitle: {
    fontWeight: 700,
    fontSize: '0.9rem',
    marginBottom: theme.spacing(0.75),
    color: '#1e293b',
    lineHeight: 1.5,
  },

  descriptionBodyText: {
    fontSize: '0.875rem',
    color: '#64748b',
    lineHeight: 1.7,
  },

  descriptionTextField: {
    marginBottom: theme.spacing(1.5),
    '& .MuiOutlinedInput-root': { borderRadius: '10px' },
  },

  descriptionDescField: {
    '& .MuiOutlinedInput-root': { borderRadius: '10px' },
  },

  // Tabs Section
  tabsSectionCard: {
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
    border: '1px solid rgba(226,232,255,0.8)',
    overflow: 'hidden',
    marginTop: theme.spacing(1.5),
  },

  tabsPanelContent: {
    padding: theme.spacing(2),
  },

  tabPanel: {
    padding: '8px 0',
  },

  tabsUpdateCard: {
    marginBottom: theme.spacing(1.5),
    padding: theme.spacing(2),
    borderRadius: '12px',
    border: '1px solid rgba(226,232,255,0.8)',
  },

  tabsUpdateCardExternal: {
    background: 'linear-gradient(135deg, #f8faff 0%, #ffffff 100%)',
    borderLeft: '4px solid #6366f1',
  },

  tabsUpdateCardInternal: {
    background: 'linear-gradient(135deg, #fffde7 0%, #fff8e1 100%)',
    borderLeft: '4px solid #f59e0b',
  },

  tabsUpdateCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(0.75),
    flexWrap: 'wrap' as const,
    gap: theme.spacing(1),
  },

  tabsUpdateCardSubject: {
    fontWeight: 700,
    fontSize: '0.875rem',
    color: '#1e293b',
  },

  tabsUpdateCardTime: {
    fontSize: '0.75rem',
    color: '#94a3b8',
  },

  tabsUpdateCardMessage: {
    fontSize: '0.875rem',
    color: '#334155',
    lineHeight: 1.6,
  },

  tabsUpdateCardBy: {
    display: 'block',
    marginTop: theme.spacing(0.75),
    fontSize: '0.75rem',
    color: '#94a3b8',
    fontWeight: 500,
  },

  tabsAttachmentItem: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: '10px 14px',
    marginBottom: theme.spacing(0.75),
    borderRadius: '10px',
    border: '1px solid rgba(226,232,255,0.9)',
    background: '#f8faff',
    transition: 'background 0.2s ease',
    '&:hover': { background: '#eef2ff' },
  },

  tabsAttachmentText: {
    fontSize: '0.875rem',
    color: '#4338ca',
    fontWeight: 500,
  },

  tabsResolutionCard: {
    marginBottom: theme.spacing(1.5),
    padding: theme.spacing(2),
    borderRadius: '12px',
    border: '1px solid rgba(226,232,255,0.8)',
    background: 'linear-gradient(135deg, #f0fdf4 0%, #f8faff 100%)',
    borderLeft: '4px solid #22c55e',
  },

  tabsResolutionMeta: {
    display: 'flex',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(0.75),
    flexWrap: 'wrap' as const,
  },

  tabsResolutionMetaLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.4px',
  },

  tabsResolutionText: {
    fontSize: '0.875rem',
    marginBottom: theme.spacing(0.75),
    color: '#1e293b',
    lineHeight: 1.6,
  },

  tabsResolutionRootCause: {
    fontSize: '0.8rem',
    color: '#64748b',
    marginBottom: theme.spacing(0.5),
  },

  tabsResolutionBy: {
    display: 'block',
    fontSize: '0.75rem',
    color: '#94a3b8',
    fontWeight: 500,
  },

  tabsResolutionNotesText: {
    fontSize: '0.875rem',
    color: '#334155',
    lineHeight: 1.7,
  },

  tabsActivityList: {
    position: 'relative' as const,
  },

  tabsActivityItem: {
    display: 'flex',
    gap: theme.spacing(2),
    paddingBottom: theme.spacing(1.5),
    paddingTop: theme.spacing(1.5),
    borderBottom: '1px solid rgba(226,232,255,0.8)',
    '&:first-of-type': { paddingTop: 0 },
    '&:last-of-type': { borderBottom: 'none' },
  },

  tabsActivityDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4338ca, #6366f1)',
    flexShrink: 0,
    marginTop: theme.spacing(0.75),
    boxShadow: '0 0 0 3px rgba(99,102,241,0.15)',
  },

  tabsActivityContent: {
    flex: 1,
    minWidth: 0,
  },

  tabsActivityDescription: {
    fontSize: '0.875rem',
    color: '#1e293b',
    lineHeight: 1.5,
  },

  tabsActivityMeta: {
    display: 'flex',
    gap: theme.spacing(2),
    marginTop: theme.spacing(0.25),
    flexWrap: 'wrap' as const,
  },

  tabsActivityMetaText: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    fontWeight: 500,
  },

  tabsEmptyText: {
    fontSize: '0.875rem',
    color: '#94a3b8',
    padding: '16px 0',
    textAlign: 'center' as const,
  },

  // Main layout
  mainLayout: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(1.5),

    [theme.breakpoints.down('md')]: {
      flexDirection: 'column' as const,
      gap: 0,
    },
  },

  // Left sidebar
  sidebar: {
    position: 'sticky' as const,
    top: theme.spacing(2),
    alignSelf: 'flex-start',
    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'visible',
    flexShrink: 0,

    // On mobile: disable sticky so the sidebar stays in document flow
    // and never floats over the content below when scrolling
    [theme.breakpoints.down('md')]: {
      position: 'relative' as const,
      top: 'auto',
      alignSelf: 'auto',
      transition: 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
      width: '100% !important' as CSSObject['width'],
    },
  },

  sidebarExpanded: {
    width: 300,

    [theme.breakpoints.down('md')]: {
      maxHeight: 9999,
      opacity: 1,
    },
  },

  sidebarCollapsed: {
    width: 44,

    [theme.breakpoints.down('md')]: {
      width: '100% !important' as CSSObject['width'],
      maxHeight: 0,
      opacity: 0,
      overflow: 'hidden',
      pointerEvents: 'none' as const,
    },
  },

  sidebarToggleButton: {
    position: 'absolute' as const,
    top: 6,
    zIndex: 10,
    padding: theme.spacing(0.5),
    color: theme.palette.common.white,
    background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
    borderRadius: '50%',
    minWidth: 32,
    minHeight: 32,
    transition: 'transform 0.15s ease',
    boxShadow: '0 2px 8px rgba(67, 56, 202, 0.4)',
    '&:hover': {
      transform: 'scale(1.15)',
    },

    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
  },

  sidebarContent: {
    background: '#ffffff',
    width: 300,
    padding: '14px',
    paddingTop: '52px',
    borderRadius: '16px',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 4px rgba(0,0,0,0.04)',
    border: '1px solid rgba(226, 232, 255, 0.8)',

    [theme.breakpoints.down('md')]: {
      width: '100%',
      paddingTop: '14px',
      borderRadius: '14px',
      marginBottom: theme.spacing(1.5),
    },
  },

  sidebarField: {
    marginBottom: '12px',
  },

  // Right content area — flex: 1 auto-stretches as sidebar opens/closes
  contentArea: {
    flex: 1,
    minWidth: 0,
    transition: 'flex 0.3s cubic-bezier(0.4, 0, 0.2, 1)',

    [theme.breakpoints.down('md')]: {
      paddingLeft: 0,
      width: '100%',
    },
  },

  // Section styles
  section: {
    marginBottom: theme.spacing(2),
  },

  sectionTitle: {
    fontWeight: 700,
    fontSize: '0.8rem',
    marginBottom: theme.spacing(0.75),
    color: '#4338ca',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.8px',
  },

  fieldLabel: {
    fontWeight: 700,
    fontSize: '0.7rem',
    color: '#6366f1',
    marginBottom: theme.spacing(0.25),
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },

  fieldValue: {
    fontSize: '0.875rem',
    color: '#1e293b',
    fontWeight: 500,
  },

  // ── Mobile toggle row (Ticket Info / Details) ──────────────────────────
  mobileToggleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1),
    padding: '9px 16px',
    borderRadius: '12px',
    border: '1px solid rgba(99, 102, 241, 0.22)',
    background: '#ffffff',
    cursor: 'pointer',
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
    transition: 'all 0.22s ease',
    userSelect: 'none' as const,
    '&:active': { transform: 'scale(0.98)' },
  },

  mobileToggleRowOpen: {
    background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
  },

  mobileToggleLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },

  mobileToggleRight: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },

  mobileToggleDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#cbd5e1',
    transition: 'background 0.22s ease',
    flexShrink: 0,
  },

  mobileToggleDotOpen: {
    background: 'linear-gradient(135deg, #6366f1, #818cf8)',
    boxShadow: '0 0 0 3px rgba(99,102,241,0.2)',
  },

  mobileToggleLabel: {
    fontSize: '0.72rem',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.6px',
    transition: 'color 0.22s ease',
  },

  mobileToggleLabelOpen: {
    color: '#4338ca',
  },

  mobileToggleAction: {
    fontSize: '0.68rem',
    fontWeight: 700,
    color: '#94a3b8',
    transition: 'color 0.22s ease',
  },

  mobileToggleActionOpen: {
    color: '#6366f1',
  },

  mobileToggleIcon: {
    fontSize: '1rem',
    color: '#94a3b8',
    transition: 'transform 0.3s ease, color 0.22s ease',
  },

  mobileToggleIconOpen: {
    transform: 'rotate(180deg)',
    color: '#6366f1',
  },

  // Mobile timer row wrapper (adds bottom margin)
  mobileTimerWrapper: {
    marginBottom: theme.spacing(1.5),
  },
});
