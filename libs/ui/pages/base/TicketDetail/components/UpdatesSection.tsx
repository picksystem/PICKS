import { useState, useMemo } from 'react';
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
  { label: 'Add a comment', border: '#6366f1', bg: '#eef2ff', text: '#4338ca' },
  { label: 'Add internal note', border: '#d97706', bg: '#fffbeb', text: '#92400e' },
  { label: 'Add self note', border: '#059669', bg: '#ecfdf5', text: '#065f46' },
];

/* ── Sub-components ──────────────────────────────────────── */

const ActionButtonRow = ({
  onOpenComment,
  classes,
  searchText,
  onSearchChange,
}: {
  onOpenComment?: (mode: 'comment' | 'internal' | 'self') => void;
  classes: Record<string, string>;
  searchText: string;
  onSearchChange: (value: string) => void;
}) => {
  const [filterSaved, setFilterSaved] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [showSystem, setShowSystem] = useState(false);

  const handleClick = (mode: 'comment' | 'internal' | 'self') => {
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
        {BUTTON_STYLES.map((btn) => {
          const mode = btn.label.includes('internal')
            ? ('internal' as const)
            : btn.label.includes('self')
              ? ('self' as const)
              : ('comment' as const);
          return (
            <Box key={btn.label} onClick={() => handleClick(mode)} sx={actionBtnSx(btn)}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, lineHeight: 1 }}>+</span>
              <span>{btn.label}</span>
            </Box>
          );
        })}

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
          { label: 'Filter Saved comments', checked: filterSaved, set: setFilterSaved },
          { label: 'Show activity log', checked: showActivity, set: setShowActivity },
          { label: 'Show system notes', checked: showSystem, set: setShowSystem },
        ].map(({ label, checked, set }) => (
          <Box
            key={label}
            onClick={() => set(!checked)}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              userSelect: 'none',
              height: 30,
            }}
          >
            <Box
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
              }}
            >
              {checked && (
                <svg width='10' height='10' viewBox='0 0 10 10' fill='none'>
                  <path
                    d='M2 5L4 7L8 3'
                    stroke='#fff'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              )}
            </Box>
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
            onClick={() => {}}
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
            onClick={() => {}}
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

const CommentCard = ({ comment }: { comment: IIncidentComment }) => {
  const avatarColor = getAvatarColor(comment.createdBy);
  const initials = getInitials(comment.createdBy);

  return (
    <Box sx={commentCardSx}>
      {/* Header */}
      <Box sx={commentCardHeaderSx}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={commentAvatarSx(avatarColor)}>{initials}</Avatar>
          <Typography sx={commentAuthorSx}>{comment.createdBy}</Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          {comment.isInternal && <Typography sx={internalNoteLabelSx}>Internal note</Typography>}
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

/* ── Main component ──────────────────────────────────────── */

const UpdatesSection = ({
  comments,
  incident,
  onRefresh,
  onRefreshComments,
}: UpdatesSectionProps) => {
  const { classes } = useStyles();
  const [modalMode, setModalMode] = useState<'comment' | 'internal' | 'self'>('comment');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  const filteredComments = useMemo(() => {
    return comments
      .filter((c) => !c.isSelfNote)
      .filter((c) => {
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
      />

      <FollowersList />

      <Box sx={dividerSx} />

      {filteredComments.length > 0 ? (
        <Box className={classes.commentsList}>
          {filteredComments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} />
          ))}
        </Box>
      ) : (
        <Box sx={emptyStateSx}>
          <Typography sx={emptyTextSx}>
            {searchText.trim() ? 'No matching comments found' : 'No updates available'}
          </Typography>
        </Box>
      )}

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
