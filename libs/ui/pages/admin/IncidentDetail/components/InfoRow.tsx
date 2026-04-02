import { useState } from 'react';
import { Box, Chip, EditIcon, LinearProgress, Tooltip, UserAvatar } from '../../../../components';
import { Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { IIncident } from '@serviceops/interfaces';
import { calculateSLA, getPriorityColor } from '../utils/incidentDetail.utils';

interface InfoRowProps {
  classes: Record<string, string>;
  incident: IIncident;
  eta: Date | null;
  onEtaChange: (date: Date) => void;
  onPriorityClick?: () => void;
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

const InfoRow = ({ classes, incident, eta, onEtaChange, onPriorityClick }: InfoRowProps) => {
  const { dueDate, slaPercent } = calculateSLA(incident.createdAt);
  const [editingEta, setEditingEta] = useState(false);

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

  return (
    <Box className={classes.infoRow}>
      {/* Caller */}
      <Box className={classes.infoItem}>
        <Typography className={classes.infoLabel}>Caller</Typography>
        <Tooltip title={incident.caller || 'Unknown'}>
          <Box className={classes.infoCallerBox}>
            <UserAvatar user={callerAsUser(incident.caller || '?')} size={30} sx={callerAvatarSx} />
            <Typography className={classes.infoCallerText}>{incident.caller || '—'}</Typography>
          </Box>
        </Tooltip>
      </Box>

      {/* Priority (clickable chip) */}
      <Box className={classes.infoItem}>
        <Typography className={classes.infoLabel}>Priority</Typography>
        <Chip
          label={incident.priority || 'N/A'}
          color={getPriorityColor(incident.priority || '')}
          size='small'
          sx={priorityChipSx}
          onClick={onPriorityClick}
        />
      </Box>

      {/* Queue */}
      <Box className={classes.infoItem}>
        <Typography className={classes.infoLabel}>Queue</Typography>
        <Typography className={classes.infoValue}>{incident.assignmentGroup || '-'}</Typography>
      </Box>

      {/* Primary Resource */}
      <Box className={classes.infoItem}>
        <Typography className={classes.infoLabel}>Primary Resource</Typography>
        <Typography className={classes.infoValue}>{incident.primaryResource || '-'}</Typography>
      </Box>

      {/* Due Date */}
      <Box className={classes.infoItem}>
        <Typography className={classes.infoLabel}>Due</Typography>
        <Typography className={classes.infoValue}>{dueDate}</Typography>
      </Box>

      {/* SLA */}
      <Box className={classes.infoItem}>
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

      {/* ETA (editable) */}
      <Box className={classes.infoItem}>
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
    </Box>
  );
};

export default InfoRow;
