import {
  Box,
  CheckIcon,
  AssignmentIndIcon,
  CommentIcon,
  CheckCircleIcon,
  AccessTimeIcon,
  BookmarkIcon,
  AttachFileIcon,
  TimelineIcon,
  MoreHorizIcon,
  SaveIcon,
  CloseIcon,
  ScheduleIcon,
  EditIcon,
  IconButton,
} from '../../../../components';
import { Typography } from '@mui/material';
import { ActionButtonConfig } from '../types/incidentDetail.types';

interface ActionBarProps {
  classes: Record<string, string>;
  isEditing: boolean;
  onEdit: () => void;
  onAccept: () => void;
  onAssign: () => void;
  onComment: () => void;
  onResolve: () => void;
  onTimeEntry: () => void;
  onFollow: () => void;
  onAttachment: () => void;
  onActivity: () => void;
  onReviewLater: () => void;
  onMoreTools: (e: React.MouseEvent<HTMLElement>) => void;
  onSave: () => void;
  onSaveAndClose: () => void;
  onCancelEdit: () => void;
  onPriorityChange: () => void;
}

const iconSx = { fontSize: '1.5rem' };

// Icon pill: pass color via style prop for dynamic background; structural styles from className
const IconPill = ({
  color,
  children,
  classes,
}: {
  color: string;
  children: React.ReactNode;
  classes: Record<string, string>;
}) => (
  <Box className={classes.iconPill} style={{ background: `${color}18` } as React.CSSProperties}>
    {children}
  </Box>
);

const ActionBar = ({
  classes,
  isEditing,
  onEdit,
  onAccept,
  onAssign,
  onComment,
  onResolve,
  onTimeEntry,
  onFollow,
  onAttachment,
  onActivity,
  onReviewLater,
  onMoreTools,
  onSave,
  onSaveAndClose,
  onCancelEdit,
}: ActionBarProps) => {
  const viewModeButtons: ActionButtonConfig[] = [
    {
      icon: (
        <IconPill color='#1976d2' classes={classes}>
          <EditIcon sx={{ ...iconSx, color: '#1976d2' }} />
        </IconPill>
      ),
      label: 'Edit',
      onClick: onEdit,
    },
    {
      icon: (
        <IconPill color='#16a34a' classes={classes}>
          <CheckIcon sx={{ ...iconSx, color: '#16a34a' }} />
        </IconPill>
      ),
      label: 'Accept',
      onClick: onAccept,
    },
    {
      icon: (
        <IconPill color='#7c3aed' classes={classes}>
          <AssignmentIndIcon sx={{ ...iconSx, color: '#7c3aed' }} />
        </IconPill>
      ),
      label: 'Assign',
      onClick: onAssign,
    },
    {
      icon: (
        <IconPill color='#0284c7' classes={classes}>
          <CommentIcon sx={{ ...iconSx, color: '#0284c7' }} />
        </IconPill>
      ),
      label: 'Comment',
      onClick: onComment,
    },
    {
      icon: (
        <IconPill color='#059669' classes={classes}>
          <CheckCircleIcon sx={{ ...iconSx, color: '#059669' }} />
        </IconPill>
      ),
      label: 'Resolve',
      onClick: onResolve,
    },
    {
      icon: (
        <IconPill color='#d97706' classes={classes}>
          <AccessTimeIcon sx={{ ...iconSx, color: '#d97706' }} />
        </IconPill>
      ),
      label: 'Time Entry',
      onClick: onTimeEntry,
    },
    {
      icon: (
        <IconPill color='#ca8a04' classes={classes}>
          <BookmarkIcon sx={{ ...iconSx, color: '#ca8a04' }} />
        </IconPill>
      ),
      label: 'Follow',
      onClick: onFollow,
    },
    {
      icon: (
        <IconPill color='#78350f' classes={classes}>
          <AttachFileIcon sx={{ ...iconSx, color: '#92400e' }} />
        </IconPill>
      ),
      label: 'Attachment',
      onClick: onAttachment,
    },
    {
      icon: (
        <IconPill color='#0891b2' classes={classes}>
          <TimelineIcon sx={{ ...iconSx, color: '#0891b2' }} />
        </IconPill>
      ),
      label: 'Activity',
      onClick: onActivity,
    },
    {
      icon: (
        <IconPill color='#0d9488' classes={classes}>
          <ScheduleIcon sx={{ ...iconSx, color: '#0d9488' }} />
        </IconPill>
      ),
      label: 'Review Later',
      onClick: onReviewLater,
    },
    {
      icon: (
        <IconPill color='#475569' classes={classes}>
          <MoreHorizIcon sx={{ ...iconSx, color: '#475569' }} />
        </IconPill>
      ),
      label: 'More',
      onClick: onMoreTools,
    },
  ];

  const editModeButtons: ActionButtonConfig[] = [
    {
      icon: (
        <IconPill color='#16a34a' classes={classes}>
          <SaveIcon sx={{ ...iconSx, color: '#16a34a' }} />
        </IconPill>
      ),
      label: 'Save',
      onClick: onSave,
    },
    {
      icon: (
        <IconPill color='#1d4ed8' classes={classes}>
          <SaveIcon sx={{ ...iconSx, color: '#1d4ed8' }} />
        </IconPill>
      ),
      label: 'Save & Close',
      onClick: onSaveAndClose,
    },
    {
      icon: (
        <IconPill color='#059669' classes={classes}>
          <CheckCircleIcon sx={{ ...iconSx, color: '#059669' }} />
        </IconPill>
      ),
      label: 'Save & Resolve',
      onClick: () => {
        onSave();
        onResolve();
      },
    },
    {
      icon: (
        <IconPill color='#d97706' classes={classes}>
          <AccessTimeIcon sx={{ ...iconSx, color: '#d97706' }} />
        </IconPill>
      ),
      label: 'Save & Time',
      onClick: () => {
        onSave();
        onTimeEntry();
      },
    },
    {
      icon: (
        <IconPill color='#0284c7' classes={classes}>
          <CommentIcon sx={{ ...iconSx, color: '#0284c7' }} />
        </IconPill>
      ),
      label: 'Save & Comment',
      onClick: () => {
        onSave();
        onComment();
      },
    },
    {
      icon: (
        <IconPill color='#ca8a04' classes={classes}>
          <BookmarkIcon sx={{ ...iconSx, color: '#ca8a04' }} />
        </IconPill>
      ),
      label: 'Save & Follow',
      onClick: () => {
        onSave();
        onFollow();
      },
    },
    {
      icon: (
        <IconPill color='#92400e' classes={classes}>
          <AttachFileIcon sx={{ ...iconSx, color: '#92400e' }} />
        </IconPill>
      ),
      label: 'Attachment',
      onClick: onAttachment,
    },
    {
      icon: (
        <IconPill color='#0891b2' classes={classes}>
          <TimelineIcon sx={{ ...iconSx, color: '#0891b2' }} />
        </IconPill>
      ),
      label: 'Activity',
      onClick: onActivity,
    },
    {
      icon: (
        <IconPill color='#dc2626' classes={classes}>
          <CloseIcon sx={{ ...iconSx, color: '#dc2626' }} />
        </IconPill>
      ),
      label: 'Cancel Edit',
      onClick: onCancelEdit,
    },
  ];

  const buttons = isEditing ? editModeButtons : viewModeButtons;

  return (
    <Box className={classes.actionButtonsRow}>
      {buttons.map((btn) => (
        <Box
          key={btn.label}
          className={`${classes.actionButton} actionButton`}
          onClick={btn.onClick}
        >
          <IconButton size='small' disabled={btn.disabled} sx={{ padding: 0 }}>
            {btn.icon}
          </IconButton>
          <Typography className={classes.actionLabel}>{btn.label}</Typography>
        </Box>
      ))}
    </Box>
  );
};

export default ActionBar;
