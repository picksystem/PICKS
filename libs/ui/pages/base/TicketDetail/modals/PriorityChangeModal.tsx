import { useState, useMemo, useRef, useCallback } from 'react';
import { Box, Modal, Button, Alert, Typography, TextField, Paper } from '../../../../components';
import {
  WarningAmber as WarningAmberIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  CloudUploadOutlined as CloudUploadOutlinedIcon,
  DeleteOutline as DeleteOutlineIcon,
} from '@mui/icons-material';
import { alpha, darken, InputAdornment } from '@mui/material';
import {
  IncidentImpact,
  IncidentUrgency,
  PriorityChangeReasonCode,
  calculatePriority,
} from '@serviceops/interfaces';
import { useUploadTicketAttachmentsMutation } from '../../../../../services';
import { useNotification } from '@serviceops/hooks';
import { TicketEntity, UpdateTicketFn } from '../types/ticketDetail.types';
import {
  parseRichText,
  serializeRichText,
  RichTextEditor,
} from '../../../../pages/base/Configuration/shared/RichTextEditor';

const PRIORITY_ACCENT = '#2d5ebb';

interface PriorityChangeModalProps {
  open: boolean;
  onClose: () => void;
  incident: TicketEntity;
  onUpdateTicket: UpdateTicketFn;
  onSuccess: () => void;
}

const impactOptions = Object.values(IncidentImpact).map((v) => ({
  label: v.charAt(0).toUpperCase() + v.slice(1),
  value: v,
}));

const urgencyOptions = Object.values(IncidentUrgency).map((v) => ({
  label: v.charAt(0).toUpperCase() + v.slice(1),
  value: v,
}));

const reasonCodeOptions = Object.values(PriorityChangeReasonCode).map((v) => ({
  label: v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  value: v,
}));

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

  // ── Search field state ──────────────────────────────────────────────────
  const [impactInput, setImpactInput] = useState('');
  const [impactOpen, setImpactOpen] = useState(false);
  const impactDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [urgencyInput, setUrgencyInput] = useState('');
  const [urgencyOpen, setUrgencyOpen] = useState(false);
  const urgencyDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [reasonCodeInput, setReasonCodeInput] = useState('');
  const [reasonCodeOpen, setReasonCodeOpen] = useState(false);
  const reasonCodeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Filtered options ────────────────────────────────────────────────────
  const [impactFiltered, setImpactFiltered] = useState(impactOptions);
  const [urgencyFiltered, setUrgencyFiltered] = useState(urgencyOptions);
  const [reasonCodeFiltered, setReasonCodeFiltered] = useState(reasonCodeOptions);

  const calculatedPriority = useMemo(() => {
    if (newImpact && newUrgency) {
      return calculatePriority(newImpact as IncidentImpact, newUrgency as IncidentUrgency);
    }
    return incident.priority || '';
  }, [newImpact, newUrgency, incident.priority]);

  // ── Sync input text when dialog opens ───────────────────────────────────
  useMemo(() => {
    if (open) {
      const impactMatch = impactOptions.find((o) => o.value === newImpact);
      setImpactInput(impactMatch?.label ?? '');
      setImpactFiltered(impactOptions);

      const urgencyMatch = urgencyOptions.find((o) => o.value === newUrgency);
      setUrgencyInput(urgencyMatch?.label ?? '');
      setUrgencyFiltered(urgencyOptions);

      const reasonMatch = reasonCodeOptions.find((o) => o.value === reasonCode);
      setReasonCodeInput(reasonMatch?.label ?? '');
      setReasonCodeFiltered(reasonCodeOptions);
    }
  }, [open]);

  // ── Search handlers (matching Comment dialog pattern) ───────────────────
  const handleImpactInputChange = useCallback((value: string) => {
    setImpactInput(value);
    if (impactDebounceRef.current) clearTimeout(impactDebounceRef.current);
    impactDebounceRef.current = setTimeout(() => {
      const q = value.trim().toLowerCase();
      const next = q
        ? impactOptions.filter((o) => o.label.toLowerCase().includes(q))
        : impactOptions;
      setImpactFiltered(next);
      setImpactOpen(next.length > 0);
    }, 150);
  }, []);

  const handleUrgencyInputChange = useCallback((value: string) => {
    setUrgencyInput(value);
    if (urgencyDebounceRef.current) clearTimeout(urgencyDebounceRef.current);
    urgencyDebounceRef.current = setTimeout(() => {
      const q = value.trim().toLowerCase();
      const next = q
        ? urgencyOptions.filter((o) => o.label.toLowerCase().includes(q))
        : urgencyOptions;
      setUrgencyFiltered(next);
      setUrgencyOpen(next.length > 0);
    }, 150);
  }, []);

  const handleReasonCodeInputChange = useCallback((value: string) => {
    setReasonCodeInput(value);
    if (reasonCodeDebounceRef.current) clearTimeout(reasonCodeDebounceRef.current);
    reasonCodeDebounceRef.current = setTimeout(() => {
      const q = value.trim().toLowerCase();
      const next = q
        ? reasonCodeOptions.filter((o) => o.label.toLowerCase().includes(q))
        : reasonCodeOptions;
      setReasonCodeFiltered(next);
      setReasonCodeOpen(next.length > 0);
    }, 150);
  }, []);

  const handleImpactSelect = useCallback((opt: { value: string; label: string }) => {
    setImpactInput(opt.label);
    setNewImpact(opt.value);
    setImpactOpen(false);
    setImpactFiltered(impactOptions);
  }, []);

  const handleUrgencySelect = useCallback((opt: { value: string; label: string }) => {
    setUrgencyInput(opt.label);
    setNewUrgency(opt.value);
    setUrgencyOpen(false);
    setUrgencyFiltered(urgencyOptions);
  }, []);

  const handleReasonCodeSelect = useCallback((opt: { value: string; label: string }) => {
    setReasonCodeInput(opt.label);
    setReasonCode(opt.value);
    setReasonCodeOpen(false);
    setReasonCodeFiltered(reasonCodeOptions);
  }, []);

  const handleImpactClear = useCallback(() => {
    setImpactInput('');
    setNewImpact('');
    setImpactFiltered(impactOptions);
  }, []);

  const handleUrgencyClear = useCallback(() => {
    setUrgencyInput('');
    setNewUrgency('');
    setUrgencyFiltered(urgencyOptions);
  }, []);

  const handleReasonCodeClear = useCallback(() => {
    setReasonCodeInput('');
    setReasonCode('');
    setReasonCodeFiltered(reasonCodeOptions);
  }, []);

  // ── Search adornment (SearchIcon / ClearIcon) ───────────────────────────
  const searchAdornment = (hasValue: boolean, onClear: () => void, onOpen: () => void) => (
    <InputAdornment position='end'>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {hasValue ? (
          <ClearIcon
            onClick={onClear}
            sx={{ fontSize: 18, color: 'text.secondary', cursor: 'pointer' }}
          />
        ) : (
          <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
        )}
      </Box>
    </InputAdornment>
  );

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
        <Box sx={{ position: 'relative' }}>
          <TextField
            label='Impact'
            placeholder='Search...'
            value={impactInput}
            onChange={(e) => handleImpactInputChange(e.target.value)}
            onFocus={() => {
              const q = impactInput.trim().toLowerCase();
              const next = q
                ? impactOptions.filter((o) => o.label.toLowerCase().includes(q))
                : impactOptions;
              setImpactFiltered(next);
              if (next.length > 0) setImpactOpen(true);
            }}
            onBlur={() => setTimeout(() => setImpactOpen(false), 200)}
            fullWidth
            size='small'
            sx={fieldBaseSx}
            slotProps={{
              input: {
                endAdornment: searchAdornment(impactInput.length > 0, handleImpactClear, () => {}),
              },
            }}
          />
          {impactOpen && impactFiltered.length > 0 && (
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
              {impactFiltered.map((opt) => (
                <Box
                  key={opt.value}
                  onClick={() => handleImpactSelect(opt)}
                  sx={{
                    px: 1.5,
                    py: 1,
                    cursor: 'pointer',
                    fontSize: '0.84rem',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 'none' },
                    '&:hover': { bgcolor: alpha(PRIORITY_ACCENT, 0.08) },
                  }}
                >
                  {opt.label}
                </Box>
              ))}
            </Paper>
          )}
        </Box>

        {/* Urgency — searchable */}
        <Box sx={{ position: 'relative' }}>
          <TextField
            label='Urgency'
            placeholder='Search...'
            value={urgencyInput}
            onChange={(e) => handleUrgencyInputChange(e.target.value)}
            onFocus={() => {
              const q = urgencyInput.trim().toLowerCase();
              const next = q
                ? urgencyOptions.filter((o) => o.label.toLowerCase().includes(q))
                : urgencyOptions;
              setUrgencyFiltered(next);
              if (next.length > 0) setUrgencyOpen(true);
            }}
            onBlur={() => setTimeout(() => setUrgencyOpen(false), 200)}
            fullWidth
            size='small'
            sx={fieldBaseSx}
            slotProps={{
              input: {
                endAdornment: searchAdornment(
                  urgencyInput.length > 0,
                  handleUrgencyClear,
                  () => {},
                ),
              },
            }}
          />
          {urgencyOpen && urgencyFiltered.length > 0 && (
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
              {urgencyFiltered.map((opt) => (
                <Box
                  key={opt.value}
                  onClick={() => handleUrgencySelect(opt)}
                  sx={{
                    px: 1.5,
                    py: 1,
                    cursor: 'pointer',
                    fontSize: '0.84rem',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 'none' },
                    '&:hover': { bgcolor: alpha(PRIORITY_ACCENT, 0.08) },
                  }}
                >
                  {opt.label}
                </Box>
              ))}
            </Paper>
          )}
        </Box>

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
        <Box sx={{ position: 'relative' }}>
          <TextField
            label='Priority Change Reason Code'
            placeholder='Search...'
            value={reasonCodeInput}
            onChange={(e) => handleReasonCodeInputChange(e.target.value)}
            onFocus={() => {
              const q = reasonCodeInput.trim().toLowerCase();
              const next = q
                ? reasonCodeOptions.filter((o) => o.label.toLowerCase().includes(q))
                : reasonCodeOptions;
              setReasonCodeFiltered(next);
              if (next.length > 0) setReasonCodeOpen(true);
            }}
            onBlur={() => setTimeout(() => setReasonCodeOpen(false), 200)}
            fullWidth
            size='small'
            sx={fieldBaseSx}
            slotProps={{
              input: {
                endAdornment: searchAdornment(
                  reasonCodeInput.length > 0,
                  handleReasonCodeClear,
                  () => {},
                ),
              },
            }}
          />
          {reasonCodeOpen && reasonCodeFiltered.length > 0 && (
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
              {reasonCodeFiltered.map((opt) => (
                <Box
                  key={opt.value}
                  onClick={() => handleReasonCodeSelect(opt)}
                  sx={{
                    px: 1.5,
                    py: 1,
                    cursor: 'pointer',
                    fontSize: '0.84rem',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 'none' },
                    '&:hover': { bgcolor: alpha(PRIORITY_ACCENT, 0.08) },
                  }}
                >
                  {opt.label}
                </Box>
              ))}
            </Paper>
          )}
        </Box>

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
