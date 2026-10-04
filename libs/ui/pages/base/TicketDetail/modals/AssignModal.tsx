import { useState } from 'react';
import { Box, Modal, Button, Typography } from '../../../../components';
import { Person as PersonIcon } from '@mui/icons-material';
import { darken } from '@mui/material';
import { useFieldError } from '@serviceops/hooks';
import { TicketEntity, UpdateTicketFn } from '../types/ticketDetail.types';
import { ApplicationSearchField } from '../../Configuration/shared/GenericPanel/components/ApplicationSearchField';
import { QueueSearchField } from '../../Configuration/shared/GenericPanel/components/QueueSearchField';
import { ConsultantSearchField } from '../../Configuration/shared/GenericPanel/components/ConsultantSearchField/ConsultantSearchField';

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
  const [selectedResources, setSelectedResources] = useState<string[]>(() => {
    const primary = incident.primaryResource;
    return primary
      ? [
          primary,
          ...(incident.secondaryResources
            ?.split(',')
            .map((s) => s.trim())
            .filter(Boolean) ?? []),
        ]
      : [];
  });
  const [primaryIndex, setPrimaryIndex] = useState(0);
  const reqError = useFieldError();
  const [touchedPrimaryResource, setTouchedPrimaryResource] = useState(false);
  const [primaryResourceError, setPrimaryResourceError] = useState<string>();

  const setSelectedResourcesWrapped = (val: string | string[]) => {
    const next = Array.isArray(val) ? val : [val].filter(Boolean);
    setSelectedResources(next);
    // Clamp primaryIndex if it's now out of range
    setPrimaryIndex((prev) => Math.min(prev, next.length > 0 ? next.length - 1 : 0));
  };

  const handleSubmit = async () => {
    if (selectedResources.length === 0) {
      setTouchedPrimaryResource(true);
      setPrimaryResourceError('required');
      return;
    }
    setIsLoading(true);
    try {
      const resources = [...selectedResources];
      if (resources.length > 0 && primaryIndex >= resources.length) {
        // Move first item to primary position
        const [moved] = resources.splice(primaryIndex, 1);
        resources.unshift(moved);
      }
      await onUpdateTicket({
        id: incident.id,
        data: {
          application: application || undefined,
          assignmentGroup: assignmentGroup || undefined,
          primaryResource: resources[0],
          secondaryResources: resources.length > 1 ? resources.slice(1).join(', ') : undefined,
          status: 'assigned',
        },
      }).unwrap();
      onSuccess();
    } catch {
      // API error — handled by onUpdateTicket's toast/notification
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
        Assign
      </Button>
    </Box>
  );

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
              Assign a ticket
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
        <ApplicationSearchField
          label='Application'
          value={application}
          onChange={setApplication}
          required={false}
        />

        <QueueSearchField
          label='Queue'
          value={assignmentGroup}
          onChange={setAssignmentGroup}
          required={false}
        />

        <ConsultantSearchField
          label='Assigned to'
          value={selectedResources}
          onChange={setSelectedResourcesWrapped}
          multiple
          primaryIndex={primaryIndex}
          onPrimaryChange={setPrimaryIndex}
          required
          error={touchedPrimaryResource && Boolean(primaryResourceError)}
          helperText={reqError(touchedPrimaryResource, primaryResourceError)}
        />
      </Box>
    </Modal>
  );
};

export default AssignModal;
