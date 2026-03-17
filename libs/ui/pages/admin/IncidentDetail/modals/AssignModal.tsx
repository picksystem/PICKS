import { useState } from 'react';
import { Box, Modal, Button } from '../../../../components';
import { TextField } from '@mui/material';
import { IIncident, IncidentStatus } from '@picks/interfaces';
import { useUpdateIncidentMutation } from '../../../../../services';
import { useNotification } from '@picks/hooks';

interface AssignModalProps {
  open: boolean;
  onClose: () => void;
  incident: IIncident;
  onSuccess: () => void;
}

const AssignModal = ({ open, onClose, incident, onSuccess }: AssignModalProps) => {
  const [updateIncident, { isLoading }] = useUpdateIncidentMutation();
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
    try {
      await updateIncident({
        id: incident.id,
        data: {
          application: application || undefined,
          assignmentGroup: assignmentGroup || undefined,
          primaryResource,
          secondaryResources: secondaryResources || undefined,
          status: IncidentStatus.ASSIGNED,
        },
      }).unwrap();
      onSuccess();
    } catch {
      notify.error('Failed to assign incident');
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
    <Modal open={open} onClose={onClose} title='Assign Incident' maxWidth='sm' footer={footer}>
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
