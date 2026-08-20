import { useState } from 'react';
import { Box, Typography, Button, Modal } from '../../../../components';
import { alpha, darken } from '@mui/material';
import {
  CloudUploadOutlined as CloudUploadOutlinedIcon,
  DeleteOutline as DeleteOutlineIcon,
} from '@mui/icons-material';
import { useNotification } from '@serviceops/hooks';
import { useUploadTicketAttachmentsMutation } from '../../../../../services';
import { TicketEntity, UpdateTicketFn } from '../types/ticketDetail.types';

const ATTACHMENT_ACCENT = '#0369a1';

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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
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
    if (selectedFiles.length === 0) {
      notify.error('Please select at least one file');
      return;
    }
    try {
      const formData = new FormData();
      selectedFiles.forEach((f) => formData.append('files', f));

      const uploadedFilenames = await uploadAttachments(formData).unwrap();

      const allAttachments = [...existingAttachments, ...uploadedFilenames];
      await onUpdateTicket({
        id: incident.id,
        data: { attachments: JSON.stringify(allAttachments) },
      }).unwrap();
      setSelectedFiles([]);
      onSuccess();
    } catch {
      notify.error('Failed to upload attachments');
    }
  };

  const handleClose = () => {
    setSelectedFiles([]);
    onClose();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (files && files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...Array.from(files)]);
    }
    event.target.value = '';
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
        disabled={selectedFiles.length === 0 || isUploading}
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

  const AttachmentIcon = CloudUploadOutlinedIcon;

  const title = (
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
        <AttachmentIcon sx={{ fontSize: '1.1rem', color: '#fff' }} />
      </Box>
      <Box>
        <Typography sx={{ fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.3, color: '#fff' }}>
          Attachments
        </Typography>
        <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.3 }}>
          Upload and manage ticket attachments
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={title}
      headerTextColor='#fff'
      footer={footer}
      maxWidth='sm'
      headerBackground={`linear-gradient(135deg, ${darken(ATTACHMENT_ACCENT, 0.18)} 0%, ${ATTACHMENT_ACCENT} 100%)`}
    >
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
              bgcolor: alpha(ATTACHMENT_ACCENT, 0.02),
              '&:hover': {
                borderColor: ATTACHMENT_ACCENT,
                bgcolor: alpha(ATTACHMENT_ACCENT, 0.04),
              },
            }}
          >
            <input
              type='file'
              className='attachment-upload-input'
              multiple
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <Box sx={{ mb: 0.75 }}>
              <CloudUploadOutlinedIcon sx={{ fontSize: 24, color: '#9ca3af' }} />
            </Box>
            <Button
              variant='contained'
              size='small'
              sx={{
                bgcolor: ATTACHMENT_ACCENT,
                '&:hover': { bgcolor: darken(ATTACHMENT_ACCENT, 0.15) },
                textTransform: 'none',
                px: 3,
                py: 0.75,
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: 1.5,
              }}
            >
              CHOOSE FILE
            </Button>
          </Box>
        </Box>

        {/* Attached files */}
        {selectedFiles.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151' }}>
              Attached Files ({selectedFiles.length})
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {selectedFiles.map((file, index) => (
                <Box
                  key={`${file.name}-${index}`}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    p: 1,
                    borderRadius: 1.5,
                    border: '1px solid #e5e7eb',
                    bgcolor: alpha(ATTACHMENT_ACCENT, 0.04),
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
                    <CloudUploadOutlinedIcon
                      sx={{ fontSize: '1.1rem', color: ATTACHMENT_ACCENT }}
                    />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        sx={{
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: '#1e293b',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {file.name}
                      </Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>
                        {(file.size / 1024).toFixed(1)} KB
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    onClick={() => setSelectedFiles((prev) => prev.filter((_, i) => i !== index))}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      p: 0.5,
                      borderRadius: 1,
                      color: '#dc2626',
                      '&:hover': { bgcolor: 'rgba(220, 38, 38, 0.08)' },
                    }}
                  >
                    <DeleteOutlineIcon sx={{ fontSize: '1.1rem' }} />
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default AttachmentModal;
