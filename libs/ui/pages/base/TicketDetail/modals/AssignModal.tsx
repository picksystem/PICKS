import { useState } from 'react';
import { Box, Modal, Button, TextField, Typography } from '../../../../components';
import { Person as PersonIcon } from '@mui/icons-material';
import { alpha, darken } from '@mui/material';
import { useNotification } from '@serviceops/hooks';
import { TicketEntity, UpdateTicketFn } from '../types/ticketDetail.types';

const ASSIGN_ACCENT = '#0369a1';

interface AssignModalProps {
  open: boolean;
  onClose: () => void;
  incident: TicketEntity;
  onUpdateTicket: UpdateTicketFn;
  onSuccess: () => void;
}

const AssignModal = ({ open, onClose, incident, onUpdateTicket, onSuccess }: AssignModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [application, setApplication] = useState(incident.application || '');
  const [assignmentGroup, setAssignmentGroup] = useState(incident.assignmentGroup || '');
  const [primaryResource, setPrimaryResource] = useState(incident.primaryResource || '');
  const [secondaryResources, setSecondaryResources] = useState(incident.secondaryResources || '');
  const notify = useNotification();

  const handleSubmit = async () => {
    if (!primaryResource.trim()) {
      notify.error('Primary resource is required');
      return;
    }
    setIsLoading(true);
    try {
      await onUpdateTicket({
        id: incident.id,
        data: {
          application: application || undefined,
          assignmentGroup: assignmentGroup || undefined,
          primaryResource,
          secondaryResources: secondaryResources || undefined,
          status: 'assigned',
        },
      }).unwrap();
      onSuccess();
    } catch {
      notify.error('Failed to assign ticket');
    } finally {
      setIsLoading(false);
    }
  };

  const footer = (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
      <Button variant='outlined' onClick={onClose}>
        Cancel
      </Button>
      <Button variant='contained' onClick={handleSubmit} disabled={isLoading}>
        Update
      </Button>
    </Box>
  );

  const fieldBaseSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 1.5,
      bgcolor: alpha(ASSIGN_ACCENT, 0.03),
      '& fieldset': {
        borderColor: alpha(ASSIGN_ACCENT, 0.3),
        borderWidth: 1.5,
      },
      '&:hover fieldset': {
        borderColor: ASSIGN_ACCENT,
      },
      '&.Mui-focused fieldset': {
        borderColor: ASSIGN_ACCENT,
        borderWidth: 2,
      },
    },
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      headerBackground={`linear-gradient(135deg, ${darken(ASSIGN_ACCENT, 0.18)} 0%, ${ASSIGN_ACCENT} 100%)`}
      headerTextColor='#fff'
      title={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 1.5,
              bgcolor: 'rgba(255,255,255,0.18)',
              border: '1px solid rgba(255,255,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PersonIcon sx={{ fontSize: '1.1rem', color: '#fff' }} />
          </Box>
          <Box>
            <Typography
              sx={{ fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.3, color: '#fff' }}
            >
              Assign Ticket
            </Typography>
            <Typography
              sx={{
                fontSize: '0.78rem',
                color: 'rgba(255,255,255,0.85)',
                lineHeight: 1.3,
              }}
            >
              Assign this ticket to a resource and group
            </Typography>
          </Box>
        </Box>
      }
      footer={footer}
      maxWidth='sm'
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <TextField
          label='Application'
          value={application}
          onChange={(e) => setApplication(e.target.value)}
          size='small'
          fullWidth
          sx={fieldBaseSx}
        />

        <TextField
          label='Assignment Group'
          value={assignmentGroup}
          onChange={(e) => setAssignmentGroup(e.target.value)}
          size='small'
          fullWidth
          sx={fieldBaseSx}
        />

        <TextField
          label='Primary Resource'
          value={primaryResource}
          onChange={(e) => setPrimaryResource(e.target.value)}
          size='small'
          fullWidth
          required
          sx={fieldBaseSx}
        />

        <TextField
          label='Secondary Resource(s)'
          value={secondaryResources}
          onChange={(e) => setSecondaryResources(e.target.value)}
          size='small'
          fullWidth
          sx={fieldBaseSx}
        />
      </Box>
    </Modal>
  );
};

export default AssignModal;
