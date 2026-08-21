import { useState, useMemo } from 'react';
import { Box, Modal, Button, Alert, Typography, TextField } from '../../../../components';
import {
  WarningAmber as WarningAmberIcon,
  CloudUploadOutlined as CloudUploadOutlinedIcon,
  DeleteOutline as DeleteOutlineIcon,
} from '@mui/icons-material';
import { alpha, darken } from '@mui/material';
import { IncidentImpact, IncidentUrgency, calculatePriority } from '@serviceops/interfaces';
import { useUploadTicketAttachmentsMutation } from '../../../../../services';
import { useNotification } from '@serviceops/hooks';
import { TicketEntity, UpdateTicketFn } from '../types/ticketDetail.types';
import {
  parseRichText,
  serializeRichText,
  RichTextEditor,
} from '../../../../pages/base/Configuration/shared/RichTextEditor';
import { ImpactSearchField } from '../../../../pages/base/Configuration/shared/GenericPanel/components/ImpactSearchField/ImpactSearchField';
import { UrgencySearchField } from '../../../../pages/base/Configuration/shared/GenericPanel/components/UrgencySearchField/UrgencySearchField';
import { ReasonCodeSearchField } from '../../../../pages/base/Configuration/shared/GenericPanel/components/ReasonCodeSearchField/ReasonCodeSearchField';

const PRIORITY_ACCENT = '#2d5ebb';

interface PriorityChangeModalProps {
  open: boolean;
  onClose: () => void;
  incident: TicketEntity;
  onUpdateTicket: UpdateTicketFn;
  onSuccess: () => void;
}

const PriorityChangeModal = ({
  open,
  onClose,
  incident,
  onUpdateTicket,
  onSuccess,
}: PriorityChangeModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadAttachments, { isLoading: isUploading }] = useUploadTicketAttachmentsMutation();
  const [newImpact, setNewImpact] = useState<string>(incident.impact || '');
  const [newUrgency, setNewUrgency] = useState<string>(incident.urgency || '');
  const [reasonCode, setReasonCode] = useState<string>('');
  const [note, setNote] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const notify = useNotification();

  const calculatedPriority = useMemo(() => {
    if (newImpact && newUrgency) {
      return calculatePriority(newImpact as IncidentImpact, newUrgency as IncidentUrgency);
    }
    return incident.priority || '';
  }, [newImpact, newUrgency, incident.priority]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files;
    if (selected && selected.length > 0) {
      setFiles((prev) => [...prev, ...Array.from(selected)]);
    }
    event.target.value = '';
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
      let updatedAttachments: string[] = [];
      try {
        const existing: string[] = incident.attachments ? JSON.parse(incident.attachments) : [];
        updatedAttachments = [...existing];
      } catch {
        updatedAttachments = [];
      }

      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((f) => formData.append('files', f));
        const uploadedNames = await uploadAttachments(formData).unwrap();
        updatedAttachments = [...updatedAttachments, ...uploadedNames];
      }

      setIsLoading(true);
      await onUpdateTicket({
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
    } finally {
      setIsLoading(false);
    }
  };

  const footer = (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
      <Button
        variant='outlined'
        onClick={onClose}
        sx={{
          textTransform: 'none',
          borderColor: alpha(PRIORITY_ACCENT, 0.4),
          color: darken(PRIORITY_ACCENT, 0.15),
          '&:hover': {
            borderColor: PRIORITY_ACCENT,
            bgcolor: alpha(PRIORITY_ACCENT, 0.04),
          },
        }}
      >
        Cancel
      </Button>
      <Button
        variant='contained'
        onClick={handleSubmit}
        disabled={isLoading || isUploading}
        sx={{
          textTransform: 'none',
          bgcolor: PRIORITY_ACCENT,
          '&:hover': { bgcolor: darken(PRIORITY_ACCENT, 0.15) },
        }}
      >
        {isUploading ? 'Uploading...' : isLoading ? 'Updating...' : 'Update'}
      </Button>
    </Box>
  );

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
        <WarningAmberIcon sx={{ fontSize: '1.1rem', color: '#fff' }} />
      </Box>
      <Box>
        <Typography sx={{ fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.3, color: '#fff' }}>
          Change Priority
        </Typography>
        <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.3 }}>
          Update the priority of this ticket
        </Typography>
      </Box>
    </Box>
  );

  const fieldBaseSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 1.5,
      bgcolor: alpha(PRIORITY_ACCENT, 0.03),
      '& fieldset': {
        borderColor: alpha(PRIORITY_ACCENT, 0.3),
        borderWidth: 1.5,
      },
      '&:hover fieldset': {
        borderColor: PRIORITY_ACCENT,
      },
      '&.Mui-focused fieldset': {
        borderColor: PRIORITY_ACCENT,
        borderWidth: 2,
      },
      '&.Mui-disabled fieldset': {
        borderColor: alpha(PRIORITY_ACCENT, 0.2),
      },
    },
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      headerTextColor='#fff'
      headerBackground={`linear-gradient(135deg, ${darken(PRIORITY_ACCENT, 0.18)} 0%, ${PRIORITY_ACCENT} 100%)`}
      footer={footer}
      maxWidth='sm'
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Alert
          severity='warning'
          sx={{
            '& .MuiAlert-icon': { color: '#d97706' },
            '& .MuiAlert-message': { fontSize: '0.82rem', color: '#78350f' },
          }}
        >
          Changing the priority of an incident requires approval and documentation.
        </Alert>

        {/* Current Priority */}
        <TextField
          label='Current Priority'
          value={incident.priority || 'N/A'}
          disabled
          size='small'
          fullWidth
          sx={fieldBaseSx}
        />

        {/* Impact — searchable */}
        <ImpactSearchField
          label='Impact'
          value={newImpact}
          onChange={setNewImpact}
          sx={fieldBaseSx}
        />

        {/* Urgency — searchable */}
        <UrgencySearchField
          label='Urgency'
          value={newUrgency}
          onChange={setNewUrgency}
          sx={fieldBaseSx}
        />

        {/* Calculated Priority */}
        <TextField
          label='Calculated Priority'
          value={calculatedPriority}
          disabled
          size='small'
          fullWidth
          sx={fieldBaseSx}
        />

        {/* Priority Change Reason Code — searchable */}
        <ReasonCodeSearchField
          label='Priority Change Reason Code'
          value={reasonCode}
          onChange={setReasonCode}
          required
          sx={fieldBaseSx}
        />

        {/* Priority Change Note — RichTextEditor */}
        <RichTextEditor
          value={{ segments: parseRichText(note).segments }}
          onChange={(value) => setNote(serializeRichText(value.segments))}
          showFooterActions={false}
          title='Priority Change Note'
          required
        />

        {/* Attachment (optional) */}
        <Box>
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: '#374151', mb: 1 }}>
            Attachment (optional)
          </Typography>
          <Box
            onClick={() =>
              document.querySelector<HTMLInputElement>('.priority-upload-input')?.click()
            }
            sx={{
              border: '2px dashed #ccc',
              borderRadius: 1.5,
              p: '24px 16px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
              bgcolor: alpha(PRIORITY_ACCENT, 0.02),
              '&:hover': {
                borderColor: PRIORITY_ACCENT,
                bgcolor: alpha(PRIORITY_ACCENT, 0.04),
              },
            }}
          >
            <input
              type='file'
              className='priority-upload-input'
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
                bgcolor: PRIORITY_ACCENT,
                '&:hover': { bgcolor: darken(PRIORITY_ACCENT, 0.15) },
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
        {files.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151' }}>
              Attached Files ({files.length})
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {files.map((file, index) => (
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
                    bgcolor: alpha(PRIORITY_ACCENT, 0.04),
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
                    <CloudUploadOutlinedIcon sx={{ fontSize: '1.1rem', color: PRIORITY_ACCENT }} />
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
                    onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))}
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

export default PriorityChangeModal;
