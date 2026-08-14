import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import GroupIcon from '@mui/icons-material/Group';
import AddIcon from '@mui/icons-material/Add';
import MessageIcon from '@mui/icons-material/Message';
import LockIcon from '@mui/icons-material/Lock';
import PersonPinIcon from '@mui/icons-material/PersonPin';
import TimelineIcon from '@mui/icons-material/Timeline';
import AddToPhotosIcon from '@mui/icons-material/AddToPhotos';
import TimelineCard, { TimelineActivity } from './TimelineCard';

const ACTION_TYPES: { key: string; label: string; icon: React.ReactNode; color: string }[] = [
  {
    key: 'comment_added',
    label: 'Add a comment',
    icon: <MessageIcon fontSize='small' />,
    color: '#4338ca',
  },
  {
    key: 'internal_note',
    label: 'Add internal note',
    icon: <LockIcon fontSize='small' />,
    color: '#d97706',
  },
  {
    key: 'self_note',
    label: 'Add self note',
    icon: <PersonPinIcon fontSize='small' />,
    color: '#6366f1',
  },
  {
    key: 'notify_assignees',
    label: 'Notify ticket assignees only',
    icon: <GroupIcon fontSize='small' />,
    color: '#059669',
  },
];

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'comment_added', label: 'Comments' },
  { value: 'internal_note', label: 'Internal Notes' },
  { value: 'self_note', label: 'Self Notes' },
  { value: 'notify_assignees', label: 'Notify Assignees' },
  { value: 'field_update', label: 'Field Changes' },
  { value: 'email_sent', label: 'Email Sent' },
  { value: 'status_change', label: 'Status Changes' },
  { value: 'priority_change', label: 'Priority Changes' },
];

interface TimelineSectionProps {
  activities: TimelineActivity[];
  title?: string;
  /** Called when an action button is clicked */
  onAction?: (actionType: string) => void;
  /** Is the timeline collapsed */
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const TimelineSection = ({
  activities,
  title = 'Activity Log',
  onAction,
  collapsed,
  onToggleCollapse,
}: TimelineSectionProps) => {
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showComments, setShowComments] = useState(true);
  const [showFieldChanges, setShowFieldChanges] = useState(true);
  const [showSystemEvents, setShowSystemEvents] = useState(true);

  // Filter logic
  const filteredActivities = useMemo(() => {
    let result = activities;

    // Text search
    if (searchText.trim()) {
      const q = searchText.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.description.toLowerCase().includes(q) ||
          a.performedBy.toLowerCase().includes(q) ||
          (a.newValue?.toLowerCase().includes(q) ?? false) ||
          (a.previousValue?.toLowerCase().includes(q) ?? false) ||
          a.activityType.toLowerCase().includes(q),
      );
    }

    // Type filter
    if (filterType !== 'all') {
      result = result.filter((a) => a.activityType === filterType);
    }

    // Show/hide comments
    if (!showComments) {
      result = result.filter((a) => a.activityType !== 'comment_added');
    }

    // Show/hide field changes
    if (!showFieldChanges) {
      result = result.filter(
        (a) => a.activityType !== 'field_update' && a.activityType !== 'field_change',
      );
    }

    // Show/hide system events
    if (!showSystemEvents) {
      result = result.filter(
        (a) =>
          !a.isSystem &&
          a.activityType !== 'email_sent' &&
          a.activityType !== 'status_change' &&
          a.activityType !== 'priority_change' &&
          a.activityType !== 'assignment_change' &&
          a.activityType !== 'escalation',
      );
    }

    return result;
  }, [activities, searchText, filterType, showComments, showFieldChanges, showSystemEvents]);

  const handleActionClick = (actionType: string) => {
    onAction?.(actionType);
  };

  return (
    <Box sx={timelineStyles.container}>
      {/* ── Section header ─────────────────────────────────────────────── */}
      <Box sx={timelineStyles.header}>
        <Box sx={timelineStyles.headerLeft}>
          <TimelineIcon sx={timelineStyles.headerIcon} />
          <Typography sx={timelineStyles.headerTitle}>{title}</Typography>
          {filteredActivities.length > 0 && (
            <Typography sx={timelineStyles.headerCount}>{filteredActivities.length}</Typography>
          )}
        </Box>
        <Box sx={timelineStyles.headerRight}>
          {onToggleCollapse && (
            <IconButton size='small' onClick={onToggleCollapse} sx={timelineStyles.collapseBtn}>
              <AddIcon
                sx={{
                  fontSize: 20,
                  transform: collapsed ? 'rotate(0deg)' : 'rotate(45deg)',
                  transition: 'transform 0.2s ease',
                }}
              />
            </IconButton>
          )}
        </Box>
      </Box>

      {!collapsed && (
        <>
          {/* ── Action buttons ─────────────────────────────────────────── */}
          <Box sx={timelineStyles.actionRow}>
            {ACTION_TYPES.map((action) => (
              <Button
                key={action.key}
                variant='outlined'
                size='small'
                startIcon={action.icon}
                onClick={() => handleActionClick(action.key)}
                sx={{
                  borderColor: `${action.color}30`,
                  color: action.color,
                  backgroundColor: `${action.color}08`,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.76rem',
                  px: 1.2,
                  py: 0.5,
                  minHeight: 30,
                  borderRadius: '8px',
                  lineHeight: 1.3,
                  '&:hover': {
                    backgroundColor: `${action.color}15`,
                    borderColor: `${action.color}50`,
                  },
                }}
              >
                {action.label}
              </Button>
            ))}
          </Box>

          {/* ── Search and filters ─────────────────────────────────────── */}
          <Box sx={timelineStyles.filterRow}>
            <Box sx={timelineStyles.searchBox}>
              <TextField
                size='small'
                placeholder='Find text'
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position='start'>
                        <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                    endAdornment: searchText ? (
                      <InputAdornment position='end'>
                        <IconButton
                          size='small'
                          onClick={() => setSearchText('')}
                          sx={{ padding: 0 }}
                        >
                          <ClearIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        </IconButton>
                      </InputAdornment>
                    ) : null,
                  },
                }}
                sx={{
                  width: 180,
                  '& .MuiInputBase-root': {
                    height: 34,
                    fontSize: '0.82rem',
                    borderRadius: '8px',
                    backgroundColor: '#f9fafb',
                    '& fieldset': {
                      borderColor: '#d1d5db',
                    },
                    '&:hover fieldset': {
                      borderColor: '#9ca3af',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#4338ca',
                    },
                  },
                  '& .MuiInputBase-input': {
                    py: 1,
                    px: 1,
                  },
                }}
              />
            </Box>

            <FormControl size='small' sx={{ minWidth: 140, height: 34 }}>
              <InputLabel
                id='timeline-filter-label'
                sx={{
                  fontSize: '0.82rem',
                  '&.MuiInputLabel-shrink': { transform: 'translate(14px, -8px) scale(0.75)' },
                }}
              >
                Filter
              </InputLabel>
              <Select
                labelId='timeline-filter-label'
                value={filterType}
                label='Filter'
                onChange={(e) => setFilterType(e.target.value)}
                startAdornment={
                  <InputAdornment position='start'>
                    <FilterListIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  </InputAdornment>
                }
                sx={{
                  height: 34,
                  fontSize: '0.82rem',
                  borderRadius: '8px',
                  '& fieldset': {
                    borderColor: '#d1d5db',
                  },
                  '&:hover fieldset': {
                    borderColor: '#9ca3af',
                  },
                }}
              >
                {FILTER_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '0.82rem' }}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={timelineStyles.toggleGroup}>
              <Tooltip title={showComments ? 'Hide comments' : 'Show comments'}>
                <IconButton
                  size='small'
                  onClick={() => setShowComments(!showComments)}
                  sx={{
                    width: 34,
                    height: 34,
                    border: `1px solid ${showComments ? '#4338ca50' : '#d1d5db'}`,
                    borderRadius: '8px',
                    backgroundColor: showComments ? '#4338ca10' : 'transparent',
                    color: showComments ? '#4338ca' : '#9ca3af',
                    '&:hover': {
                      backgroundColor: showComments ? '#4338ca18' : '#f3f4f6',
                    },
                  }}
                >
                  <MessageIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title={showFieldChanges ? 'Hide field changes' : 'Show field changes'}>
                <IconButton
                  size='small'
                  onClick={() => setShowFieldChanges(!showFieldChanges)}
                  sx={{
                    width: 34,
                    height: 34,
                    border: `1px solid ${showFieldChanges ? '#37415150' : '#d1d5db'}`,
                    borderRadius: '8px',
                    backgroundColor: showFieldChanges ? '#37415110' : 'transparent',
                    color: showFieldChanges ? '#374151' : '#9ca3af',
                    '&:hover': {
                      backgroundColor: showFieldChanges ? '#37415118' : '#f3f4f6',
                    },
                  }}
                >
                  <AddToPhotosIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title={showSystemEvents ? 'Hide system events' : 'Show system events'}>
                <IconButton
                  size='small'
                  onClick={() => setShowSystemEvents(!showSystemEvents)}
                  sx={{
                    width: 34,
                    height: 34,
                    border: `1px solid ${showSystemEvents ? '#0369a150' : '#d1d5db'}`,
                    borderRadius: '8px',
                    backgroundColor: showSystemEvents ? '#0369a110' : 'transparent',
                    color: showSystemEvents ? '#0369a1' : '#9ca3af',
                    '&:hover': {
                      backgroundColor: showSystemEvents ? '#0369a118' : '#f3f4f6',
                    },
                  }}
                >
                  <TimelineIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* ── Timeline content ───────────────────────────────────────── */}
          <Box sx={timelineStyles.content}>
            {filteredActivities.length === 0 ? (
              <Box sx={timelineStyles.empty}>
                <Typography sx={timelineStyles.emptyText}>
                  {searchText || filterType !== 'all'
                    ? 'No activities match your filter'
                    : 'No activity recorded yet'}
                </Typography>
              </Box>
            ) : (
              filteredActivities.map((activity) => (
                <TimelineCard key={activity.id} activity={activity} />
              ))
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────

const timelineStyles: Record<string, React.CSSProperties> = {
  container: {
    border: '1px solid #e5e7eb',
    borderRadius: '14px',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },

  // Header
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 20px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  headerIcon: {
    fontSize: 20,
    color: '#4338ca',
  },
  headerTitle: {
    fontSize: '0.95rem',
    fontWeight: 700,
    color: '#1f2937',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  headerCount: {
    fontSize: '0.72rem',
    fontWeight: 700,
    color: '#fff',
    backgroundColor: '#4338ca',
    borderRadius: '10px',
    padding: '1px 8px',
    minWidth: '20px',
    textAlign: 'center',
    lineHeight: '1.6',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  collapseBtn: {
    width: 28,
    height: 28,
    color: '#6b7280',
  },

  // Action buttons row
  actionRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    padding: '12px 20px 8px',
    borderBottom: '1px solid #f3f4f6',
  },

  // Filter row
  filterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 20px 8px',
    borderBottom: '1px solid #f3f4f6',
    flexWrap: 'wrap',
  },
  searchBox: {
    flex: '0 0 auto',
  },
  toggleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginLeft: 'auto',
  },

  // Content area
  content: {
    maxHeight: '500px',
    overflowY: 'auto',
    padding: '0 4px',
  },

  empty: {
    padding: '32px 20px',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: '0.85rem',
    color: '#9ca3af',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
};

export default TimelineSection;
