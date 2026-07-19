import { useState } from 'react';
import {
  Box,
  Chip,
  EditIcon,
  LinearProgress,
  Typography,
  UserAvatar,
} from '../../../../components';
import { Popover } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { IIncident, ITicketTypeLayoutConfig } from '@serviceops/interfaces';
import { getDefaultLayoutConfig } from '@serviceops/tickettypelayout';
import {
  calculateSLA,
  getPriorityColor,
  getStatusColor,
  formatStatus,
} from '../utils/incidentDetail.utils';

interface InfoRowProps {
  classes: Record<string, string>;
  incident: IIncident;
  eta: Date | null;
  onEtaChange: (date: Date) => void;
  onPriorityClick?: () => void;
  layoutConfig?: ITicketTypeLayoutConfig;
}

const callerAvatarSx = {
  background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
  fontSize: '0.75rem',
  fontWeight: 700,
  boxShadow: '0 2px 8px rgba(99, 102, 241, 0.35)',
  cursor: 'pointer',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'scale(1.12)',
    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.5)',
  },
};

// Splits "John Smith" or "john@email.com" into { firstName, lastName }
const callerAsUser = (caller: string) => {
  const parts = caller.trim().split(/[\s@]+/);
  return { firstName: parts[0] || '?', lastName: parts[1] || '' };
};

const formatDate = (value: Date | string | null | undefined): string => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const InfoRow = ({
  classes,
  incident,
  eta,
  onEtaChange,
  onPriorityClick,
  layoutConfig = getDefaultLayoutConfig(),
}: InfoRowProps) => {
  const { dueDate, slaPercent } = calculateSLA(incident.createdAt);
  const [editingEta, setEditingEta] = useState(false);
  const [callerAnchor, setCallerAnchor] = useState<HTMLElement | null>(null);

  const handleEtaChange = (value: Dayjs | null) => {
    if (value?.isValid()) {
      onEtaChange(value.toDate());
    }
    setEditingEta(false);
  };

  const etaDisplay = eta ? new Date(eta).toLocaleDateString() : dueDate;
  const priorityChipSx = {
    height: 24,
    fontSize: '0.875rem',
    cursor: onPriorityClick ? 'pointer' : 'default',
  };

  // ── Every field this ticket type can show on the info bar, keyed to match
  // the field catalog managed from Configuration ▸ Ticket Types ▸ Layout.
  const fieldNodes: Record<string, React.ReactNode> = {
    affectedUser: (
      <Box key='affectedUser' className={classes.infoItem}>
        <Typography className={classes.infoLabel}>Affected User</Typography>
        <Box
          className={classes.infoCallerBox}
          onMouseEnter={(e: React.MouseEvent) => setCallerAnchor(e.currentTarget as HTMLElement)}
          onMouseLeave={() => setCallerAnchor(null)}
          sx={{ cursor: 'default' }}
        >
          <UserAvatar user={callerAsUser(incident.caller || '?')} size={30} sx={callerAvatarSx} />
          <Typography className={classes.infoCallerText}>{incident.caller || '—'}</Typography>
        </Box>

        {/* Caller details popover */}
        <Popover
          open={Boolean(callerAnchor)}
          anchorEl={callerAnchor}
          onClose={() => setCallerAnchor(null)}
          anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
          transformOrigin={{ vertical: 'center', horizontal: 'left' }}
          disableRestoreFocus
          sx={{ pointerEvents: 'none' }}
          slotProps={{
            paper: {
              sx: {
                pointerEvents: 'none',
                p: 1.5,
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                border: '1px solid rgba(226,232,255,0.8)',
                minWidth: 220,
              },
            },
          }}
        >
          <Typography
            sx={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#6366f1',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              mb: 1,
            }}
          >
            {incident.caller || '—'}
          </Typography>
          {[
            {
              icon: <EmailIcon sx={{ fontSize: '0.9rem', color: '#6366f1' }} />,
              label: 'Email',
              value: incident.callerEmail,
            },
            {
              icon: <PhoneIcon sx={{ fontSize: '0.9rem', color: '#10b981' }} />,
              label: 'Phone',
              value: incident.callerPhone,
            },
            {
              icon: <BusinessIcon sx={{ fontSize: '0.9rem', color: '#f59e0b' }} />,
              label: 'Department',
              value: incident.callerDepartment,
            },
            {
              icon: <LocationOnIcon sx={{ fontSize: '0.9rem', color: '#ef4444' }} />,
              label: 'Work Location',
              value: incident.callerLocation,
            },
            {
              icon: <SupervisorAccountIcon sx={{ fontSize: '0.9rem', color: '#8b5cf6' }} />,
              label: 'Reporting Manager',
              value: incident.callerReportingManager,
            },
          ].map(({ icon, label, value }) => (
            <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
              {icon}
              <Typography sx={{ fontSize: '0.72rem', color: '#64748b', minWidth: 110 }}>
                {label}:
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#1e293b' }}>
                {value || '—'}
              </Typography>
            </Box>
          ))}
        </Popover>
      </Box>
    ),

    status: (
      <Box key='status' className={classes.infoItem}>
        <Typography className={classes.infoLabel}>Status</Typography>
        <Chip
          label={formatStatus(incident.status)}
          color={getStatusColor(incident.status)}
          size='small'
          sx={{ height: 24, fontSize: '0.875rem' }}
        />
      </Box>
    ),

    priority: (
      <Box key='priority' className={classes.infoItem}>
        <Typography className={classes.infoLabel}>Priority</Typography>
        <Chip
          label={incident.priority || 'N/A'}
          color={getPriorityColor(incident.priority || '')}
          size='small'
          sx={priorityChipSx}
          onClick={onPriorityClick}
        />
      </Box>
    ),

    queue: (
      <Box key='queue' className={classes.infoItem}>
        <Typography className={classes.infoLabel}>Queue</Typography>
        <Typography className={classes.infoValue}>{incident.assignmentGroup || '-'}</Typography>
      </Box>
    ),

    assignedTo: (
      <Box key='assignedTo' className={classes.infoItem}>
        <Typography className={classes.infoLabel}>Assigned to</Typography>
        <Typography className={classes.infoValue}>{incident.primaryResource || '-'}</Typography>
      </Box>
    ),

    due: (
      <Box key='due' className={classes.infoItem}>
        <Typography className={classes.infoLabel}>Due</Typography>
        <Typography className={classes.infoValue}>{dueDate}</Typography>
      </Box>
    ),

    sla: (
      <Box key='sla' className={classes.infoItem}>
        <Typography className={classes.infoLabel}>SLA</Typography>
        <Box className={classes.slaBar}>
          <LinearProgress
            variant='determinate'
            value={slaPercent}
            color={slaPercent > 50 ? 'success' : slaPercent > 20 ? 'warning' : 'error'}
            className={classes.slaProgress}
          />
          <Typography className={classes.slaPercent}>{slaPercent}%</Typography>
        </Box>
      </Box>
    ),

    eta: (
      <Box key='eta' className={classes.infoItem}>
        <Typography className={classes.infoLabel}>ETA</Typography>
        {editingEta ? (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={eta ? dayjs(eta) : dayjs(dueDate)}
              onChange={handleEtaChange}
              onClose={() => setEditingEta(false)}
              open={editingEta}
              slotProps={{
                textField: {
                  size: 'small',
                  variant: 'standard',
                  className: classes.etaTextField,
                  onBlur: () => setEditingEta(false),
                  sx: { fontSize: '0.875rem' },
                },
              }}
            />
          </LocalizationProvider>
        ) : (
          <Box className={classes.etaEditable} onClick={() => setEditingEta(true)}>
            <Typography className={classes.infoValue}>{etaDisplay}</Typography>
            <EditIcon className={`${classes.etaEditIcon} eta-edit-icon`} />
          </Box>
        )}
      </Box>
    ),

    client: (
      <Box key='client' className={classes.infoItem}>
        <Typography className={classes.infoLabel}>Client</Typography>
        <Typography className={classes.infoValue}>{incident.client || '-'}</Typography>
      </Box>
    ),

    clientContacts: (
      <Box key='clientContacts' className={classes.infoItem}>
        <Typography className={classes.infoLabel}>Client contacts</Typography>
        <Typography className={classes.infoValue}>{incident.additionalContacts || '-'}</Typography>
      </Box>
    ),

    created: (
      <Box key='created' className={classes.infoItem}>
        <Typography className={classes.infoLabel}>Created</Typography>
        <Typography className={classes.infoValue}>{formatDate(incident.createdAt)}</Typography>
      </Box>
    ),

    lastUpdated: (
      <Box key='lastUpdated' className={classes.infoItem}>
        <Typography className={classes.infoLabel}>Last updated</Typography>
        <Typography className={classes.infoValue}>{formatDate(incident.updatedAt)}</Typography>
      </Box>
    ),
  };

  const visibleKeys = layoutConfig.infoBar.selectedFields
    .filter((key) => key in fieldNodes)
    .slice(0, layoutConfig.infoBar.maxFields);

  return <Box className={classes.infoRow}>{visibleKeys.map((key) => fieldNodes[key])}</Box>;
};

export default InfoRow;
