import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export const getBaseStyles = (theme: Theme): Record<string, CSSObject> => ({
  sectionEmptyBox: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[50],
    borderRadius: theme.spacing(1.5),
    border: `1px dashed ${theme.palette.divider}`,
    textAlign: 'center' as const,
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
});
