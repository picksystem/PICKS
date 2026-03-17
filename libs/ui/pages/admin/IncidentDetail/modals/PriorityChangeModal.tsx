import { useState, useMemo } from 'react';
import { Box, Modal, Select, Button, UploadFile, Alert } from '../../../../components';
import { Typography, TextField } from '@mui/material';
import {
  IIncident,
  IncidentImpact,
  IncidentUrgency,
  PriorityChangeReasonCode,
  calculatePriority,
} from '@picks/interfaces';
import { useUpdateIncidentMutation, useUploadAttachmentsMutation } from '../../../../../services';
import { useNotification } from '@picks/hooks';

interface PriorityChangeModalProps {
  open: boolean;
  onClose: () => void;
  incident: IIncident;
  onSuccess: () => void;
}

const impactOptions = Object.values(IncidentImpact).map((v) => ({
  label: v.charAt(0).toUpperCase() + v.slice(1),
  value: v,
}));

const urgencyOptions = Object.values(IncidentUrgency).map((v) => ({
  label: v.charAt(0).toUpperCase() + v.slice(1),
  value: v,
}));

const reasonCodeOptions = Object.values(PriorityChangeReasonCode).map((v) => ({
  label: v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  value: v,
}));

const PriorityChangeModal = ({ open, onClose, incident, onSuccess }: PriorityChangeModalProps) => {
  const [updateIncident, { isLoading }] = useUpdateIncidentMutation();
  const [uploadAttachments, { isLoading: isUploading }] = useUploadAttachmentsMutation();
  const [newImpact, setNewImpact] = useState<string>(incident.impact || '');
  const [newUrgency, setNewUrgency] = useState<string>(incident.urgency || '');
  const [reasonCode, setReasonCode] = useState<string>('');
  const [note, setNote] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const notify = useNotification();

  const calculatedPriority = useMemo(() => {
    if (newImpact && newUrgency) {
      return calculatePriority(newImpact as IncidentImpact, newUrgency as IncidentUrgency);
    }
    return incident.priority || '';
  }, [newImpact, newUrgency, incident.priority]);

  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!reasonCode) {
      notify.error('Reason code is required');
      return;
    }
    if (!note.trim()) {
      notify.error('Note is required');
      return;
    }
    try {
      // Upload attachment if selected
      let updatedAttachments: string[] = [];
      try {
        const existing: string[] = incident.attachments ? JSON.parse(incident.attachments) : [];
        updatedAttachments = [...existing];
      } catch {
        updatedAttachments = [];
      }

      if (selectedFile) {
        const formData = new FormData();
        formData.append('files', selectedFile);
        const uploadedNames = await uploadAttachments(formData).unwrap();
        updatedAttachments = [...updatedAttachments, ...uploadedNames];
      }

      await updateIncident({
        id: incident.id,
        data: {
          ...(newImpact && { impact: newImpact as IncidentImpact }),
          ...(newUrgency && { urgency: newUrgency as IncidentUrgency }),
          ...(calculatedPriority && { priority: calculatedPriority }),
          notes: note,
          ...(updatedAttachments.length > 0 && {
            attachments: JSON.stringify(updatedAttachments),
          }),
        },
      }).unwrap();
      onSuccess();
      onClose();
    } catch {
      notify.error('Failed to update priority');
    }
  };

  const footer = (
    <>
      <Button variant='outlined' onClick={onClose}>
        Cancel
      </Button>
      <Button variant='contained' onClick={handleSubmit} disabled={isLoading || isUploading}>
        {isUploading ? 'Uploading...' : isLoading ? 'Updating...' : 'Update'}
      </Button>
    </>
  );

  return (
    <Modal open={open} onClose={onClose} title='Change Priority' maxWidth='sm' footer={footer}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Alert severity='warning'>
          Changing the priority of an incident requires approval and documentation.
        </Alert>

        <TextField
          label='Current Priority'
          value={incident.priority || 'N/A'}
          disabled
          size='small'
          fullWidth
        />

        <Select
          label='Impact'
          options={impactOptions}
          value={newImpact}
          onChange={(e) => setNewImpact(e.target.value as string)}
        />

        <Select
          label='Urgency'
          options={urgencyOptions}
          value={newUrgency}
          onChange={(e) => setNewUrgency(e.target.value as string)}
        />

        <TextField
          label='Calculated Priority'
          value={calculatedPriority}
          disabled
          size='small'
          fullWidth
        />

        <Select
          label='Priority Change Reason Code'
          options={reasonCodeOptions}
          value={reasonCode}
          onChange={(e) => setReasonCode(e.target.value as string)}
        />

        <TextField
          label='Priority Change Note'
          value={note}
          onChange={(e) => setNote(e.target.value)}
          multiline
          rows={3}
          size='small'
          fullWidth
          required
        />

        <Box>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
            Attachment (optional)
          </Typography>
          <UploadFile onChange={handleFileChange} />
          {selectedFile && (
            <Typography variant='caption' color='text.secondary' sx={{ mt: 0.5, display: 'block' }}>
              Selected: {selectedFile.name}
            </Typography>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default PriorityChangeModal;
