import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Modal,
  Select,
  Checkbox,
  Button,
  UploadFile,
  TextField,
  Typography,
} from '../../../../components';
import { useCreateTicketCommentMutation } from '../../../../../services';
import { useAuth, useNotification } from '@serviceops/hooks';
import { TicketEntity } from '../types/ticketDetail.types';
import { useConfiguration } from '@serviceops/confighooks';

interface CommentWindowProps {
  open: boolean;
  onClose: () => void;
  incident: TicketEntity;
  onSuccess: () => void;
  mode?: 'comment' | 'internal' | 'self';
}

const CommentWindow = ({
  open,
  onClose,
  incident,
  onSuccess,
  mode = 'comment',
}: CommentWindowProps) => {
  const { user } = useAuth();
  const [createComment, { isLoading }] = useCreateTicketCommentMutation();
  const { statuses } = useConfiguration();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<string>(incident.status);
  const [isInternal, setIsInternal] = useState(false);
  const [isSelfNote, setIsSelfNote] = useState(false);
  const [notifyAssigneesOnly, setNotifyAssigneesOnly] = useState(false);
  const notify = useNotification();

  const modalTitle =
    mode === 'internal'
      ? 'Add Internal Note'
      : mode === 'self'
        ? 'Add Self Note'
        : 'Add a comment (Customer Visible)';

  // Match existing checkbox styles from UpdatesSection
  const checkboxSx = {
    color: '#6366f1',
    p: '2px 0',
    '& .MuiSvgIcon-root': { fontSize: 16 },
  };

  // Match existing action button styles from UpdatesSection
  const actionBtnSx = (border: string, bg: string, text: string) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '3px 10px',
    borderRadius: '6px',
    border: `1px solid ${border}`,
    background: bg,
    color: text,
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    lineHeight: '20px',
    transition: 'all 0.15s ease',
    '&:hover': {
      opacity: 0.85,
      boxShadow: `0 1px 3px ${border}40`,
    },
    '&.Mui-disabled': {
      opacity: 0.5,
    },
  });

  // Build status options dynamically from Configuration > Statuses > Ticket statuses
  const statusOptions = statuses?.items
    ? statuses.items
        .filter((s) => s.isActive)
        .map((s) => ({
          value: s.id,
          label: s.displayName || s.name,
        }))
    : [];

  // Pre-set checkboxes based on mode when modal opens
  useEffect(() => {
    if (open) {
      if (mode === 'internal') {
        setIsInternal(true);
        setIsSelfNote(false);
      } else if (mode === 'self') {
        setIsInternal(false);
        setIsSelfNote(true);
      } else {
        setIsInternal(false);
        setIsSelfNote(false);
      }
      setNotifyAssigneesOnly(false);
    }
  }, [open, mode]);

  const handleSave = async () => {
    if (!subject.trim()) {
      notify.error('Subject is required');
      return;
    }
    if (!message.trim()) {
      notify.error('Message is required');
      return;
    }
    try {
      await createComment({
        ticketType: incident.ticketType,
        ticketId: incident.id,
        subject,
        message,
        isInternal,
        isSelfNote,
        notifyAssigneesOnly,
        status,
        createdBy: user?.email || '',
      }).unwrap();
      setSubject('');
      setMessage('');
      setIsInternal(false);
      setIsSelfNote(false);
      setNotifyAssigneesOnly(false);
      onSuccess();
    } catch {
      notify.error('Failed to add comment');
    }
  };

  const footer = (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        justifyContent: 'flex-end',
        flexDirection: { xs: 'column', sm: 'row' },
      }}
    >
      <Button onClick={onClose} sx={actionBtnSx('#6366f1', '#eef2ff', '#4338ca')}>
        Cancel
      </Button>
      <Button onClick={handleSave} disabled={isLoading} sx={actionBtnSx('#6366f1', '#eef2ff', '#4338ca')}>
        Save
      </Button>
      <Button onClick={() => { handleSave(); onSuccess(); }} disabled={isLoading} sx={actionBtnSx('#2d5ebb', '#eef2ff', '#1e40af')}>
        Save & Close
      </Button>
    </Box>
  );

  return (
    <Modal open={open} onClose={onClose} title={modalTitle} maxWidth='lg' footer={footer}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Select
              label='Status'
              options={statusOptions}
              value={status}
              onChange={(val) => setStatus(val as string)}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Select label='Response Template' options={[]} value='' onChange={() => {}} />
          </Box>
        </Box>

        <TextField
          label='Subject'
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          size='small'
          fullWidth
          required
        />

        <TextField
          label='Message'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          multiline
          minRows={3}
          maxRows={10}
          size='small'
          fullWidth
          required
        />

        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
          }}
        >
          <Box
            sx={{ display: 'inline-flex', alignItems: 'center', gap: '3px', cursor: 'pointer' }}
            onClick={() => setIsInternal(!isInternal)}
          >
            <Checkbox
              size='small'
              checked={isInternal}
              onChange={() => setIsInternal(!isInternal)}
              sx={checkboxSx}
            />
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151' }}>
              Internal Note
            </Typography>
          </Box>
          <Box
            sx={{ display: 'inline-flex', alignItems: 'center', gap: '3px', cursor: 'pointer' }}
            onClick={() => setIsSelfNote(!isSelfNote)}
          >
            <Checkbox
              size='small'
              checked={isSelfNote}
              onChange={() => setIsSelfNote(!isSelfNote)}
              sx={checkboxSx}
            />
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151' }}>
              Self-note
            </Typography>
          </Box>
          <Box
            sx={{ display: 'inline-flex', alignItems: 'center', gap: '3px', cursor: 'pointer' }}
            onClick={() => setNotifyAssigneesOnly(!notifyAssigneesOnly)}
          >
            <Checkbox
              size='small'
              checked={notifyAssigneesOnly}
              onChange={() => setNotifyAssigneesOnly(!notifyAssigneesOnly)}
              sx={checkboxSx}
            />
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151' }}>
              Notify ticket assignees only
            </Typography>
          </Box>
        </Box>

        <UploadFile onChange={() => {}} />
      </Box>
    </Modal>
  );
};

export default CommentWindow;
