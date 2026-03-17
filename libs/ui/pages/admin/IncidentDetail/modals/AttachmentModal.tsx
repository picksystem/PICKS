import { useState } from 'react';
import { Box, Modal, Button, UploadFile } from '../../../../components';
import { Typography } from '@mui/material';
import { IIncident } from '@picks/interfaces';
import { useUpdateIncidentMutation } from '../../../../../services';
import { useNotification } from '@picks/hooks';

interface AttachmentModalProps {
  open: boolean;
  onClose: () => void;
  incident: IIncident;
  onSuccess: () => void;
}

const AttachmentModal = ({ open, onClose, incident, onSuccess }: AttachmentModalProps) => {
  const [updateIncident, { isLoading }] = useUpdateIncidentMutation();
  const notify = useNotification();
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const existingAttachments: string[] = (() => {
    try {
      return incident.attachments ? JSON.parse(incident.attachments) : [];
    } catch {
      return [];
    }
  })();

  const handleSubmit = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      notify.error('Please select at least one file');
      return;
    }
    try {
      const newFileNames = Array.from(selectedFiles).map((f) => f.name);
      const allAttachments = [...existingAttachments, ...newFileNames];
      await updateIncident({
        id: incident.id,
        data: { attachments: JSON.stringify(allAttachments) },
      }).unwrap();
      onSuccess();
    } catch {
      notify.error('Failed to update attachments');
    }
  };

  const footer = (
    <>
      <Button variant='outlined' onClick={onClose}>
        Cancel
      </Button>
      <Button variant='contained' onClick={handleSubmit} disabled={isLoading}>
        Upload
      </Button>
    </>
  );

  return (
    <Modal open={open} onClose={onClose} title='Attachments' maxWidth='sm' footer={footer}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {existingAttachments.length > 0 && (
          <Box>
            <Typography variant='subtitle2' sx={{ mb: 1 }}>
              Existing Attachments
            </Typography>
            {existingAttachments.map((att, idx) => (
              <Typography key={idx} variant='body2' sx={{ py: 0.5 }}>
                {att}
              </Typography>
            ))}
          </Box>
        )}

        <Box>
          <Typography variant='subtitle2' sx={{ mb: 1 }}>
            Add New Attachments
          </Typography>
          <UploadFile onChange={(files) => setSelectedFiles(files)} multiple />
        </Box>
      </Box>
    </Modal>
  );
};

export default AttachmentModal;
