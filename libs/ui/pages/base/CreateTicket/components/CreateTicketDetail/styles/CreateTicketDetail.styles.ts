import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()((theme) => ({
  formContainer: {
    '& .MuiFormLabel-asterisk': { color: theme.palette.error.main },
    '& .MuiInputLabel-asterisk': { color: theme.palette.error.main },
  },

  pageHeader: {
    marginBottom: theme.spacing(2.5),
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: theme.spacing(2.5, 3),
    position: 'relative',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 4,
      backgroundColor: '#2563eb',
      borderTopLeftRadius: 12,
      borderBottomLeftRadius: 12,
    },
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
      borderRadius: 8,
    },
  },

  // ── Section card ─────────────────────────────────────────────────────────
  sectionCard: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: 14,
    borderLeft: '4px solid',
    borderLeftColor: theme.palette.primary.main,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    marginBottom: theme.spacing(2.5),
    overflow: 'hidden',
  },

  sectionCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.5, 2.5),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },

  sectionIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 9,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  sectionCardTitle: {
    fontWeight: 700,
    fontSize: '0.95rem',
    letterSpacing: '0.1px',
  },

  sectionCardBody: {
    padding: theme.spacing(2.5, 3),
    [theme.breakpoints.down('sm')]: { padding: theme.spacing(2) },
  },

  // ── Form grid ────────────────────────────────────────────────────────────
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: theme.spacing(2),
    [theme.breakpoints.down('md')]: { gridTemplateColumns: 'repeat(2, 1fr)' },
    [theme.breakpoints.down('sm')]: { gridTemplateColumns: '1fr' },
  },

  fullWidth: { gridColumn: '1 / -1' },

  // ── Action buttons bar ───────────────────────────────────────────────────
  buttonContainer: {
    display: 'flex',
    gap: theme.spacing(1.5),
    marginTop: theme.spacing(2),
    justifyContent: 'flex-end',
    flexWrap: 'wrap' as const,
    padding: theme.spacing(2.5, 3),
    backgroundColor: theme.palette.background.paper,
    borderRadius: 14,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    '& .MuiButton-root': {
      textTransform: 'none',
      borderRadius: 8,
      padding: theme.spacing(0.875, 2.5),
      fontSize: '0.875rem',
      fontWeight: 600,
    },
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column' as const,
      '& .MuiButton-root': { width: '100%' },
    },
  },

  attachedFilesTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(1),
    fontSize: '0.875rem',
  },

  attachedFilesList: { marginTop: theme.spacing(2) },

  // ── Manual caller section ────────────────────────────────────────────────
  manualCallerSection: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },

  manualCallerFields: {
    marginTop: theme.spacing(1.5),
    padding: theme.spacing(2.5),
    background: `linear-gradient(135deg, ${theme.palette.primary.main}06 0%, ${theme.palette.primary.main}0a 100%)`,
    borderRadius: 10,
    border: `1px solid ${theme.palette.primary.main}25`,
  },

  updateButtonRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(2),
    '& .MuiButton-root': { fontWeight: 600, padding: theme.spacing(0.75, 3) },
  },

  checkboxRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    flexWrap: 'wrap' as const,
  },

  // ── Timeline section ────────────────────────────────────────────────────────
  timelineContainer: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 14,
    backgroundColor: theme.palette.background.paper,
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },

  timelineHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1.5, 2.5),
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.action.hover,
  },

  timelineHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },

  timelineHeaderIcon: {
    fontSize: 20,
    color: theme.palette.primary.main,
  },

  timelineHeaderTitle: {
    fontSize: '0.95rem',
    fontWeight: 700,
    color: theme.palette.text.primary,
  },

  timelineHeaderCount: {
    fontSize: '0.72rem',
    fontWeight: 700,
    color: '#fff',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '10px',
    padding: theme.spacing(0.125, 0.8),
    minWidth: '20px',
    textAlign: 'center',
    lineHeight: '1.6',
  },

  timelineHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },

  timelineCollapseBtn: {
    width: 28,
    height: 28,
    color: theme.palette.text.secondary,
    '&:hover': {
      backgroundColor: theme.palette.action.selected,
    },
  },

  // Action buttons row
  timelineActionRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    padding: theme.spacing(1.5, 2.5, 0.75),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },

  // Filter row
  timelineFilterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1, 2.5, 1),
    borderBottom: `1px solid ${theme.palette.divider}`,
    flexWrap: 'wrap',
  },

  timelineSearchBox: {
    flex: '0 0 auto',
  },

  timelineToggleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    marginLeft: 'auto',
  },

  // Content area
  timelineContent: {
    maxHeight: '500px',
    overflowY: 'auto',
    padding: theme.spacing(0, 0.5),
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-track': {
      background: theme.palette.action.hover,
    },
    '&::-webkit-scrollbar-thumb': {
      background: theme.palette.action.disabled,
      borderRadius: '3px',
    },
  },

  timelineEmpty: {
    padding: theme.spacing(4, 2),
    textAlign: 'center',
  },

  timelineEmptyText: {
    fontSize: '0.85rem',
    color: theme.palette.text.disabled,
  },
}));
