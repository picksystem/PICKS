import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export interface JobStatusCardStyleParams {
  statusColor: string;
  statusBgColor: string;
  priorityColor: string;
  hasAction: boolean;
}

export const getBaseStyles = (
  theme: Theme,
  params: JobStatusCardStyleParams
): Record<string, CSSObject> => ({
  card: {
    marginBottom: theme.spacing(2),
    borderLeft: `4px solid ${params.statusColor}`,
    '&:hover': {
      boxShadow: theme.shadows[3],
      cursor: params.hasAction ? 'pointer' : 'default',
    },
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing(1),
  },
  title: {
    fontWeight: 600,
  },
  chipContainer: {
    display: 'flex',
    gap: theme.spacing(1),
  },
  priorityChip: {
    backgroundColor: params.priorityColor,
    color: 'white',
    fontWeight: 600,
    fontSize: '0.7rem',
  },
  description: {
    marginBottom: theme.spacing(2),
  },
  progressContainer: {
    marginBottom: theme.spacing(2),
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(0.5),
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e0e0e0',
    '& .MuiLinearProgress-bar': {
      backgroundColor: params.statusColor,
    },
  },
  footerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    backgroundColor: params.statusBgColor,
    color: params.statusColor,
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5),
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    borderRadius: theme.spacing(1),
  },
  statusIcon: {
    fontSize: 16,
  },
  statusLabel: {
    fontWeight: 600,
  },
  metaInfo: {
    display: 'flex',
    gap: theme.spacing(2),
    alignItems: 'center',
  },
});
