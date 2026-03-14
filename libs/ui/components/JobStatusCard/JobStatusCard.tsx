import React from 'react';
import { Box, Card, CardContent, Typography, Chip, LinearProgress } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ScheduleIcon from '@mui/icons-material/Schedule';
import {
  IJob,
  JobStatus,
  JobPriority,
  JOB_STATUS_CONFIG,
  JOB_PRIORITY_COLORS,
} from '@picks/interfaces';
import { useStyles } from './styles';

/**
 * JobStatusCard Props
 * Extends IJob interface from shared interfaces
 *
 * This is a "dumb" component - it just receives props and renders
 * No business logic, no data fetching
 */
export interface JobStatusCardProps extends IJob {
  onAction?: (id: string, action: 'view' | 'edit' | 'delete') => void;
}

// Re-export types for convenience
export type { JobStatus, JobPriority };

/**
 * Icon mapping for status
 */
const statusIcons: Record<JobStatus, React.ElementType> = {
  needs_attention: WarningIcon,
  in_progress: AutorenewIcon,
  completed: CheckCircleIcon,
  failed: ErrorIcon,
  pending: ScheduleIcon,
};

/**
 * JobStatusCard Component
 *
 * A pure UI component that displays job status information.
 * - No business logic
 * - No data fetching
 * - Just renders based on props
 * - Uses shared interfaces from @picks/interfaces
 *
 * This makes it easy to:
 * - Test in Storybook with different mock data
 * - Swap out for different themes/tenants
 * - Unit test without mocking complex dependencies
 */
export const JobStatusCard: React.FC<JobStatusCardProps> = ({
  id,
  title,
  description,
  status,
  priority,
  assignee,
  progress,
  dueDate,
  onAction,
}) => {
  const config = JOB_STATUS_CONFIG[status];
  const StatusIcon = statusIcons[status];
  const priorityColor = JOB_PRIORITY_COLORS[priority];

  const { classes } = useStyles({
    statusColor: config.color,
    statusBgColor: config.bgColor,
    priorityColor: priorityColor,
    hasAction: !!onAction,
  });

  return (
    <Card className={classes.card} onClick={() => onAction?.(id, 'view')}>
      <CardContent>
        {/* Header Row */}
        <Box className={classes.headerRow}>
          <Typography variant="h6" component="h3" className={classes.title}>
            {title}
          </Typography>
          <Box className={classes.chipContainer}>
            <Chip
              size="small"
              label={priority.toUpperCase()}
              className={classes.priorityChip}
            />
          </Box>
        </Box>

        {/* Description */}
        <Typography variant="body2" color="text.secondary" className={classes.description}>
          {description}
        </Typography>

        {/* Progress Bar (if in progress) */}
        {status === 'in_progress' && progress !== undefined && (
          <Box className={classes.progressContainer}>
            <Box className={classes.progressHeader}>
              <Typography variant="caption" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              className={classes.progressBar}
            />
          </Box>
        )}

        {/* Footer Row */}
        <Box className={classes.footerRow}>
          {/* Status Badge */}
          <Box className={classes.statusBadge}>
            <StatusIcon className={classes.statusIcon} />
            <Typography variant="caption" className={classes.statusLabel}>
              {config.label}
            </Typography>
          </Box>

          {/* Meta Info */}
          <Box className={classes.metaInfo}>
            <Typography variant="caption" color="text.secondary">
              Assignee: <strong>{assignee}</strong>
            </Typography>
            {dueDate && (
              <Typography variant="caption" color="text.secondary">
                Due: {new Date(dueDate).toLocaleDateString()}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default JobStatusCard;
