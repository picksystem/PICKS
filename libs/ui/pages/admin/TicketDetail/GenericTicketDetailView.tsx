import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Chip, Divider, IconButton, Tooltip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import BuildIcon from '@mui/icons-material/Build';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import BugReportIcon from '@mui/icons-material/BugReport';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { Loader } from '../../../components';
import { useGetTicketByNumberQuery } from '@picks/services';
import { constants } from '@picks/utils';
import { IServiceRequest, IAdvisoryRequest } from '@picks/interfaces';

// ── Helpers ────────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  string,
  { label: string; gradient: string; shadow: string; Icon: React.ElementType }
> = {
  service_request: {
    label: 'Service Request',
    gradient: 'linear-gradient(135deg, #1565c0 0%, #1976d2 50%, #42a5f5 100%)',
    shadow: 'rgba(21,101,192,0.35)',
    Icon: BuildIcon,
  },
  advisory_request: {
    label: 'Advisory Request',
    gradient: 'linear-gradient(135deg, #006064 0%, #00838f 50%, #26c6da 100%)',
    shadow: 'rgba(0,96,100,0.35)',
    Icon: LightbulbIcon,
  },
  change_request: {
    label: 'Change Request',
    gradient: 'linear-gradient(135deg, #4527a0 0%, #5e35b1 50%, #9575cd 100%)',
    shadow: 'rgba(69,39,160,0.35)',
    Icon: SwapHorizIcon,
  },
  problem_request: {
    label: 'Problem Request',
    gradient: 'linear-gradient(135deg, #bf360c 0%, #d84315 50%, #ff7043 100%)',
    shadow: 'rgba(191,54,12,0.35)',
    Icon: BugReportIcon,
  },
  task: {
    label: 'Task',
    gradient: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #66bb6a 100%)',
    shadow: 'rgba(27,94,32,0.35)',
    Icon: TaskAltIcon,
  },
};

const getStatusColor = (status: string) => {
  if (status === 'draft') return 'secondary';
  if (status === 'new') return 'info';
  if (status === 'in_progress' || status === 'assigned') return 'warning';
  if (status === 'on_hold') return 'primary';
  if (status === 'resolved' || status === 'closed') return 'success';
  if (status === 'cancelled') return 'error';
  return 'default' as const;
};

const formatStatus = (status: string) =>
  status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const formatDate = (date?: Date | string | null) => (date ? new Date(date).toLocaleString() : '-');

// ── Sub-components ─────────────────────────────────────────────────────────────

const InfoRow = ({ label, value }: { label: string; value?: string | number | null }) => (
  <Box sx={{ mb: 1.5 }}>
    <Typography variant='caption' color='text.secondary' fontWeight={600} display='block'>
      {label}
    </Typography>
    <Typography variant='body2' color='text.primary'>
      {value || '-'}
    </Typography>
  </Box>
);

// ── Main component ─────────────────────────────────────────────────────────────

interface GenericTicketDetailViewProps {
  ticketType: string;
}

const GenericTicketDetailView = ({ ticketType }: GenericTicketDetailViewProps) => {
  const { number } = useParams<{ number: string }>();
  const navigate = useNavigate();
  const { AdminPath } = constants;

  const {
    data: ticket,
    isLoading,
    error,
  } = useGetTicketByNumberQuery(number || '', {
    skip: !number,
  });

  const config = TYPE_CONFIG[ticketType] ?? TYPE_CONFIG.service_request;
  const { Icon } = config;

  const handleBack = () => navigate(AdminPath.INCIDENT_MANAGEMENT);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
        }}
      >
        <Loader />
      </Box>
    );
  }

  if (error || !ticket) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color='error'>
          {error ? 'Failed to load ticket details.' : `Ticket "${number}" not found.`}
        </Typography>
      </Box>
    );
  }

  const t = ticket as (IServiceRequest | IAdvisoryRequest) & { ticketType: string };

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2, md: 2.5 },
        background: 'linear-gradient(145deg, #eef2ff 0%, #f8faff 50%, #eff6ff 100%)',
        minHeight: '100vh',
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          background: config.gradient,
          boxShadow: `0 8px 32px ${config.shadow}`,
          borderRadius: 3,
          mb: 2,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Tooltip title='Back'>
            <IconButton
              size='small'
              onClick={handleBack}
              sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: '#fff' } }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>

          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon sx={{ color: '#fff', fontSize: '1.3rem' }} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography
                variant='h6'
                sx={{ color: '#fff', fontWeight: 800, fontSize: { xs: '1rem', sm: '1.15rem' } }}
              >
                {t.number}
              </Typography>
              <Tooltip title='Copy number'>
                <IconButton
                  size='small'
                  sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff' } }}
                  onClick={() => navigator.clipboard.writeText(t.number)}
                >
                  <ContentCopyIcon sx={{ fontSize: '0.9rem' }} />
                </IconButton>
              </Tooltip>
              <Chip
                label={formatStatus(t.status)}
                color={getStatusColor(t.status)}
                size='small'
                sx={{
                  height: 22,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  border: '1px solid rgba(255,255,255,0.3)',
                  '& .MuiChip-label': { px: 1 },
                }}
              />
              <Chip
                label={config.label}
                size='small'
                sx={{
                  height: 22,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  background: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.3)',
                  '& .MuiChip-label': { px: 1 },
                }}
              />
            </Box>
            <Typography
              variant='body2'
              sx={{
                color: 'rgba(255,255,255,0.85)',
                mt: 0.25,
                fontSize: '0.85rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {t.shortDescription || '—'}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Left column — description + categorization */}
        <Box sx={{ flex: '1 1 0', minWidth: 0 }}>
          {/* Description card */}
          <Paper
            elevation={0}
            sx={{ borderRadius: 2, p: 2.5, mb: 2, border: '1px solid rgba(0,0,0,0.06)' }}
          >
            <Typography variant='subtitle2' fontWeight={700} mb={1.5}>
              Description
            </Typography>
            <Typography variant='body2' color='text.secondary' whiteSpace='pre-wrap'>
              {t.description || 'No description provided.'}
            </Typography>
          </Paper>

          {/* Categorization card */}
          <Paper
            elevation={0}
            sx={{ borderRadius: 2, p: 2.5, border: '1px solid rgba(0,0,0,0.06)' }}
          >
            <Typography variant='subtitle2' fontWeight={700} mb={1.5}>
              Categorization
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Box sx={{ flex: 1 }}>
                <InfoRow label='Business Category' value={t.businessCategory} />
                <InfoRow label='Service Line' value={t.serviceLine} />
                <InfoRow label='Application' value={t.application} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <InfoRow label='Application Category' value={t.applicationCategory} />
                <InfoRow label='Application Sub-category' value={t.applicationSubCategory} />
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Right column — ticket details */}
        <Box sx={{ width: { xs: '100%', md: '320px' }, flexShrink: 0 }}>
          <Paper
            elevation={0}
            sx={{ borderRadius: 2, p: 2.5, border: '1px solid rgba(0,0,0,0.06)' }}
          >
            <Typography variant='subtitle2' fontWeight={700} mb={1.5}>
              Ticket Details
            </Typography>

            <InfoRow label='Caller' value={t.caller} />
            <InfoRow label='Caller Email' value={t.callerEmail} />
            <InfoRow label='Caller Phone' value={t.callerPhone} />
            <InfoRow label='Caller Location' value={t.callerLocation} />
            <InfoRow label='Caller Department' value={t.callerDepartment} />

            <Divider sx={{ my: 1.5 }} />

            <InfoRow label='Impact' value={t.impact} />
            <InfoRow label='Urgency' value={t.urgency} />
            <InfoRow label='Priority' value={t.priority} />
            <InfoRow label='Status' value={formatStatus(t.status)} />

            <Divider sx={{ my: 1.5 }} />

            <InfoRow label='Assignment Group' value={t.assignmentGroup} />
            <InfoRow label='Primary Resource' value={t.primaryResource} />
            <InfoRow label='Secondary Resources' value={t.secondaryResources} />

            <Divider sx={{ my: 1.5 }} />

            <InfoRow label='Client' value={t.client} />
            <InfoRow label='Created By' value={t.createdBy} />
            <InfoRow label='Created At' value={formatDate(t.createdAt)} />
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default GenericTicketDetailView;
