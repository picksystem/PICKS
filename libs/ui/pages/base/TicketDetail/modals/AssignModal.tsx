import { useState } from 'react';
import { Box, Modal, Button, TextField } from '../../../../components';
import { useNotification } from '@serviceops/hooks';
import { TicketEntity, UpdateTicketFn } from '../types/ticketDetail.types';

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

  return (
    <Modal open={open} onClose={onClose} title='Assign Ticket' maxWidth='sm' footer={footer}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label='Application'
          value={application}
          onChange={(e) => setApplication(e.target.value)}
          size='small'
          fullWidth
        />

        <TextField
          label='Assignment Group'
          value={assignmentGroup}
          onChange={(e) => setAssignmentGroup(e.target.value)}
          size='small'
          fullWidth
        />

        <TextField
          label='Primary Resource'
          value={primaryResource}
          onChange={(e) => setPrimaryResource(e.target.value)}
          size='small'
          fullWidth
          required
        />

        <TextField
          label='Secondary Resource(s)'
          value={secondaryResources}
          onChange={(e) => setSecondaryResources(e.target.value)}
          size='small'
          fullWidth
        />
      </Box>
    </Modal>
  );
};

export default AssignModal;
