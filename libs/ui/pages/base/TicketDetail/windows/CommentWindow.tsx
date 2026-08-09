import { useState, useEffect } from 'react';
import {
  Box,
  Modal,
  Select,
  Checkbox,
  Button,
  UploadFile,
  TextField,
} from '../../../../components';
import { IncidentStatus } from '@serviceops/interfaces';
import { useCreateTicketCommentMutation } from '../../../../../services';
import { useAuth, useNotification } from '@serviceops/hooks';
import { TicketEntity } from '../types/ticketDetail.types';

interface CommentWindowProps {
  open: boolean;
  onClose: () => void;
  incident: TicketEntity;
  onSuccess: () => void;
  mode?: 'comment' | 'internal' | 'self';
}

const statusOptions = Object.values(IncidentStatus).map((v) => ({
  label: v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  value: v,
}));

const footerSx = {
  display: 'flex',
  gap: 1,
  justifyContent: 'flex-end',
  flexDirection: { xs: 'column' as const, sm: 'row' as const },
};
const contentSx = { display: 'flex', flexDirection: 'column', gap: 2 };
const rowSx = {
  display: 'flex',
  gap: 2,
  flexDirection: { xs: 'column' as const, sm: 'row' as const },
};
const fieldSx = { flex: 1, minWidth: 0 };

const CommentWindow = ({ open, onClose, incident, onSuccess, mode = 'comment' }: CommentWindowProps) => {
  const { user } = useAuth();
  const [createComment, { isLoading }] = useCreateTicketCommentMutation();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<string>(incident.status);
  const [isInternal, setIsInternal] = useState(false);
  const [isSelfNote, setIsSelfNote] = useState(false);
  const [notifyAssigneesOnly, setNotifyAssigneesOnly] = useState(false);
  const notify = useNotification();

  const modalTitle = mode === 'internal'
    ? 'Add Internal Note'
    : mode === 'self'
      ? 'Add Self Note'
      : 'Add Comment (Customer Visible)';

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
    <Box sx={footerSx}>
      <Button variant='outlined' onClick={onClose}>
        Cancel
      </Button>
      <Button variant='outlined' onClick={handleSave} disabled={isLoading}>
        Save
      </Button>
      <Button variant='contained' onClick={() => { handleSave(); onSuccess(); }} disabled={isLoading}>
        Save & Close
      </Button>
    </Box>
  );

  return (
    <Modal open={open} onClose={onClose} title={modalTitle} maxWidth='lg' footer={footer}>
      <Box sx={contentSx}>
        <Box sx={rowSx}>
          <Box sx={fieldSx}>
            <Select
              label='Status'
              options={statusOptions}
              value={status}
              onChange={(val) => setStatus(val as string)}
            />
          </Box>
          <Box sx={fieldSx}>
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

        <Box sx={rowSx}>
          <Checkbox
            label='Internal Note'
            checked={isInternal}
            onChange={() => setIsInternal(!isInternal)}
          />
          <Checkbox
            label='Self-note'
            checked={isSelfNote}
            onChange={() => setIsSelfNote(!isSelfNote)}
          />
          <Checkbox
            label='Notify ticket assignees only'
            checked={notifyAssigneesOnly}
            onChange={() => setNotifyAssigneesOnly(!notifyAssigneesOnly)}
          />
        </Box>

        <UploadFile onChange={() => {}} />
      </Box>
    </Modal>
  );
};

export default CommentWindow;
