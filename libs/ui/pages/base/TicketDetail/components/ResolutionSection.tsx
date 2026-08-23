import { useState } from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  ContentCopy as ContentCopyIcon,
  PushPin as PushPinIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { IResolution } from '@serviceops/interfaces';

/* ─────────────────────────────────────────────────────────
   Props
   ───────────────────────────────────────────────────────── */

interface ResolutionSectionProps {
  resolutions: IResolution[];
  /** Called when "Add Resolution" is clicked — opens the ResolveWindow dialog */
  onAddResolution?: () => void;
}

/* ─────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────── */

const formatDate = (dateStr: Date | string): string => {
  const d = new Date(dateStr);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const getInitials = (email: string): string => {
  if (!email) return '?';
  const parts = email.split('@')[0].split(/[._-]/);
  return (parts[0]?.[0] || '').toUpperCase() + (parts[1]?.[0] || '').toUpperCase();
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

/* ─────────────────────────────────────────────────────────
   Action icon style
   ───────────────────────────────────────────────────────── */

const actionIconSx = {
  p: 0,
  width: 34,
  height: 34,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  backgroundColor: '#ffffff',
  color: '#334155',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  transition: 'all 0.15s ease',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#f8fafc',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    transform: 'translateY(-1px)',
  },
};

/* ─────────────────────────────────────────────────────────
   Badge helpers
   ───────────────────────────────────────────────────────── */

const CodeBadge = ({ code }: { code: string }) => (
  <Box
    component='span'
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.5,
      px: 1,
      py: '2px 8px',
      borderRadius: '4px',
      bgcolor: '#f1f5f9',
      border: '1px solid #e2e8f0',
    }}
  >
    <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#f97316' }} />
    <Typography
      component='span'
      sx={{
        fontSize: '0.78rem',
        fontWeight: 700,
        color: '#475569',
        textTransform: 'uppercase',
        letterSpacing: '0.3px',
      }}
    >
      {code.replace(/_/g, ' ').toUpperCase()}
    </Typography>
  </Box>
);

const YesNoBadge = ({ value }: { value: boolean }) => (
  <Box
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      px: 1,
      py: 0.35,
      borderRadius: '6px',
      fontSize: '0.7rem',
      fontWeight: 700,
      background: value ? '#dcfce7' : '#fef2f2',
      color: value ? '#16a34a' : '#dc2626',
      border: `1px solid ${value ? '#bbf7d0' : '#fecaca'}`,
    }}
  >
    {value ? 'Yes' : 'No'}
  </Box>
);

/* ─────────────────────────────────────────────────────────
   Resolution Card
   ───────────────────────────────────────────────────────── */

interface ResolutionCardProps {
  resolution: IResolution;
}

const ResolutionCard = ({ resolution }: ResolutionCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const hasExpandable =
    resolution.subCategory ||
    resolution.resolution ||
    resolution.internalNote ||
    resolution.isRecurring ||
    resolution.rootCauseIdentified;

  const avatarColor = getAvatarColor(resolution.createdBy);
  const initials = getInitials(resolution.createdBy);

  return (
    <Box
      sx={{
        mb: 1.5,
        borderRadius: 0,
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderLeft: '3px solid #f97316',
        overflow: 'hidden',
        transition: 'box-shadow 0.15s ease',
        '&:hover': { boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
      }}
    >
      {/* ── Header: Avatar | Email | Time | Actions ─ */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          px: 2,
          pt: 1.5,
          pb: 0.75,
        }}
      >
        {/* Left — Avatar + Email */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '4px',
              bgcolor: avatarColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Typography
              sx={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#fff',
                fontFamily: '"Roboto Mono", monospace',
              }}
            >
              {initials}
            </Typography>
          </Box>
          <Typography
            sx={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#374151',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {resolution.createdBy}
          </Typography>
        </Box>

        {/* Right — Type label + Timestamp + Action icons */}
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0, flexWrap: 'wrap' }}
        >
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#d97706' }}>
            Resolution
          </Typography>
          <Typography
            sx={{
              fontSize: '0.8rem',
              color: '#64748b',
              fontWeight: 500,
              fontFamily: '"Roboto Mono", monospace',
            }}
          >
            {formatDate(resolution.createdAt)}
          </Typography>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
            <Tooltip title='Copy'>
              <Box component='span' sx={actionIconSx}>
                <ContentCopyIcon sx={{ fontSize: 18 }} />
              </Box>
            </Tooltip>
            <Tooltip title='Pin'>
              <Box component='span' sx={actionIconSx}>
                <PushPinIcon sx={{ fontSize: 18 }} />
              </Box>
            </Tooltip>
            <Tooltip title='Bookmark'>
              <Box component='span' sx={actionIconSx}>
                <BookmarkBorderIcon sx={{ fontSize: 18 }} />
              </Box>
            </Tooltip>
            <Tooltip title='Edit'>
              <Box component='span' sx={actionIconSx}>
                <EditIcon sx={{ fontSize: 18 }} />
              </Box>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* ── Body: Key-Value Fields ─ */}
      <Box sx={{ px: '56px', pb: 1.5 }}>
        {/* Application */}
        {resolution.application && <FieldRow label='Application' value={resolution.application} />}

        {/* Resolution Code */}
        {resolution.resolutionCode && (
          <FieldRow
            label='Resolution Code'
            value={<CodeBadge code={resolution.resolutionCode} />}
          />
        )}

        {/* Category (with sub-category appended if present) */}
        {resolution.category && (
          <FieldRow
            label='Category'
            value={
              resolution.subCategory
                ? `${resolution.category} › ${resolution.subCategory}`
                : resolution.category
            }
          />
        )}

        {/* Sub-category (only if category is absent) */}
        {!resolution.category && resolution.subCategory && (
          <FieldRow label='Sub-category' value={resolution.subCategory} />
        )}

        {/* Customer Confirmation */}
        {resolution.customerConfirmation && (
          <FieldRow
            label='Customer Confirmation'
            value={
              <span style={{ color: '#059669', fontWeight: 600, fontSize: '0.85rem' }}>
                Confirmed
              </span>
            }
          />
        )}

        {/* Show More Details toggle */}
        {hasExpandable && (
          <Box sx={{ mt: 0.5 }}>
            <Box
              onClick={() => setExpanded(!expanded)}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                cursor: 'pointer',
                color: '#6366f1',
                fontSize: '0.8rem',
                fontWeight: 700,
                userSelect: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {expanded ? 'Show Less' : 'Show More Details'}
            </Box>
          </Box>
        )}

        {/* ── Expandable Section ─ */}
        {expanded && hasExpandable && (
          <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid #e2e8f0' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {/* Resolution text */}
              {resolution.resolution && (
                <Box sx={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                  <Typography
                    sx={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#475569',
                      whiteSpace: 'nowrap',
                      minWidth: 140,
                      flexShrink: 0,
                    }}
                  >
                    Resolution:
                  </Typography>
                  <Typography
                    sx={{
                      flex: 1,
                      fontSize: '0.85rem',
                      color: '#1e293b',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {resolution.resolution}
                  </Typography>
                </Box>
              )}

              {/* Internal Note */}
              {resolution.internalNote && (
                <Box sx={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                  <Typography
                    sx={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#475569',
                      whiteSpace: 'nowrap',
                      minWidth: 140,
                      flexShrink: 0,
                    }}
                  >
                    Internal Note:
                  </Typography>
                  <Typography
                    sx={{
                      flex: 1,
                      p: 1.5,
                      borderRadius: '6px',
                      bgcolor: '#fff7ed',
                      border: '1px solid #fed7aa',
                      fontSize: '0.84rem',
                      color: '#1e293b',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {resolution.internalNote}
                  </Typography>
                </Box>
              )}

              {/* Root Cause text */}
              {resolution.rootCause && (
                <Box sx={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                  <Typography
                    sx={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#475569',
                      whiteSpace: 'nowrap',
                      minWidth: 140,
                      flexShrink: 0,
                    }}
                  >
                    Root Cause:
                  </Typography>
                  <Typography
                    sx={{
                      flex: 1,
                      p: 1.5,
                      borderRadius: '6px',
                      bgcolor: '#fefce8',
                      border: '1px solid #fde68a',
                      fontSize: '0.84rem',
                      color: '#1e293b',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {resolution.rootCause}
                  </Typography>
                </Box>
              )}

              {/* Flags — vertical, one per row (no Customer Confirmation — already shown above) */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 0.5 }}>
                {resolution.isRecurring !== undefined && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      sx={{
                        fontSize: '0.82rem',
                        color: '#64748b',
                        fontWeight: 600,
                        minWidth: 140,
                        flexShrink: 0,
                      }}
                    >
                      Recurring Issue:
                    </Typography>
                    <YesNoBadge value={resolution.isRecurring} />
                  </Box>
                )}
                {resolution.rootCauseIdentified !== undefined && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      sx={{
                        fontSize: '0.82rem',
                        color: '#64748b',
                        fontWeight: 600,
                        minWidth: 140,
                        flexShrink: 0,
                      }}
                    >
                      Root Cause Identified:
                    </Typography>
                    <YesNoBadge value={resolution.rootCauseIdentified} />
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

/* ─────────────────────────────────────────────────────────
   Field Row helper — consistent key-value row
   ───────────────────────────────────────────────────────── */

const FieldRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Box sx={{ display: 'flex', gap: '8px', py: 0.5, alignItems: 'baseline' }}>
    <Typography
      sx={{
        fontSize: '0.85rem',
        fontWeight: 600,
        color: '#475569',
        whiteSpace: 'nowrap',
        minWidth: 140,
        flexShrink: 0,
        lineHeight: 1.5,
      }}
    >
      {label}:
    </Typography>
    <Typography
      sx={{
        fontSize: '0.85rem',
        color: '#1e293b',
        lineHeight: 1.5,
        wordBreak: 'break-word',
      }}
    >
      {value}
    </Typography>
  </Box>
);

/* ─────────────────────────────────────────────────────────
   Empty State — matches "Unfixed" screenshot
   ───────────────────────────────────────────────────────── */

const EmptyState = ({ onAdd }: { onAdd: () => void }) => (
  <Box
    sx={{
      borderRadius: 0,
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderLeft: '3px solid #f97316',
      overflow: 'hidden',
    }}
  >
    <Box
      sx={{
        px: 2,
        py: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        flexWrap: 'wrap',
      }}
    >
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          px: 1,
          py: '2px 8px',
          borderRadius: '4px',
          bgcolor: '#f1f5f9',
          border: '1px solid #e2e8f0',
        }}
      >
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#f97316' }} />
        <Typography
          sx={{
            fontSize: '0.78rem',
            fontWeight: 700,
            color: '#475569',
            textTransform: 'uppercase',
            letterSpacing: '0.3px',
          }}
        >
          Unfixed
        </Typography>
      </Box>

      <Typography sx={{ fontSize: '0.82rem', color: '#64748b' }}>
        No resolution has been added yet.
      </Typography>

      <Box sx={{ flex: 1 }} />

      <Box
        onClick={onAdd}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          px: 2,
          py: 0.5,
          borderRadius: '6px',
          border: '1.5px dashed #86efac',
          color: '#16a34a',
          background: '#f0fdf4',
          fontSize: '0.8rem',
          fontWeight: 600,
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'all 0.15s ease',
          '&:hover': { border: '1.5px solid #22c55e', background: '#dcfce7' },
        }}
      >
        <span style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1 }}>+</span>
        <span>Add Resolution</span>
      </Box>
    </Box>
  </Box>
);

/* ─────────────────────────────────────────────────────────
   Main Resolution Section
   ───────────────────────────────────────────────────────── */

const ResolutionSection = ({ resolutions, onAddResolution }: ResolutionSectionProps) => {
  return (
    <Box>
      {/* Section Header with Add Resolution button on top right */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: '0.82rem',
            color: '#475569',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
          }}
        >
          Resolution
        </Typography>

        <Box
          onClick={onAddResolution}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            px: 2,
            py: 0.5,
            borderRadius: '6px',
            border: '1.5px dashed #86efac',
            color: '#16a34a',
            background: '#f0fdf4',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            userSelect: 'none',
            transition: 'all 0.15s ease',
            '&:hover': { border: '1.5px solid #22c55e', background: '#dcfce7' },
          }}
        >
          <span style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1 }}>+</span>
          <span>Add Resolution</span>
        </Box>
      </Box>

      {/* Existing resolutions */}
      {resolutions.length > 0 &&
        resolutions.map((res) => <ResolutionCard key={res.id} resolution={res} />)}

      {/* Empty state */}
      {resolutions.length === 0 && <EmptyState onAdd={onAddResolution ?? (() => {})} />}
    </Box>
  );
};

export default ResolutionSection;
