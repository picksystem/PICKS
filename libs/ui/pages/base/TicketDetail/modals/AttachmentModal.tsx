import { useState } from 'react';
import { Box, Typography, Button, Modal } from '../../../../components';
import { alpha, darken } from '@mui/material';
import { useNotification } from '@serviceops/hooks';
import { useUploadTicketAttachmentsMutation } from '../../../../../services';
import { TicketEntity, UpdateTicketFn } from '../types/ticketDetail.types';

const ATTACHMENT_ACCENT = '#2d5ebb';

interface AttachmentModalProps {
  open: boolean;
  onClose: () => void;
  incident: TicketEntity;
  onUpdateTicket: UpdateTicketFn;
  onSuccess: () => void;
}

const AttachmentModal = ({
  open,
  onClose,
  incident,
  onUpdateTicket,
  onSuccess,
}: AttachmentModalProps) => {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const notify = useNotification();
  const [uploadAttachments, { isLoading: isUploading }] = useUploadTicketAttachmentsMutation();

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
      const formData = new FormData();
      Array.from(selectedFiles).forEach((f) => formData.append('files', f));

      // Upload files to backend — gets back server-renamed filenames (e.g. "1755504000000-report.pdf")
      const uploadedFilenames = await uploadAttachments(formData).unwrap();

      const allAttachments = [...existingAttachments, ...uploadedFilenames];
      await onUpdateTicket({
        id: incident.id,
        data: { attachments: JSON.stringify(allAttachments) },
      }).unwrap();
      setSelectedFiles(null);
      onSuccess();
    } catch {
      notify.error('Failed to upload attachments');
    }
  };

  const handleClose = () => {
    setSelectedFiles(null);
    onClose();
  };

  const handleFileChange = (files: FileList | null) => {
    setSelectedFiles(files);
  };

  const footer = (
    <>
      <Button
        onClick={handleClose}
        variant='outlined'
        sx={{
          textTransform: 'none',
          width: { xs: '100%', sm: 'auto' },
          borderColor: alpha(ATTACHMENT_ACCENT, 0.4),
          color: darken(ATTACHMENT_ACCENT, 0.15),
          '&:hover': {
            borderColor: ATTACHMENT_ACCENT,
            bgcolor: alpha(ATTACHMENT_ACCENT, 0.04),
          },
        }}
      >
        Cancel
      </Button>
      <Button
        onClick={handleSubmit}
        disabled={!selectedFiles || selectedFiles.length === 0 || isUploading}
        variant='contained'
        sx={{
          textTransform: 'none',
          width: { xs: '100%', sm: 'auto' },
          bgcolor: ATTACHMENT_ACCENT,
          '&:hover': { bgcolor: darken(ATTACHMENT_ACCENT, 0.15) },
          '&.Mui-disabled': {
            bgcolor: alpha(ATTACHMENT_ACCENT, 0.4),
          },
        }}
      >
        {isUploading ? 'Uploading...' : 'Upload'}
      </Button>
    </>
  );

  return (
    <Modal open={open} onClose={handleClose} title='Attachments' footer={footer} maxWidth='sm'>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
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
          <Box
            onClick={() =>
              document.querySelector<HTMLInputElement>('.attachment-upload-input')?.click()
            }
            sx={{
              border: '2px dashed #ccc',
              borderRadius: 1,
              p: '24px 16px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
              '&:hover': {
                borderColor: ATTACHMENT_ACCENT,
                bgcolor: alpha(ATTACHMENT_ACCENT, 0.02),
              },
            }}
          >
            <input
              type='file'
              className='attachment-upload-input'
              multiple
              style={{ display: 'none' }}
              onChange={(event) => handleFileChange(event.target.files)}
            />
            <Button
              variant='contained'
              sx={{
                bgcolor: '#2d5ebb',
                '&:hover': { bgcolor: '#1e40af' },
                textTransform: 'none',
                px: 2.5,
                py: 0.5,
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              CHOOSE FILE
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default AttachmentModal;
