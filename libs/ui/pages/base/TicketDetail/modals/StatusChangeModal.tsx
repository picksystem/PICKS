import { useState, useMemo, useRef, useCallback } from 'react';
import {
  Box,
  TextField,
  Typography,
  InputAdornment,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  alpha,
  darken,
} from '@mui/material';
import {
  Sync as SyncIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
  CloudUploadOutlined as CloudUploadOutlinedIcon,
  DeleteOutline as DeleteOutlineIcon,
} from '@mui/icons-material';
import { useUploadTicketAttachmentsMutation } from '../../../../../services';
import { useConfiguration } from '@serviceops/confighooks';
import { useNotification } from '@serviceops/hooks';
import { TicketEntity, UpdateTicketFn } from '../types/ticketDetail.types';
import { ConfigFormDialog } from '@serviceops/configdialogs';
import {
  parseRichText,
  serializeRichText,
  RichTextEditor,
} from '../../../../pages/base/Configuration/shared/RichTextEditor';
import { Alert } from '@serviceops/component';

const STATUS_ACCENT = '#0369a1';

interface StatusChangeModalProps {
  open: boolean;
  onClose: () => void;
  incident: TicketEntity;
  onUpdateTicket: UpdateTicketFn;
  onSuccess: () => void;
}

const StatusChangeModal = ({
  open,
  onClose,
  incident,
  onUpdateTicket,
  onSuccess,
}: StatusChangeModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadAttachments, { isLoading: isUploading }] = useUploadTicketAttachmentsMutation();
  const { statuses } = useConfiguration();
  const notify = useNotification();

  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  // Status dropdown state
  const [statusInput, setStatusInput] = useState('');
  const [statusOptionsOpen, setStatusOptionsOpen] = useState(false);
  const [statusFiltered, setStatusFiltered] = useState<{ id: string; label: string }[]>([]);
  const statusDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Status options from configuration — exclude current status
  const statusList = useMemo(() => {
    if (!statuses?.items) return [];
    return statuses.items
      .filter((s) => s.isActive && s.name !== incident.status)
      .map((s) => ({
        id: s.name,
        label: s.displayName || s.name,
      }));
  }, [statuses, incident.status]);

  // ── Status search ─────────────────────────────────────────────────────────
  const handleStatusInputChange = useCallback(
    (value: string) => {
      setStatusInput(value);
      if (statusDebounceRef.current) clearTimeout(statusDebounceRef.current);
      statusDebounceRef.current = setTimeout(() => {
        const q = value.trim().toLowerCase();
        const next = q ? statusList.filter((o) => o.label.toLowerCase().includes(q)) : statusList;
        setStatusFiltered(next);
        setStatusOptionsOpen(next.length > 0);
      }, 150);
    },
    [statusList],
  );

  const handleStatusSelect = useCallback((opt: { id: string; label: string }) => {
    setStatusInput(opt.label);
    setNewStatus(opt.id);
    setStatusOptionsOpen(false);
    setStatusFiltered([]);
  }, []);

  const handleStatusClear = useCallback(() => {
    setStatusInput('');
    setNewStatus('');
    setStatusFiltered([]);
    setStatusOptionsOpen(false);
  }, []);

  // ── File upload ───────────────────────────────────────────────────────────
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files;
    if (selected && selected.length > 0) {
      setFiles((prev) => [...prev, ...Array.from(selected)]);
    }
    event.target.value = '';
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!newStatus) {
      notify.error('Status is required');
      return;
    }
    if (!note.trim()) {
      notify.error('Status change note is required');
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
          ...(newStatus && { status: newStatus }),
          notes: note,
          ...(updatedAttachments.length > 0 && {
            attachments: JSON.stringify(updatedAttachments),
          }),
        },
      }).unwrap();
      onSuccess();
      onClose();
    } catch {
      notify.error('Failed to update status');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Search icon adornment ──────────────────────────────────────────────────
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

  // ── Current status label ───────────────────────────────────────────────────
  const currentStatusLabel =
    statusList.length === 0
      ? incident.status
      : statusList.find((s) => s.id === incident.status)?.label || incident.status;

  return (
    <ConfigFormDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      isEdit={false}
      icon={<SyncIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
      accent={STATUS_ACCENT}
      title='Change Status'
      subtitle='Update the status of this ticket'
      submitDisabled={isLoading || isUploading}
      submitLabel={isUploading ? 'Uploading...' : isLoading ? 'Updating...' : 'Update'}
      maxWidth='sm'
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {/* Current Status — read-only search field */}
        <Box sx={{ mt: 1, position: 'relative' }}>
          <TextField
            label='Current Status'
            value={currentStatusLabel}
            size='small'
            fullWidth
            InputProps={{ readOnly: true }}
            slotProps={{
              input: { readOnly: true },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
                bgcolor: alpha(STATUS_ACCENT, 0.03),
                '& fieldset': {
                  borderColor: alpha(STATUS_ACCENT, 0.3),
                  borderWidth: 1.5,
                },
                '&:hover fieldset': {
                  borderColor: STATUS_ACCENT,
                },
                '&.Mui-focused fieldset': {
                  borderColor: STATUS_ACCENT,
                  borderWidth: 2,
                },
              },
            }}
          />
        </Box>

        {/* New Status — searchable dropdown */}
        <Box sx={{ mt: 1, position: 'relative' }}>
          <TextField
            label='New Status'
            required
            placeholder='Search statuses...'
            value={statusInput}
            onChange={(e) => handleStatusInputChange(e.target.value)}
            onFocus={() => {
              const q = statusInput.trim().toLowerCase();
              const next = q
                ? statusList.filter((o) => o.label.toLowerCase().includes(q))
                : statusList;
              setStatusFiltered(next);
              if (next.length > 0) setStatusOptionsOpen(true);
            }}
            onBlur={() => setTimeout(() => setStatusOptionsOpen(false), 200)}
            size='small'
            fullWidth
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
              <List dense disablePadding>
                {statusFiltered.map((opt) => (
                  <ListItem key={opt.id} disablePadding>
                    <ListItemButton
                      onClick={() => handleStatusSelect(opt)}
                      sx={{
                        py: 1,
                        px: 1.5,
                        '&:hover': { bgcolor: alpha(STATUS_ACCENT, 0.08) },
                      }}
                    >
                      <ListItemText
                        primary={opt.label}
                        primaryTypographyProps={{ fontSize: '0.84rem', noWrap: true }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Box>

        {/* Status Change Note — RichTextEditor */}
        <RichTextEditor
          value={{ segments: parseRichText(note).segments }}
          onChange={(value) => setNote(serializeRichText(value.segments))}
          showFooterActions={false}
          title='Status Change Note'
          required
        />

        {/* Attachment (optional) */}
        <Box
          onClick={() => document.querySelector<HTMLInputElement>('.status-upload-input')?.click()}
          sx={{
            border: '2px dashed #ccc',
            borderRadius: 1.5,
            p: '16px 16px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
            bgcolor: alpha(STATUS_ACCENT, 0.02),
            '&:hover': {
              borderColor: STATUS_ACCENT,
              bgcolor: alpha(STATUS_ACCENT, 0.04),
            },
          }}
        >
          <input
            type='file'
            className='status-upload-input'
            multiple
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <Box sx={{ mb: 0.75 }}>
            <CloudUploadOutlinedIcon sx={{ fontSize: 24, color: '#9ca3af' }} />
          </Box>
          <Box
            component='button'
            type='button'
            sx={{
              border: 'none',
              background: STATUS_ACCENT,
              color: '#fff',
              px: 3,
              py: 0.75,
              borderRadius: 1.5,
              fontSize: '0.8rem',
              fontWeight: 600,
              textTransform: 'none',
              cursor: 'pointer',
              '&:hover': { background: darken(STATUS_ACCENT, 0.15) },
            }}
          >
            CHOOSE FILE
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
                    bgcolor: alpha(STATUS_ACCENT, 0.04),
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
                    <CloudUploadOutlinedIcon sx={{ fontSize: '1.1rem', color: STATUS_ACCENT }} />
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
    </ConfigFormDialog>
  );
};

export default StatusChangeModal;
