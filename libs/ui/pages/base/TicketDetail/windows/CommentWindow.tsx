import { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Button, TextField, Typography, Switch, Modal } from '../../../../components';
import { alpha, darken, Paper, InputAdornment } from '@mui/material';
import {
  Comment as CommentIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  CloudUploadOutlined as CloudUploadOutlinedIcon,
  DeleteOutline as DeleteOutlineIcon,
} from '@mui/icons-material';
import { useCreateTicketCommentMutation } from '../../../../../services';
import { useAuth, useNotification } from '@serviceops/hooks';
import { TicketEntity } from '../types/ticketDetail.types';
import { useConfiguration } from '@serviceops/confighooks';
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
  mode?: 'comment' | 'internal' | 'self' | 'notify' | 'email';
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
  const [emailTo, setEmailTo] = useState('');
  const [emailFrom, setEmailFrom] = useState('');
  const [files, setFiles] = useState<File[]>([]);

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
      setEmailTo('');
      setEmailFrom('');
      setFiles([]);
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
      } else if (mode === 'notify') {
        setIsInternal(false);
        setIsSelfNote(false);
        setNotifyAssigneesOnly(true);
      } else if (mode === 'email') {
        setIsInternal(false);
        setIsSelfNote(false);
        setNotifyAssigneesOnly(false);
      } else {
        setIsInternal(false);
        setIsSelfNote(false);
      }
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
        isEmail: mode === 'email',
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
    mode === 'internal'
      ? 'Internal Note'
      : mode === 'self'
        ? 'Self Note'
        : mode === 'notify'
          ? 'Notify Assignees Only'
          : mode === 'email'
            ? 'Send Email'
            : 'Add a Comment';

  const dialogSubtitle =
    mode === 'internal'
      ? 'Add an internal note to this ticket'
      : mode === 'self'
        ? 'Add a personal note to this ticket'
        : mode === 'notify'
          ? 'Send a notification to ticket assignees only'
          : mode === 'email'
            ? 'Send an email note for this ticket'
            : 'Add a comment to this ticket';

  const footer = (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
      <Button variant='outlined' onClick={onClose}>
        Cancel
      </Button>
      <Button variant='contained' onClick={handleSave} disabled={isLoading}>
        Save
      </Button>
    </Box>
  );

  const fieldBaseSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 1.5,
      bgcolor: alpha('#2d5ebb', 0.03),
      '& fieldset': {
        borderColor: alpha(COMMENT_ACCENT, 0.3),
        borderWidth: 1.5,
      },
      '&:hover fieldset': {
        borderColor: COMMENT_ACCENT,
      },
      '&.Mui-focused fieldset': {
        borderColor: COMMENT_ACCENT,
        borderWidth: 2,
      },
      '&.Mui-error fieldset': {
        borderColor: '#d32f2f',
      },
    },
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      headerBackground={`linear-gradient(135deg, ${darken(COMMENT_ACCENT, 0.18)} 0%, ${COMMENT_ACCENT} 100%)`}
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
            <CommentIcon sx={{ fontSize: '1.1rem', color: '#fff' }} />
          </Box>
          <Box>
            <Typography
              sx={{ fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.3, color: '#fff' }}
            >
              {dialogTitle}
            </Typography>
            <Typography
              sx={{
                fontSize: '0.78rem',
                color: 'rgba(255,255,255,0.85)',
                lineHeight: 1.3,
              }}
            >
              {dialogSubtitle}
            </Typography>
          </Box>
        </Box>
      }
      footer={footer}
      maxWidth='sm'
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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
            sx={fieldBaseSx}
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
          sx={fieldBaseSx}
          slotProps={{
            input: {
              endAdornment: searchAdornment(templateInput.length > 0, handleTemplateClear),
            },
          }}
        />

        {/* Subject — required (hidden in email mode; shown inside email section) */}
        <TextField
          label='Subject'
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          size='small'
          fullWidth
          sx={{
            ...fieldBaseSx,
            display: mode === 'email' ? 'none' : 'block',
          }}
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

        {/* Email section — always expanded, no toggle */}
        {mode === 'email' && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              p: 2.5,
              bgcolor: '#f0f9ff',
              borderRadius: 1.5,
              border: '1px solid #bae6fd',
            }}
          >
            <TextField
              label='Subject'
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              size='small'
              fullWidth
              sx={fieldBaseSx}
            />
            <TextField
              label='To'
              placeholder='recipient@example.com'
              value={emailTo || ''}
              onChange={(e) => setEmailTo(e.target.value)}
              size='small'
              fullWidth
              sx={fieldBaseSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>To:</span>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label='From'
              value={emailFrom || user?.email || ''}
              onChange={(e) => setEmailFrom(e.target.value)}
              size='small'
              fullWidth
              sx={fieldBaseSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>From:</span>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        )}

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
            borderRadius: 1.5,
            p: '16px 16px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
            bgcolor: alpha(COMMENT_ACCENT, 0.02),
            '&:hover': {
              borderColor: COMMENT_ACCENT,
              bgcolor: alpha(COMMENT_ACCENT, 0.04),
            },
          }}
        >
          <input
            type='file'
            className='comment-upload-input'
            style={{ display: 'none' }}
            onChange={(e) => {
              const selected = Array.from(e.target.files || []);
              setFiles((prev) => [...prev, ...selected]);
            }}
          />
          <Box sx={{ mb: 0.75 }}>
            <CloudUploadOutlinedIcon sx={{ fontSize: 24, color: '#9ca3af' }} />
          </Box>
          <Button
            variant='contained'
            size='small'
            sx={{
              bgcolor: COMMENT_ACCENT,
              '&:hover': { bgcolor: darken(COMMENT_ACCENT, 0.15) },
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
                    bgcolor: alpha(COMMENT_ACCENT, 0.04),
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
                    <CloudUploadOutlinedIcon sx={{ fontSize: '1.1rem', color: COMMENT_ACCENT }} />
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

export default CommentWindow;
