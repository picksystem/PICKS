import { Box, Typography } from '@mui/material';

// Types matching the existing IAdminTicketActivity interface
export interface TimelineActivity {
  id: number;
  activityType: string;
  description: string;
  previousValue?: string | null;
  newValue?: string | null;
  performedBy: string;
  createdAt: Date;
  isSystem?: boolean;
  isEmail?: boolean;
  emailDetails?: {
    subject?: string;
    from?: string;
    to?: string;
  };
}

const AVATAR_COLORS = [
  '#4338ca',
  '#6366f1',
  '#7c3aed',
  '#059669',
  '#0891b2',
  '#d97706',
  '#dc2626',
  '#4f46e5',
  '#0d9488',
  '#9333ea',
];

const getAvatarColor = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

// Badge config for each activity type
type BadgeConfig = {
  label: string;
  bg: string;
  color: string;
  border: string;
};

const BADGE_CONFIG: Record<string, BadgeConfig> = {
  comment_added: { label: 'Comment', bg: '#4338ca', color: '#fff', border: '#4338ca' },
  internal_note: { label: 'Internal note', bg: '#4338ca', color: '#fff', border: '#4338ca' },
  self_note: { label: 'Self note', bg: '#6366f1', color: '#fff', border: '#6366f1' },
  notify_assignees: { label: 'Notify assignees', bg: '#d97706', color: '#fff', border: '#d97706' },
  field_update: { label: 'Field changes', bg: '#374151', color: '#fff', border: '#374151' },
  email_sent: { label: 'Email Sent', bg: '#0369a1', color: '#fff', border: '#0369a1' },
  status_change: { label: 'Status change', bg: '#0891b2', color: '#fff', border: '#0891b2' },
  priority_change: { label: 'Priority change', bg: '#059669', color: '#fff', border: '#059669' },
  assignment_change: {
    label: 'Assignment change',
    bg: '#7c3aed',
    color: '#fff',
    border: '#7c3aed',
  },
  attachment_added: { label: 'Attachment', bg: '#0d9488', color: '#fff', border: '#0d9488' },
  escalation: { label: 'Escalation', bg: '#dc2626', color: '#fff', border: '#dc2626' },
};

const getBadge = (activityType: string): BadgeConfig => {
  return (
    BADGE_CONFIG[activityType] || {
      label: activityType,
      bg: '#64748b',
      color: '#fff',
      border: '#64748b',
    }
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────

const s = {
  // System event card
  systemCard: {
    padding: '10px 12px',
    backgroundColor: '#fafafa',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    minHeight: '40px',
  },
  systemCardRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '1px 0',
  },
  systemLabelColumn: {
    flexShrink: 0,
    width: '56px',
    display: 'flex',
    alignItems: 'flex-start',
  },
  systemValueColumn: {
    flex: 1,
    minWidth: 0,
  },
  systemLabel: {
    fontSize: '0.84rem',
    color: '#6b7280',
    lineHeight: '1.7',
    whiteSpace: 'nowrap',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  systemValue: {
    fontSize: '0.84rem',
    color: '#1f2937',
    lineHeight: '1.7',
    fontWeight: 500,
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  systemDescription: {
    fontSize: '0.84rem',
    color: '#4b5563',
    lineHeight: '1.7',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  systemCardAction: {
    marginTop: '2px',
    paddingLeft: '0px',
  },
  showDetailsText: {
    fontSize: '0.78rem',
    color: '#3b82f6',
    cursor: 'pointer',
    fontWeight: 500,
    display: 'inline-block',
    padding: '2px 0',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },

  // Field change card
  fieldChangeCard: {
    borderBottom: '1px solid #e5e7eb',
    padding: '8px 12px',
    backgroundColor: '#fff',
  },
  fieldChangeRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
  },
  fieldChangeInfoCol: {
    flex: 1,
    minWidth: 0,
  },
  fieldChangeMetaCol: {
    flexShrink: 0,
  },
  fieldChangeLine: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '1px 0',
  },
  fieldChangeType: {
    fontSize: '0.78rem',
    color: '#6b7280',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },

  // Comment card
  commentCard: {
    borderBottom: '1px solid #f3f4f6',
    padding: '10px 0',
  },
  commentCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: '0.72rem',
    fontWeight: 700,
    color: '#fff',
    letterSpacing: '0.5px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  commentAuthorCol: {
    flex: 1,
    minWidth: 0,
  },
  commentAuthor: {
    fontSize: '0.84rem',
    fontWeight: 600,
    color: '#1f2937',
    lineHeight: 1.3,
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  commentBadgeCol: {
    flexShrink: 0,
  },
  commentBadge: {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: '12px',
    border: '1px solid',
    lineHeight: '1.6',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  commentBadgeText: {
    fontSize: '0.73rem',
    fontWeight: 600,
    color: '#fff',
    letterSpacing: '0.2px',
  },
  commentDateCol: {
    flexShrink: 0,
  },
  commentDate: {
    fontSize: '0.73rem',
    color: '#9ca3af',
    whiteSpace: 'nowrap',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  commentBody: {
    marginTop: '4px',
    paddingLeft: '36px',
  },
  commentText: {
    fontSize: '0.84rem',
    color: '#4b5563',
    lineHeight: '1.7',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
};

// ── Sub-components ─────────────────────────────────────────────────────────────

/** System / email event card (matches reference Image #1 and #3) */
export const SystemEventCard = ({ activity }: { activity: TimelineActivity }) => {
  const { description, createdAt, emailDetails, performedBy } = activity;

  if (activity.isEmail && emailDetails) {
    return (
      <Box sx={s.systemCard}>
        <Box sx={s.systemCardRow}>
          <Box sx={s.systemLabelColumn}>
            <Typography sx={s.systemLabel}>Subject:</Typography>
          </Box>
          <Box sx={s.systemValueColumn}>
            <Typography sx={s.systemValue}>{emailDetails.subject || description}</Typography>
          </Box>
        </Box>
        <Box sx={s.systemCardRow}>
          <Box sx={s.systemLabelColumn}>
            <Typography sx={s.systemLabel}>From:</Typography>
          </Box>
          <Box sx={s.systemValueColumn}>
            <Typography sx={s.systemValue}>{emailDetails.from || performedBy}</Typography>
          </Box>
        </Box>
        <Box sx={s.systemCardRow}>
          <Box sx={s.systemLabelColumn}>
            <Typography sx={s.systemLabel}>To:</Typography>
          </Box>
          <Box sx={s.systemValueColumn}>
            <Typography sx={s.systemValue}>{emailDetails.to || ''}</Typography>
          </Box>
        </Box>
        <Box sx={s.systemCardAction}>
          <Typography sx={s.showDetailsText}>Show email details</Typography>
        </Box>
      </Box>
    );
  }

  // Generic system event
  return (
    <Box sx={s.systemCard}>
      <Typography sx={s.systemDescription}>{description}</Typography>
    </Box>
  );
};

/** Field change event card (matches reference Image #1 bottom section) */
export const FieldChangeCard = ({ activity }: { activity: TimelineActivity }) => {
  return (
    <Box sx={s.fieldChangeCard}>
      <Box sx={s.fieldChangeRow}>
        <Box sx={s.fieldChangeInfoCol}>
          <Box sx={s.fieldChangeLine}>
            <Box sx={s.systemLabelColumn}>
              <Typography sx={s.systemLabel}>Assigned to</Typography>
            </Box>
            <Box sx={s.systemValueColumn}>
              <Typography sx={s.systemValue}>
                {activity.newValue || activity.description}
              </Typography>
            </Box>
          </Box>
          {activity.newValue && activity.previousValue && (
            <Box sx={s.fieldChangeLine}>
              <Box sx={s.systemLabelColumn}>
                <Typography sx={s.systemLabel}>State</Typography>
              </Box>
              <Box sx={s.systemValueColumn}>
                <Typography sx={s.systemValue}>
                  {activity.newValue} was {activity.previousValue}
                </Typography>
              </Box>
            </Box>
          )}
          {activity.previousValue && !activity.newValue && (
            <Box sx={s.fieldChangeLine}>
              <Box sx={s.systemLabelColumn}>
                <Typography sx={s.systemLabel}>State</Typography>
              </Box>
              <Box sx={s.systemValueColumn}>
                <Typography sx={s.systemValue}>{activity.previousValue}</Typography>
              </Box>
            </Box>
          )}
        </Box>
        <Box sx={s.fieldChangeMetaCol}>
          <Typography sx={s.fieldChangeType}>
            Field changes: {formatDateTime(activity.createdAt)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

/** User comment / note card (matches reference Image #2) */
export const CommentCard = ({ activity }: { activity: TimelineActivity }) => {
  const avatarColor = getAvatarColor(activity.performedBy);
  const initials = getInitials(activity.performedBy);
  const badge = getBadge(activity.activityType);

  return (
    <Box sx={s.commentCard}>
      <Box sx={s.commentCardHeader}>
        <Box sx={s.avatarCircle} style={{ backgroundColor: avatarColor }}>
          <Typography sx={s.avatarText}>{initials}</Typography>
        </Box>
        <Box sx={s.commentAuthorCol}>
          <Typography sx={s.commentAuthor}>{activity.performedBy}</Typography>
        </Box>
        <Box sx={s.commentBadgeCol}>
          <Box sx={s.commentBadge} style={{ backgroundColor: badge.bg, borderColor: badge.border }}>
            <Typography sx={s.commentBadgeText}>{badge.label}</Typography>
          </Box>
        </Box>
        <Box sx={s.commentDateCol}>
          <Typography sx={s.commentDate}>{formatDateTime(activity.createdAt)}</Typography>
        </Box>
      </Box>
      <Box sx={s.commentBody}>
        <Typography sx={s.commentText}>{activity.description}</Typography>
      </Box>
    </Box>
  );
};

// ── Main TimelineCard ──────────────────────────────────────────────────────────
interface TimelineCardProps {
  activity: TimelineActivity;
}

const TimelineCard = ({ activity }: TimelineCardProps) => {
  // System events (email_sent, system)
  if (activity.isSystem || activity.activityType === 'email_sent') {
    return <SystemEventCard activity={activity} />;
  }

  // Field changes
  if (activity.activityType === 'field_update' || activity.activityType === 'field_change') {
    return <FieldChangeCard activity={activity} />;
  }

  // All user actions (comment, internal note, self note, etc.)
  if (
    activity.activityType === 'comment_added' ||
    activity.activityType === 'internal_note' ||
    activity.activityType === 'self_note' ||
    activity.activityType === 'notify_assignees'
  ) {
    return <CommentCard activity={activity} />;
  }

  // Default: render as comment card
  return <CommentCard activity={activity} />;
};

export default TimelineCard;
