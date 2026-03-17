import { useState } from 'react';
import { Box, Modal, Select, Checkbox, Button, UploadFile } from '../../../../components';
import { TextField } from '@mui/material';
import { IIncident, IncidentStatus } from '@picks/interfaces';
import { useCreateCommentMutation } from '../../../../../services';
import { useAuth, useNotification } from '@picks/hooks';

interface CommentWindowProps {
  open: boolean;
  onClose: () => void;
  incident: IIncident;
  onSuccess: () => void;
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
const rowSx = { display: 'flex', gap: 2, flexDirection: { xs: 'column' as const, sm: 'row' as const } };
const fieldSx = { flex: 1, minWidth: 0 };

const CommentWindow = ({ open, onClose, incident, onSuccess }: CommentWindowProps) => {
  const { user } = useAuth();
  const [createComment, { isLoading }] = useCreateCommentMutation();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(incident.status);
  const [isInternal, setIsInternal] = useState(false);
  const [isSelfNote, setIsSelfNote] = useState(false);
  const [notifyAssigneesOnly, setNotifyAssigneesOnly] = useState(false);
  const notify = useNotification();

  const handleSave = async (closeAfter = false) => {
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
        incidentId: incident.id,
        subject,
        message,
        isInternal,
        isSelfNote,
        notifyAssigneesOnly,
        status,
        createdBy: user?.email || '',
      }).unwrap();
      if (closeAfter) {
        onSuccess();
      } else {
        setSubject('');
        setMessage('');
        setIsInternal(false);
        setIsSelfNote(false);
        setNotifyAssigneesOnly(false);
      }
    } catch {
      notify.error('Failed to add comment');
    }
  };

  const footer = (
    <Box sx={footerSx}>
      <Button variant='outlined' onClick={onClose}>
        Cancel
      </Button>
      <Button variant='outlined' onClick={() => handleSave(false)} disabled={isLoading}>
        Save
      </Button>
      <Button variant='contained' onClick={() => handleSave(true)} disabled={isLoading}>
        Save & Close
      </Button>
    </Box>
  );

  return (
    <Modal open={open} onClose={onClose} title='Add Comment' maxWidth='lg' footer={footer}>
      <Box sx={contentSx}>
        <Box sx={rowSx}>
          <Box sx={fieldSx}>
            <Select
              label='Status'
              options={statusOptions}
              value={status}
              onChange={(val) => setStatus(val as IncidentStatus)}
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
