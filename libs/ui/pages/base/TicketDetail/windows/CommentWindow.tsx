import { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Button, TextField, Typography, Switch } from '../../../../components';
import { alpha, darken, Paper, InputAdornment } from '@mui/material';
import {
  Comment as CommentIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useCreateTicketCommentMutation } from '../../../../../services';
import { useAuth, useNotification } from '@serviceops/hooks';
import { TicketEntity } from '../types/ticketDetail.types';
import { useConfiguration } from '@serviceops/confighooks';
import { ConfigFormDialog } from '@serviceops/configdialogs';
import {
  parseRichText,
  serializeRichText,
  RichTextEditor,
} from '../../../../pages/base/Configuration/shared/RichTextEditor';

const COMMENT_ACCENT = '#0369a1';

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
  const notify = useNotification();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isSelfNote, setIsSelfNote] = useState(false);
  const [notifyAssigneesOnly, setNotifyAssigneesOnly] = useState(false);

  // ── Status search field ─────────────────────────────────────────────────
  const [statusInput, setStatusInput] = useState('');
  const [statusValue, setStatusValue] = useState('');
  const [statusOptionsOpen, setStatusOptionsOpen] = useState(false);
  const [statusFiltered, setStatusFiltered] = useState<{ id: string; label: string }[]>([]);
  const statusDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const statusOptions = statuses?.items
    ? statuses.items
        .filter((s) => s.isActive)
        .map((s) => ({ id: String(s.id), label: s.displayName || s.name }))
    : [];

  const handleStatusInputChange = useCallback(
    (value: string) => {
      setStatusInput(value);
      if (statusDebounceRef.current) clearTimeout(statusDebounceRef.current);
      statusDebounceRef.current = setTimeout(() => {
        const q = value.trim().toLowerCase();
        const next = q
          ? statusOptions.filter((o) => o.label.toLowerCase().includes(q))
          : statusOptions;
        setStatusFiltered(next);
        setStatusOptionsOpen(next.length > 0);
      }, 150);
    },
    [statusOptions],
  );

  const handleStatusSelect = useCallback((opt: { id: string; label: string }) => {
    setStatusInput(opt.label);
    setStatusValue(opt.id);
    setStatusOptionsOpen(false);
    setStatusFiltered([]);
  }, []);

  const handleStatusClear = useCallback(() => {
    setStatusInput('');
    setStatusValue('');
    setStatusOptionsOpen(false);
    setStatusFiltered([]);
  }, []);

  // ── Response Template search field (stub) ────────────────────────────────
  const [templateInput, setTemplateInput] = useState('');

  const handleTemplateInputChange = useCallback((value: string) => {
    setTemplateInput(value);
  }, []);

  const handleTemplateClear = useCallback(() => {
    setTemplateInput('');
  }, []);

  // ── Reset fields when dialog opens ──────────────────────────────────────
  useEffect(() => {
    if (open) {
      setSubject('');
      setMessage('');
      setStatusInput('');
      setStatusValue('');
      setTemplateInput('');
      setStatusOptionsOpen(false);
      setStatusFiltered([]);
    }
  }, [open]);

  // ── Mode-based pre-sets ─────────────────────────────────────────────────
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

  // ── Search icon adornment ────────────────────────────────────────────────
  const searchAdornment = (hasValue: boolean, onClear: () => void) => (
    <InputAdornment position='end'>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {hasValue ? (
          <ClearIcon
            onClick={onClear}
            sx={{ fontSize: 18, color: 'text.primary', cursor: 'pointer' }}
          />
        ) : (
          <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
        )}
      </Box>
    </InputAdornment>
  );

  // ── Save handler ────────────────────────────────────────────────────────
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
        status: statusValue || incident.status,
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

  const dialogTitle =
    mode === 'internal' ? 'Internal Note' : mode === 'self' ? 'Self Note' : 'A Comment';

  const dialogSubtitle =
    mode === 'internal'
      ? 'Add an internal note to this ticket'
      : mode === 'self'
        ? 'Add a personal note to this ticket'
        : 'Add a comment to this ticket';

  return (
    <ConfigFormDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSave}
      isEdit={false}
      icon={<CommentIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
      accent={COMMENT_ACCENT}
      title={dialogTitle}
      subtitle={dialogSubtitle}
      submitDisabled={false}
      submitLabel='Save'
      hideActions
      maxWidth='sm'
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {/* Status — search-style field */}
        <Box sx={{ position: 'relative' }}>
          <TextField
            label='Status'
            required
            placeholder='Search statuses...'
            value={statusInput}
            onChange={(e) => handleStatusInputChange(e.target.value)}
            onFocus={() => {
              const q = statusInput.trim().toLowerCase();
              const next = q
                ? statusOptions.filter((o) => o.label.toLowerCase().includes(q))
                : statusOptions;
              setStatusFiltered(next);
              if (next.length > 0) setStatusOptionsOpen(true);
            }}
            onBlur={() => setTimeout(() => setStatusOptionsOpen(false), 200)}
            fullWidth
            size='small'
            slotProps={{
              input: {
                endAdornment: searchAdornment(statusInput.length > 0, handleStatusClear),
              },
            }}
          />
          {statusOptionsOpen && statusFiltered.length > 0 && (
            <Paper
              elevation={4}
              sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 1000,
                mt: 0,
                maxHeight: 280,
                overflow: 'auto',
              }}
            >
              {statusFiltered.map((opt) => (
                <Box
                  key={opt.id}
                  onClick={() => handleStatusSelect(opt)}
                  sx={{
                    px: 1.5,
                    py: 1,
                    cursor: 'pointer',
                    fontSize: '0.84rem',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 'none' },
                    '&:hover': { bgcolor: alpha(COMMENT_ACCENT, 0.08) },
                  }}
                >
                  {opt.label}
                </Box>
              ))}
            </Paper>
          )}
        </Box>

        {/* Response Template */}
        <TextField
          label='Response Template'
          placeholder='Search templates...'
          value={templateInput}
          onChange={(e) => handleTemplateInputChange(e.target.value)}
          fullWidth
          size='small'
          slotProps={{
            input: {
              endAdornment: searchAdornment(templateInput.length > 0, handleTemplateClear),
            },
          }}
        />

        {/* Subject — required */}
        <TextField
          label='Subject'
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          size='small'
          fullWidth
        />

        {/* Message — RichTextEditor */}
        <Box>
          <RichTextEditor
            value={{ segments: parseRichText(message).segments }}
            onChange={(value) => setMessage(serializeRichText(value.segments))}
            showFooterActions={false}
            title='Message'
            required
          />
        </Box>

        {/* Toggle switches */}
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 0.25,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography sx={{ fontSize: '0.85rem', color: '#374151' }}>Internal Note</Typography>
            <Switch
              size='small'
              color='primary'
              checked={isInternal}
              onChange={(e) => setIsInternal(e.target.checked)}
            />
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 0.25,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography sx={{ fontSize: '0.85rem', color: '#374151' }}>Self-note</Typography>
            <Switch
              size='small'
              color='primary'
              checked={isSelfNote}
              onChange={(e) => setIsSelfNote(e.target.checked)}
            />
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 0.25,
            }}
          >
            <Typography sx={{ fontSize: '0.85rem', color: '#374151' }}>
              Notify ticket assignees only
            </Typography>
            <Switch
              size='small'
              color='primary'
              checked={notifyAssigneesOnly}
              onChange={(e) => setNotifyAssigneesOnly(e.target.checked)}
            />
          </Box>
        </Box>

        {/* File Upload */}
        <Box
          onClick={() => document.querySelector<HTMLInputElement>('.comment-upload-input')?.click()}
          sx={{
            border: '2px dashed #ccc',
            borderRadius: 1,
            p: '24px 16px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
            '&:hover': {
              borderColor: COMMENT_ACCENT,
              bgcolor: alpha(COMMENT_ACCENT, 0.02),
            },
          }}
        >
          <input
            type='file'
            className='comment-upload-input'
            style={{ display: 'none' }}
            onChange={() => {}}
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

        {/* Action Buttons */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            justifyContent: 'flex-end',
            flexDirection: { xs: 'column', sm: 'row' },
            pt: 2,
            mt: 1,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Button
            onClick={onClose}
            variant='outlined'
            sx={{
              textTransform: 'none',
              width: { xs: '100%', sm: 'auto' },
              borderColor: alpha(COMMENT_ACCENT, 0.4),
              color: darken(COMMENT_ACCENT, 0.15),
              '&:hover': {
                borderColor: COMMENT_ACCENT,
                bgcolor: alpha(COMMENT_ACCENT, 0.04),
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            variant='contained'
            sx={{
              textTransform: 'none',
              width: { xs: '100%', sm: 'auto' },
              bgcolor: COMMENT_ACCENT,
              '&:hover': { bgcolor: darken(COMMENT_ACCENT, 0.15) },
              '&.Mui-disabled': {
                bgcolor: alpha(COMMENT_ACCENT, 0.4),
              },
            }}
          >
            Save
          </Button>
        </Box>
      </Box>
    </ConfigFormDialog>
  );
};

export default CommentWindow;
