import { useState, useMemo, useRef } from 'react';
import { Box, Typography, TextField, IconButton, Tooltip } from '../../../../components';
import CommentWindow from '../windows/CommentWindow';
import { Avatar } from '@mui/material';
import {
  Search as SearchIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  AttachFile as AttachFileIcon,
  Image as ImageIcon,
  Reply as ReplyIcon,
  Edit as EditIcon,
  Translate as TranslateIcon,
  ContentCopy as CopyIcon,
  PushPin as PinIcon,
  BookmarkBorder as SaveIcon,
  VisibilityOff as HideIcon,
  FilterList as FilterListIcon,
  Email as EmailIcon,
  Groups as GroupsIcon,
} from '@mui/icons-material';
import { IIncidentComment } from '@serviceops/interfaces';
import { useStyles } from '../styles';
import { TicketEntity } from '../types/ticketDetail.types';

interface UpdatesSectionProps {
  comments: IIncidentComment[];
  incidentId: number;
  ticketType: string;
  onRefresh: () => void;
  onRefreshComments: () => void;
  incident: TicketEntity;
  /** Optional: backend activity log entries (email, field changes, etc.) */
  activities?: ActivityCard[];
}

/* ── Helpers ─────────────────────────────────────────────── */

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

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

const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

/* ── Styles ──────────────────────────────────────────────── */

const actionButtonSx = {
  borderColor: '#c7d2fe',
  color: '#4338ca',
  backgroundColor: '#f5f3ff',
  textTransform: 'none' as const,
  fontWeight: 600,
  fontSize: '0.78rem',
  px: 1.5,
  py: 0.6,
  borderRadius: '8px',
  minHeight: 34,
  whiteSpace: 'nowrap',
  '&:hover': {
    backgroundColor: '#ede9fe',
    borderColor: '#a78bfa',
  },
};

const searchFieldSx = {
  width: 170,
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    fontSize: '0.82rem',
    height: 34,
    '& fieldset': {
      borderColor: '#cbd5e1',
    },
    '&:hover fieldset': {
      borderColor: '#94a3b8',
    },
  },
};

const toggleLabelSx = {
  fontSize: '0.8rem',
  color: '#64748b',
  fontWeight: 500,
  cursor: 'pointer',
};

const dividerSx = {
  height: 1,
  backgroundColor: '#e2e8f0',
  my: 1.5,
};

const emptyStateSx = {
  py: 5,
  textAlign: 'center' as const,
};

const emptyTextSx = {
  fontSize: '0.9rem',
  color: '#94a3b8',
  fontWeight: 500,
};

/* ── Action button colors ────────────────────────────────── */

const BUTTON_STYLES = [
  {
    label: 'Add a comment',
    border: '#6366f1',
    bg: '#eef2ff',
    text: '#4338ca',
    mode: 'comment' as const,
  },
  {
    label: 'Add internal note',
    border: '#d97706',
    bg: '#fffbeb',
    text: '#92400e',
    mode: 'internal' as const,
  },
  {
    label: 'Add self note',
    border: '#059669',
    bg: '#ecfdf5',
    text: '#065f46',
    mode: 'self' as const,
  },
  {
    label: 'Email note',
    border: '#0369a1',
    bg: '#e0f2fe',
    text: '#0369a1',
    mode: 'email' as const,
  },
  {
    label: 'Notify ticket assignees only',
    border: '#7c3aed',
    bg: '#faf5ff',
    text: '#6b21a8',
    mode: 'notify' as const,
  },
];

/* ── Sub-components ──────────────────────────────────────── */

const ActionButtonRow = ({
  onOpenComment,
  classes,
  searchText,
  onSearchChange,
  onNotifyAssignees,
  onOpenEmail,
  filterSaved,
  showActivity,
  showSystem,
  onToggleFilterSaved,
  onToggleShowActivity,
  onScrollToBottom,
  onToggleFilter,
}: {
  onOpenComment?: (mode: 'comment' | 'internal' | 'self') => void;
  classes: Record<string, string>;
  searchText: string;
  onSearchChange: (value: string) => void;
  onNotifyAssignees: () => void;
  onOpenEmail?: () => void;
  filterSaved: boolean;
  showActivity: boolean;
  showSystem: boolean;
  onToggleFilterSaved: () => void;
  onToggleShowActivity: () => void;
  onScrollToBottom: () => void;
  onToggleFilter: () => void;
}) => {
  const handleClick = (mode: 'comment' | 'internal' | 'self' | 'notify' | 'email') => {
    if (mode === 'notify') {
      onNotifyAssignees();
      return;
    }
    if (mode === 'email') {
      onOpenEmail?.();
      return;
    }
    if (onOpenComment) onOpenComment(mode);
  };

  const actionBtnSx = (btn: (typeof BUTTON_STYLES)[0]) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    padding: '3px 10px',
    height: 30,
    minHeight: 30,
    borderRadius: '6px',
    border: `1px solid ${btn.border}`,
    background: btn.bg,
    color: btn.text,
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    lineHeight: '22px',
    transition: 'all 0.15s ease',
    '&:hover': {
      opacity: 0.85,
      boxShadow: `0 1px 3px ${btn.border}40`,
    },
  });

  return (
    <Box className={classes.actionButtonsRow} sx={{ alignItems: 'center' }}>
      {/* Left group — action buttons + search */}
      <Box sx={{ display: 'flex', gap: '6px', alignItems: 'center', flex: 1, flexWrap: 'wrap' }}>
        {BUTTON_STYLES.map((btn) => (
          <Box key={btn.label} onClick={() => handleClick(btn.mode)} sx={actionBtnSx(btn)}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {btn.mode === 'notify' ? (
                <GroupsIcon sx={{ fontSize: 14 }} />
              ) : btn.mode === 'email' ? (
                <EmailIcon sx={{ fontSize: 14 }} />
              ) : (
                <span style={{ fontSize: '0.85rem', fontWeight: 700, lineHeight: 1 }}>+</span>
              )}
            </Box>
            <span>{btn.label}</span>
          </Box>
        ))}

        {/* Search field */}
        <Box
          sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', height: 30 }}
        >
          <SearchIcon
            sx={{
              position: 'absolute',
              left: 8,
              fontSize: 16,
              color: '#94a3b8',
              zIndex: 1,
              pointerEvents: 'none',
            }}
          />
          <TextField
            placeholder='Find text'
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            size='small'
            sx={{
              width: 210,
              height: 30,
              '& .MuiOutlinedInput-root': {
                height: 30,
                borderRadius: '6px',
                fontSize: '0.8rem',
                backgroundColor: '#ffffff',
                '& fieldset': {
                  borderColor: '#cbd5e1',
                },
                '&:hover fieldset': {
                  borderColor: '#94a3b8',
                },
              },
              '& .MuiInputBase-input': {
                padding: '4px 6px',
                fontSize: '0.8rem',
                pl: '28px',
              },
              '& .MuiInputBase-input::placeholder': {
                opacity: 0.7,
              },
              '& .MuiSvgIcon-root': {
                fontSize: '1.1rem',
                color: '#64748b',
              },
            }}
          />
        </Box>
      </Box>

      {/* Right group — toggles & actions */}
      <Box
        sx={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap',
          flexShrink: 0,
        }}
      >
        {/* Checkbox toggles */}
        {[
          { label: 'Filter Saved comments', checked: filterSaved, onToggle: onToggleFilterSaved, always: false },
          { label: 'Show activity log', checked: showActivity, onToggle: onToggleShowActivity, always: false },
          { label: 'Show system notes', checked: true, onToggle: () => {}, always: true },
        ].map(({ label, checked, onToggle, always }) => (
          <Box
            key={label}
            onClick={always ? undefined : onToggle}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: always ? 'default' : 'pointer',
              userSelect: 'none',
              height: 30,
            }}
          >
            <Box
              component='input'
              type='checkbox'
              checked={checked}
              readOnly
              tabIndex={-1}
              sx={{
                width: 16,
                height: 16,
                borderRadius: '3px',
                border: checked ? 'none' : '1.5px solid #6366f1',
                backgroundColor: checked ? '#6366f1' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.15s ease',
                boxSizing: 'border-box',
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                padding: 0,
                margin: 0,
                outline: 'none',
                cursor: 'pointer',
                position: 'relative',
                accentColor: '#6366f1',
              }}
            />
            <Typography
              sx={{
                fontSize: '0.8rem',
                color: '#475569',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                lineHeight: 1,
              }}
            >
              {label}
            </Typography>
          </Box>
        ))}

        {/* Scroll + Filter buttons */}
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '4px', ml: '4px' }}>
          <Box
            onClick={onScrollToBottom}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              height: 30,
              minHeight: 30,
              px: '8px',
              borderRadius: '6px',
              border: '1px solid #c7d2fe',
              background: '#f5f3ff',
              color: '#4338ca',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              lineHeight: 1,
              transition: 'all 0.15s ease',
              '&:hover': {
                backgroundColor: '#ede9fe',
                borderColor: '#a78bfa',
              },
            }}
          >
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(67,56,202,0.08)',
              }}
            >
              <FilterListIcon sx={{ fontSize: 13, color: '#4338ca' }} />
            </Box>
            <Typography
              sx={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#4338ca',
                whiteSpace: 'nowrap',
                lineHeight: '24px',
              }}
            >
              Scroll to bottom
            </Typography>
          </Box>

          <Box
            onClick={onToggleFilter}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              height: 30,
              minHeight: 30,
              px: '8px',
              borderRadius: '6px',
              border: '1px solid #c7d2fe',
              background: '#f5f3ff',
              color: '#4338ca',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              lineHeight: 1,
              transition: 'all 0.15s ease',
              '&:hover': {
                backgroundColor: '#ede9fe',
                borderColor: '#a78bfa',
              },
            }}
          >
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(67,56,202,0.08)',
              }}
            >
              <FilterListIcon sx={{ fontSize: 13, color: '#4338ca' }} />
            </Box>
            <Typography
              sx={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#4338ca',
                whiteSpace: 'nowrap',
                lineHeight: '24px',
              }}
            >
              Filter
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const FollowerIconButton = ({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) => (
  <IconButton
    size='small'
    onClick={onClick}
    sx={{
      p: 0.4,
      color: active ? '#475569' : '#cbd5e1',
      backgroundColor: active ? 'rgba(71,85,105,0.06)' : 'transparent',
      border: `1px solid ${active ? 'rgba(71,85,105,0.2)' : 'rgba(203,213,225,0.5)'}`,
      borderRadius: '6px',
      width: 28,
      height: 28,
      '&:hover': {
        backgroundColor: active ? 'rgba(71,85,105,0.12)' : 'rgba(203,213,225,0.2)',
      },
    }}
    title={title}
  >
    {children}
  </IconButton>
);

const FollowersList = () => {
  const [lock1, setLock1] = useState(false);
  const [person1, setPerson1] = useState(true);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: '14px 16px',
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        flexWrap: 'wrap',
        gap: 1,
      }}
    >
      {/* Left — Followers list */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography sx={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600, mr: 0.25 }}>
          Followers list
        </Typography>
        <FollowerIconButton
          active={lock1}
          onClick={() => setLock1(!lock1)}
          title={lock1 ? 'Unlock' : 'Lock'}
        >
          <LockIcon sx={{ fontSize: 15 }} />
        </FollowerIconButton>
        <FollowerIconButton
          active={person1}
          onClick={() => setPerson1(!person1)}
          title='Toggle follower visibility'
        >
          {person1 ? <PersonIcon sx={{ fontSize: 15 }} /> : <HideIcon sx={{ fontSize: 15 }} />}
        </FollowerIconButton>
      </Box>

      {/* Right — Internal followers list */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <Typography sx={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600, mr: 0.25 }}>
          Internal followers list
        </Typography>
        <FollowerIconButton active={false} onClick={() => {}} title='Lock'>
          <LockIcon sx={{ fontSize: 15 }} />
        </FollowerIconButton>
        <FollowerIconButton active onClick={() => {}} title='Toggle follower visibility'>
          <PersonIcon sx={{ fontSize: 15 }} />
        </FollowerIconButton>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            backgroundColor: '#6366f1',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 700,
            fontFamily: '"Roboto Mono", monospace',
          }}
        >
          S
        </Box>
        <Typography sx={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: 600 }}>
          Srinivas Penumalla
        </Typography>
        <IconButton
          size='small'
          sx={{
            p: 0.4,
            color: '#6366f1',
            backgroundColor: 'rgba(99,102,241,0.08)',
            border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: '6px',
            width: 28,
            height: 28,
            '&:hover': { backgroundColor: 'rgba(99,102,241,0.15)' },
          }}
          title='Add internal follower'
        >
          <PersonIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
    </Box>
  );
};

/* ── Sub-components ──────────────────────────────────────── */

const getCommentBorderColor = (comment: IIncidentComment): string => {
  if (comment.isInternal) return '#d97706';
  if (comment.isSelfNote) return '#059669';
  return '#6366f1';
};

const CommentCard = ({ comment }: { comment: IIncidentComment }) => {
  const avatarColor = getAvatarColor(comment.createdBy);
  const initials = getInitials(comment.createdBy);
  const borderColor = getCommentBorderColor(comment);

  return (
    <Box
      sx={{
        ...commentCardSx,
        borderLeft: `3px solid ${borderColor}`,
      }}
    >
      {/* Header */}
      <Box sx={commentCardHeaderSx}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={commentAvatarSx(avatarColor)}>{initials}</Avatar>
          <Typography sx={commentAuthorSx}>{comment.createdBy}</Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          {comment.isInternal && (
            <Typography sx={{ ...internalNoteLabelSx, color: '#d97706' }}>Internal note</Typography>
          )}
          {comment.isSelfNote && (
            <Typography sx={{ ...internalNoteLabelSx, color: '#059669' }}>Self note</Typography>
          )}
          {comment.notifyAssigneesOnly && (
            <Typography sx={{ ...internalNoteLabelSx, color: '#7c3aed' }}>
              Notify assignees
            </Typography>
          )}
          <Typography sx={commentTimestampSx}>{formatDateTime(comment.createdAt)}</Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title='Attachment'>
              <IconButton size='small' sx={commentActionIconSx}>
                <AttachFileIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title='Image'>
              <IconButton size='small' sx={commentActionIconSx}>
                <ImageIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Body */}
      <Box sx={commentCardBodySx}>
        <Typography sx={commentMessageSx}>{comment.message}</Typography>
      </Box>
    </Box>
  );
};

const commentCardSx = {
  mb: 1.5,
  borderRadius: 0,
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderLeft: '3px solid #e2e8f0',
  overflow: 'hidden',
  transition: 'box-shadow 0.15s ease',
  '&:hover': {
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
};

const commentCardHeaderSx = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 1,
  px: 2,
  pt: 1.5,
  pb: 0.75,
};

const commentCardBodySx = {
  px: 2,
  pb: 1.5,
};

const commentAvatarSx = (color: string) => ({
  width: 32,
  height: 32,
  fontSize: '0.72rem',
  fontWeight: 800,
  bgcolor: color,
  color: '#fff',
  fontFamily: '"Roboto Mono", monospace',
  borderRadius: '4px',
});

const commentAuthorSx = {
  fontSize: '0.875rem',
  fontWeight: 600,
  color: '#374151',
};

const internalNoteLabelSx = {
  fontSize: '0.8rem',
  color: '#6366f1',
  fontWeight: 600,
  letterSpacing: '0.2px',
};

const commentTimestampSx = {
  fontSize: '0.8rem',
  color: '#64748b',
  fontWeight: 500,
  fontFamily: '"Roboto Mono", monospace',
};

const commentActionIconSx = {
  p: 0.5,
  color: '#94a3b8',
  width: 28,
  height: 28,
  '&:hover': {
    color: '#475569',
    backgroundColor: 'rgba(100,116,139,0.08)',
  },
};

const commentMessageSx = {
  fontSize: '0.9rem',
  color: '#374151',
  lineHeight: 1.7,
  whiteSpace: 'pre-wrap' as const,
  wordBreak: 'break-word' as const,
};

/* ── Activity types & System Card ────────────────────────── */

type ActivityType =
  | 'email_sent'
  | 'field_change'
  | 'comment_added'
  | 'internal_note'
  | 'self_note'
  | 'notify_assignees'
  | 'time_entry_added';

interface ActivityCard {
  id: number;
  type: ActivityType;
  timestamp: string;
  description?: string;
  previousValue?: string;
  newValue?: string;
  user?: string;
  avatarInitials?: string;
  avatarColor?: string;
  isSystem?: boolean;
  // Email fields
  emailSubject?: string;
  emailFrom?: string;
  emailTo?: string;
}

const getActivityLabel = (type: ActivityType): string => {
  switch (type) {
    case 'email_sent':
      return 'Email sent';
    case 'field_change':
      return 'Field changes';
    case 'comment_added':
      return '';
    case 'internal_note':
      return 'Internal note';
    case 'self_note':
      return 'Self note';
    case 'notify_assignees':
      return 'Notify ticket assignees only';
    case 'time_entry_added':
      return '';
    default:
      return '';
  }
};

const getActivityBorderColor = (type: ActivityType): string => {
  switch (type) {
    case 'email_sent':
      return '#0891b2';
    case 'field_change':
      return '#d97706';
    case 'comment_added':
      return '#4338ca';
    case 'internal_note':
      return '#d97706';
    case 'self_note':
      return '#059669';
    case 'notify_assignees':
      return '#7aace6';
    case 'time_entry_added':
      return '#059669';
    default:
      return '#64748b';
  }
};

const SystemCard = ({ activity }: { activity: ActivityCard }) => {
  const isEmail = activity.type === 'email_sent';
  const isFieldChange = activity.type === 'field_change';
  const borderColor = getActivityBorderColor(activity.type);

  if (isEmail) {
    return (
      <Box sx={{ ...systemCardSx, borderLeft: `3px solid ${borderColor}` }}>
        {/* Header — icon + label only, timestamp on the right */}
        <Box sx={systemCardHeaderSx}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmailIcon sx={{ fontSize: 20, color: '#374151' }} />
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>
              Email sent
            </Typography>
          </Box>
          <Typography
            sx={{
              fontSize: '0.8rem',
              color: '#64748b',
              fontWeight: 500,
              fontFamily: '"Roboto Mono", monospace',
            }}
          >
            Email Sent : {formatDateTime(activity.timestamp)}
          </Typography>
        </Box>

        {/* Body — Subject / From / To rows + Show email details */}
        <Box sx={systemEmailDetailsSx}>
          {activity.emailSubject && (
            <Box sx={systemEmailRowSx}>
              <Typography sx={systemEmailLabelSx}>Subject:</Typography>
              <Typography sx={systemEmailValueSx}>{activity.emailSubject}</Typography>
            </Box>
          )}
          {activity.emailFrom && (
            <Box sx={systemEmailRowSx}>
              <Typography sx={systemEmailLabelSx}>From:</Typography>
              <Typography sx={systemEmailValueSx}>{activity.emailFrom}</Typography>
            </Box>
          )}
          {activity.emailTo && (
            <Box sx={systemEmailRowSx}>
              <Typography sx={systemEmailLabelSx}>To:</Typography>
              <Typography sx={systemEmailValueSx}>{activity.emailTo}</Typography>
            </Box>
          )}
          <Box sx={systemEmailRowSx}>
            <Typography
              sx={{
                ...systemEmailLabelSx,
                color: '#6366f1',
                cursor: 'pointer',
                fontWeight: 600,
                textDecoration: 'underline',
                '&:hover': { color: '#4f46e5' },
              }}
            >
              Show email details
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  if (isFieldChange) {
    return (
      <Box sx={{ ...systemCardSx, borderLeft: `3px solid ${borderColor}` }}>
        <Box sx={systemCardHeaderSx}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: `${borderColor}14`,
              }}
            >
              {activity.avatarInitials ? (
                <Typography
                  sx={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    color: borderColor,
                    fontFamily: '"Roboto Mono", monospace',
                  }}
                >
                  {activity.avatarInitials}
                </Typography>
              ) : (
                <EditIcon sx={{ fontSize: 16, color: borderColor }} />
              )}
            </Box>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>
              {activity.user}
            </Typography>
          </Box>
          <Typography
            sx={{
              fontSize: '0.78rem',
              color: '#64748b',
              fontWeight: 500,
              fontFamily: '"Roboto Mono", monospace',
            }}
          >
            Field changes: {formatDateTime(activity.timestamp)}
          </Typography>
        </Box>
        <Box sx={systemFieldRowsSx}>
          {activity.previousValue && (
            <Box sx={systemFieldRowSx}>
              <Typography sx={systemFieldLabelSx}>Assigned to</Typography>
              <Typography sx={systemFieldValueSx}>{activity.previousValue}</Typography>
            </Box>
          )}
          {activity.newValue && (
            <Box sx={systemFieldRowSx}>
              <Typography sx={systemFieldLabelSx}>State</Typography>
              <Typography sx={systemFieldValueSx}>
                {activity.newValue}
                {activity.previousValue ? ` was ${activity.previousValue}` : ''}
              </Typography>
            </Box>
          )}
          {activity.description && (
            <Box sx={systemFieldRowSx}>
              <Typography sx={systemFieldLabelSx}>Time Worked</Typography>
              <Typography sx={systemFieldValueSx}>{activity.description}</Typography>
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  // Default system card (for other activity types)
  const label = getActivityLabel(activity.type);
  const accentColor =
    activity.type === 'internal_note'
      ? '#6366f1'
      : activity.type === 'notify_assignees'
        ? '#7c3aed'
        : borderColor;

  return (
    <Box sx={{ ...systemCardSx, borderLeft: `3px solid ${borderColor}` }}>
      <Box sx={systemCardHeaderSx}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: '50%',
              bgcolor: `${accentColor}14`,
            }}
          >
            {activity.avatarInitials ? (
              <Typography
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: accentColor,
                  fontFamily: '"Roboto Mono", monospace',
                }}
              >
                {activity.avatarInitials}
              </Typography>
            ) : (
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: accentColor }} />
            )}
          </Box>
          <Box>
            {activity.user && (
              <Typography
                sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', lineHeight: 1.3 }}
              >
                {activity.user}
              </Typography>
            )}
            {label && (
              <Typography
                sx={{ fontSize: '0.78rem', color: accentColor, fontWeight: 600, lineHeight: 1.3 }}
              >
                {label}
              </Typography>
            )}
          </Box>
        </Box>
        <Typography
          sx={{
            fontSize: '0.78rem',
            color: '#64748b',
            fontWeight: 500,
            fontFamily: '"Roboto Mono", monospace',
          }}
        >
          {formatDateTime(activity.timestamp)}
        </Typography>
      </Box>
      {activity.description && (
        <Box sx={{ px: 2, pb: 1.5 }}>
          <Typography
            sx={{
              fontSize: '0.88rem',
              color: '#374151',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {activity.description}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

/* System card styles */

const systemCardSx = {
  mb: 1.5,
  borderRadius: 0,
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderLeft: '3px solid #e2e8f0',
  overflow: 'hidden',
  transition: 'box-shadow 0.15s ease',
  '&:hover': {
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
};

const systemCardHeaderSx = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 1,
  px: 2,
  pt: 1.5,
  pb: 0.75,
};

const systemEmailDetailsSx = {
  px: 2,
  pb: 1.5,
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const systemEmailRowSx = {
  display: 'flex',
  alignItems: 'baseline',
  gap: '8px',
};

const systemEmailLabelSx = {
  fontSize: '0.85rem',
  color: '#475569',
  fontWeight: 600,
  flexShrink: 0,
  minWidth: 58,
};

const systemEmailValueSx = {
  fontSize: '0.85rem',
  color: '#1e293b',
  lineHeight: 1.5,
};

const systemFieldRowsSx = {
  px: 2,
  pb: 1.5,
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const systemFieldRowSx = {
  display: 'flex',
  alignItems: 'baseline',
  gap: '8px',
};

const systemFieldLabelSx = {
  fontSize: '0.85rem',
  color: '#475569',
  fontWeight: 600,
  flexShrink: 0,
  minWidth: 80,
};

const systemFieldValueSx = {
  fontSize: '0.85rem',
  color: '#1e293b',
  lineHeight: 1.5,
};

/* ── Demo activity data ──────────────────────────────────── */

const DEMO_ACTIVITIES: ActivityCard[] = [
  {
    id: 1,
    type: 'email_sent',
    timestamp: '2026-01-07T11:45:00',
    emailSubject: 'SESI: Inventory value cleanup- INC3913562 has been assigned to you',
    emailFrom: 'Polaris Worldwide Service Desk',
    emailTo: 'Vinees.Thumma@polaris.com',
  },
  {
    id: 2,
    type: 'field_change',
    timestamp: '2026-01-09T11:40:00',
    previousValue: 'New',
    newValue: 'Awaiting Evidence Service',
    user: 'Srinivas Penumalla',
    avatarInitials: 'SP',
  },
  {
    id: 3,
    type: 'comment_added',
    timestamp: '2026-01-09T12:15:00',
    description: 'Working on this ticket. Will update shortly with findings.',
    user: 'Srinivas Penumalla',
    avatarInitials: 'SP',
    avatarColor: '#6366f1',
  },
  {
    id: 4,
    type: 'internal_note',
    timestamp: '2026-01-09T14:30:00',
    description:
      'Customer called in requesting escalation. Check with supervisor before responding.',
    user: 'Admin User',
    avatarInitials: 'AD',
    avatarColor: '#6366f1',
  },
  {
    id: 5,
    type: 'notify_assignees',
    timestamp: '2026-01-09T15:00:00',
    description: 'Sent notification to all assigned team members about the priority change.',
    user: 'Admin User',
    avatarInitials: 'AD',
    avatarColor: '#7c3aed',
  },
  {
    id: 6,
    type: 'self_note',
    timestamp: '2026-08-11T01:15:02',
    description: 'Reviewed documentation - need to check with team lead on this one',
    user: 'Admin User',
    avatarInitials: 'AD',
    avatarColor: '#059669',
  },
];

/* ── Main component ──────────────────────────────────────── */

const UpdatesSection = ({
  comments,
  incident,
  onRefresh,
  onRefreshComments,
  activities,
}: UpdatesSectionProps) => {
  const { classes } = useStyles();
  const [modalMode, setModalMode] = useState<'comment' | 'internal' | 'self' | 'notify' | 'email'>(
    'comment',
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterSaved, setFilterSaved] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [showSystem] = useState(true);
  const commentsListRef = useRef<HTMLDivElement>(null);

  const handleNotifyAssignees = () => {
    setModalMode('notify');
    setIsModalOpen(true);
  };

  const handleOpenEmail = () => {
    setModalMode('email');
    setIsModalOpen(true);
  };

  const handleScrollToBottom = () => {
    commentsListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  const handleFilterToggle = () => {
    setFilterSaved((prev) => !prev);
  };

  const filteredComments = useMemo(() => {
    return comments.filter((c) => {
      if (!searchText.trim()) return true;
      const q = searchText.toLowerCase();
      return (
        c.message.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        c.createdBy.toLowerCase().includes(q)
      );
    });
  }, [comments, searchText]);

  const handleOpenComment = (mode: 'comment' | 'internal' | 'self') => {
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const handleCommentSuccess = () => {
    setIsModalOpen(false);
    setModalMode('comment');
    if (typeof onRefresh === 'function') {
      onRefresh();
    }
    if (typeof onRefreshComments === 'function') {
      onRefreshComments();
    }
  };

  return (
    <Box className={classes.updatesSection}>
      <ActionButtonRow
        onOpenComment={handleOpenComment}
        classes={classes}
        searchText={searchText}
        onSearchChange={setSearchText}
        onNotifyAssignees={handleNotifyAssignees}
        onOpenEmail={handleOpenEmail}
        filterSaved={filterSaved}
        showActivity={showActivity}
        showSystem={showSystem}
        onToggleFilterSaved={() => setFilterSaved((prev) => !prev)}
        onToggleShowActivity={() => setShowActivity((prev) => !prev)}
        onScrollToBottom={handleScrollToBottom}
        onToggleFilter={handleFilterToggle}
      />

      <FollowersList />

      <Box sx={dividerSx} />

      {/* Interleaved timeline: comments + system activity cards */}
      {(() => {
        // Build combined timeline
        const timelineItems: Array<{
          kind: 'comment' | 'system';
          item: IIncidentComment | ActivityCard;
          timestamp: Date;
        }> = [];

        // Add comments
        const displayComments = filteredComments.filter((comment) => {
          // "Filter Saved comments" — hide draft/saved comments when enabled
          if (filterSaved) return comment.status !== 'draft';
          return true;
        });

        displayComments.forEach((comment) => {
          // "Show system notes" — hide internal and self notes when disabled
          const isSystemNote = comment.isInternal || comment.isSelfNote;
          if (isSystemNote && !showSystem) return;

          timelineItems.push({
            kind: 'comment',
            item: comment,
            timestamp: new Date(comment.createdAt),
          });
        });

        // "Show activity log" — include system activity entries when enabled
        if (showActivity && activities) {
          activities.forEach((activity) => {
            timelineItems.push({
              kind: 'system',
              item: activity,
              timestamp: new Date(activity.timestamp),
            });
          });
        }

        // Sort by timestamp descending (newest first)
        timelineItems.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        if (timelineItems.length > 0) {
          return (
            <Box ref={commentsListRef} className={classes.commentsList}>
              {timelineItems.map((entry, index) => {
                if (entry.kind === 'comment') {
                  return (
                    <CommentCard
                      key={`comment-${entry.item.id}`}
                      comment={entry.item as IIncidentComment}
                    />
                  );
                }
                return (
                  <SystemCard
                    key={`activity-${entry.item.id}`}
                    activity={entry.item as ActivityCard}
                  />
                );
              })}
            </Box>
          );
        }

        return (
          <Box sx={emptyStateSx}>
            <Typography sx={emptyTextSx}>
              {searchText.trim() ? 'No matching updates found' : 'No updates available'}
            </Typography>
          </Box>
        );
      })()}

      <CommentWindow
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        incident={incident}
        onSuccess={handleCommentSuccess}
        mode={modalMode}
      />
    </Box>
  );
};

export default UpdatesSection;
