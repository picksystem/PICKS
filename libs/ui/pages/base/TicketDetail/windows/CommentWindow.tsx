import { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Button, TextField, Typography, Switch, Modal, Tooltip } from '../../../../components';
import { alpha, darken, Paper, InputAdornment, FormControlLabel } from '@mui/material';
import {
  Comment as CommentIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  CloudUploadOutlined as CloudUploadOutlinedIcon,
  DeleteOutline as DeleteOutlineIcon,
} from '@mui/icons-material';
import { useCreateTicketCommentMutation } from '../../../../../services';
import type { IConfigCommentTemplate } from '@serviceops/interfaces';
import { useAuth, useNotification, useFieldError } from '@serviceops/hooks';
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
  incidentStatus?: string;
}

const CommentWindow = ({
  open,
  onClose,
  incident,
  onSuccess,
  mode = 'comment',
  incidentStatus,
}: CommentWindowProps) => {
  const { user } = useAuth();
  const [createComment, { isLoading }] = useCreateTicketCommentMutation();
  const { statuses, commentTemplates, saveSection } = useConfiguration();
  const notify = useNotification();
  const reqError = useFieldError();

  const [message, setMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isSelfNote, setIsSelfNote] = useState(false);
  const [notifyAssigneesOnly, setNotifyAssigneesOnly] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailFrom, setEmailFrom] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  // ── Save as Template (Scenario 2) ────────────────────────────────────────────
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [newTemplateStatusValue, setNewTemplateStatusValue] = useState('');
  const [newTemplateActive, setNewTemplateActive] = useState(true);
  const [templateStatusOptionsOpen, setTemplateStatusOptionsOpen] = useState(false);
  const [templateStatusOptions, setTemplateStatusOptions] = useState<
    {
      id: string;
      label: string;
    }[]
  >([]);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  // ── Status search field ─────────────────────────────────────────────────
  const [statusInput, setStatusInput] = useState('');
  const [statusValue, setStatusValue] = useState('');
  const [statusOptionsOpen, setStatusOptionsOpen] = useState(false);
  const [statusFiltered, setStatusFiltered] = useState<{ id: string; label: string }[]>([]);
  const statusDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // ── Response Template search field ────────────────────────────────────────
  const [templateInput, setTemplateInput] = useState('');
  const [templateValue, setTemplateValue] = useState('');
  const [templateOptionsOpen, setTemplateOptionsOpen] = useState(false);
  const [templateFiltered, setTemplateFiltered] = useState<
    { id: string; name: string; description: string }[]
  >([]);
  const templateDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const templateOptions = commentTemplates?.items
    ? commentTemplates.items
        .filter((t) => t.active)
        .map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description || '',
          ticketStatus: t.ticketStatus || '',
          commentDescription: t.commentDescription || '',
          internalNote: t.internalNote,
          notifyAssigneesOnly: t.notifyAssigneesOnly,
          selfNote: t.selfNote,
        }))
    : [];

  const handleTemplateInputChange = useCallback(
    (value: string) => {
      setTemplateInput(value);
      setTemplateValue('');
      if (templateDebounceRef.current) clearTimeout(templateDebounceRef.current);
      templateDebounceRef.current = setTimeout(() => {
        const q = value.trim().toLowerCase();
        const next = q
          ? templateOptions.filter((o) => o.name.toLowerCase().includes(q))
          : templateOptions;
        setTemplateFiltered(next);
        setTemplateOptionsOpen(next.length > 0);
      }, 150);
    },
    [templateOptions],
  );

  const handleTemplateSelect = useCallback(
    (opt: (typeof templateOptions)[number]) => {
      setTemplateInput(opt.name);
      setTemplateValue(opt.id);
      setTemplateOptionsOpen(false);
      setTemplateFiltered([]);

      // Populate fields from the template's config
      if (opt.commentDescription) {
        setMessage(serializeRichText(parseRichText(opt.commentDescription).segments));
      }
      if (opt.ticketStatus) {
        // The template stores the status displayName; look up the matching active status
        const match = statusOptions.find(
          (s) => s.label.toLowerCase() === opt.ticketStatus.toLowerCase(),
        );
        setStatusValue(match ? match.id : '');
        setStatusInput(match ? match.label : opt.ticketStatus);
      }
      setIsInternal(opt.internalNote);
      setIsSelfNote(opt.selfNote);
      setNotifyAssigneesOnly(opt.notifyAssigneesOnly);
    },
    [statusOptions],
  );

  const handleTemplateClear = useCallback(() => {
    setTemplateInput('');
    setTemplateValue('');
    setTemplateOptionsOpen(false);
    setTemplateFiltered([]);
  }, []);

  const selectedTemplate = templateValue
    ? (commentTemplates?.items ?? []).find((t) => t.id === templateValue)
    : undefined;

  const toggleTemplateActive = useCallback(async () => {
    if (!selectedTemplate) return;
    try {
      await saveSection('commentTemplates', {
        items: (commentTemplates?.items ?? []).map((t) =>
          t.id === selectedTemplate.id ? { ...t, active: !t.active } : t,
        ),
      });
      notify.success(selectedTemplate.active ? 'Template disabled' : 'Template enabled');
    } catch {
      notify.error('Failed to update template');
    }
  }, [selectedTemplate, commentTemplates, saveSection, notify]);

  // ── Required field validation ──────────────────────────────────────────
  const [touched, setTouched] = useState<{
    template?: boolean;
    status?: boolean;
    message?: boolean;
    templateName?: boolean;
  }>({});
  const [requiredErrors, setRequiredErrors] = useState<{
    template?: string;
    status?: string;
    message?: string;
    templateName?: string;
  }>({});

  const validateRequired = (): {
    template?: string;
    status?: string;
    message?: string;
    templateName?: string;
  } => {
    const errs: typeof requiredErrors = {};
    // Scenario 2: new-template name is required only when saving as a template.
    // Scenario 3 (custom comment, no template): a template is optional.
    if (saveAsTemplate && !newTemplateName.trim()) errs.templateName = 'required';
    if (!statusValue) errs.status = 'required';
    if (!message.trim()) errs.message = 'required';
    return errs;
  };

  // ── Reset fields when dialog opens ──────────────────────────────────────
  useEffect(() => {
    if (open) {
      setMessage('');
      setStatusInput('');
      setStatusValue('');
      setTemplateInput('');
      setTemplateValue('');
      setTemplateOptionsOpen(false);
      setTemplateFiltered([]);
      setStatusOptionsOpen(false);
      setStatusFiltered([]);
      setEmailTo('');
      setEmailFrom('');
      setFiles([]);
      setSaveAsTemplate(false);
      setNewTemplateName('');
      setNewTemplateDescription('');
      setNewTemplateStatusValue('');
      setNewTemplateActive(true);
      setIsSavingTemplate(false);
      setTouched({});
      setRequiredErrors({});
    }
  }, [open]);

  // ── Mode-based pre-sets ─────────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      if (mode === 'internal') {
        setIsInternal(true);
        setIsSelfNote(false);
        setNotifyAssigneesOnly(false);
      } else if (mode === 'self') {
        setIsInternal(false);
        setIsSelfNote(true);
        setNotifyAssigneesOnly(false);
      } else if (mode === 'notify') {
        setIsInternal(true);
        setIsSelfNote(false);
        setNotifyAssigneesOnly(true);
      } else if (mode === 'email') {
        setIsInternal(false);
        setIsSelfNote(false);
        setNotifyAssigneesOnly(false);
      } else {
        setIsInternal(false);
        setIsSelfNote(false);
        setNotifyAssigneesOnly(false);
      }
    }
    setNewTemplateStatusValue(incidentStatus ?? incident.status ?? '');
  }, [open, mode]);

  // ── Reset conflicting toggle when internal is toggled ────────────────────
  useEffect(() => {
    if (!isInternal && notifyAssigneesOnly) {
      setNotifyAssigneesOnly(false);
    }
  }, [isInternal, notifyAssigneesOnly]);

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

  // ── Required-field error renderers ──────────────────────────────────────
  const templateError = reqError(touched.template, requiredErrors.template);
  const statusError = reqError(touched.status, requiredErrors.status);
  const messageError = reqError(touched.message, requiredErrors.message);
  const templateNameError = reqError(touched.templateName, requiredErrors.templateName);

  // ── Save handler ────────────────────────────────────────────────────────
  const handleSave = async () => {
    setTouched({
      template: true,
      status: true,
      message: true,
      templateName: true,
    });
    const errs = validateRequired();
    setRequiredErrors(errs);
    if (Object.keys(errs).length > 0) return;

    // Scenario 2: save the new template to config first; on failure, do not post the comment.
    if (saveAsTemplate) {
      try {
        setIsSavingTemplate(true);
        const now = new Date().toISOString();
        const currentUserName = user ? `${user.firstName} ${user.lastName}`.trim() : '';
        const statusLabel =
          statusOptions.find((o) => o.id === newTemplateStatusValue)?.label ||
          newTemplateStatusValue;
        const newTemplate: IConfigCommentTemplate = {
          id: crypto.randomUUID(),
          name: newTemplateName.trim(),
          description: newTemplateDescription.trim(),
          active: newTemplateActive,
          ticketStatus: statusLabel,
          subjectLine: '',
          commentDescription: message,
          internalNote: isInternal,
          notifyAssigneesOnly,
          selfNote: isSelfNote,
          appendToResolution: false,
          createdBy: currentUserName,
          createdAt: now,
        };
        await saveSection('commentTemplates', {
          items: [...(commentTemplates?.items ?? []), newTemplate],
        });
        // Pre-select the just-saved template in the Response Template field
        setTemplateValue(newTemplate.id);
        setTemplateInput(newTemplate.name);
      } catch {
        setIsSavingTemplate(false);
        notify.error('Failed to save template');
        return;
      }
      setIsSavingTemplate(false);
    }

    try {
      await createComment({
        ticketType: incident.ticketType,
        ticketId: incident.id,
        message,
        isInternal,
        isSelfNote,
        notifyAssigneesOnly,
        isEmail: mode === 'email',
        status: statusValue || incident.status,
        createdBy: user?.email || '',
      }).unwrap();
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
      ? 'Internal note'
      : mode === 'self'
        ? 'Self-note'
        : mode === 'notify'
          ? 'Notify assignees only'
          : mode === 'email'
            ? 'Send Email'
            : 'Add a comment';

  const dialogSubtitle =
    mode === 'internal'
      ? 'Visible to IT team only'
      : mode === 'self'
        ? 'Visible to you only'
        : mode === 'notify'
          ? 'Email will trigger to Assigned to and Secondary resource(s) only'
          : mode === 'email'
            ? 'Send an email note for this ticket'
            : 'A public comment visible to the affected user and ticket followers';

  const footer = (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
      <Button variant='outlined' onClick={onClose}>
        Cancel
      </Button>
      <Button variant='contained' onClick={handleSave} disabled={isLoading || isSavingTemplate}>
        {isSavingTemplate ? 'Saving Template...' : 'Save'}
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
        {/* Response Template + Status — side by side */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1, position: 'relative' }}>
            <TextField
              label='Response Template'
              placeholder='Search templates...'
              value={templateInput}
              onChange={(e) => handleTemplateInputChange(e.target.value)}
              error={Boolean(templateError)}
              helperText={templateError}
              required={saveAsTemplate}
              onFocus={() => {
                const q = templateInput.trim().toLowerCase();
                const next = q
                  ? templateOptions.filter((o) => o.name.toLowerCase().includes(q))
                  : templateOptions;
                setTemplateFiltered(next);
                if (next.length > 0) setTemplateOptionsOpen(true);
              }}
              onBlur={() => {
                setTouched((t) => ({ ...t, template: true }));
                setTimeout(() => setTemplateOptionsOpen(false), 200);
              }}
              fullWidth
              size='small'
              sx={fieldBaseSx}
              slotProps={{
                input: {
                  endAdornment: searchAdornment(templateInput.length > 0, handleTemplateClear),
                },
              }}
            />
            {templateOptionsOpen && templateFiltered.length > 0 && (
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
                {templateFiltered.map((opt: any) => (
                  <Tooltip key={opt.id} title={opt.description || ''} arrow placement='left'>
                    <Box
                      component='div'
                      role='button'
                      tabIndex={0}
                      onClick={() => handleTemplateSelect(opt)}
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
                      {opt.name}
                    </Box>
                  </Tooltip>
                ))}
              </Paper>
            )}
          </Box>
          <Box sx={{ flex: 1, position: 'relative' }}>
            <TextField
              label='Status'
              required
              placeholder='Search statuses...'
              value={statusInput}
              onChange={(e) => handleStatusInputChange(e.target.value)}
              error={Boolean(statusError)}
              helperText={statusError}
              onFocus={() => {
                const q = statusInput.trim().toLowerCase();
                const next = q
                  ? statusOptions.filter((o) => o.label.toLowerCase().includes(q))
                  : statusOptions;
                setStatusFiltered(next);
                if (next.length > 0) setStatusOptionsOpen(true);
              }}
              onBlur={() => {
                setTouched((t) => ({ ...t, status: true }));
                setTimeout(() => setStatusOptionsOpen(false), 200);
              }}
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
        </Box>

        {/* Existing template enable/disable — flip the active flag of the selected template */}
        {selectedTemplate && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 0.75,
              border: '1px solid',
              borderColor: alpha(COMMENT_ACCENT, 0.25),
              bgcolor: alpha(COMMENT_ACCENT, 0.03),
              borderRadius: 1.5,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }}>
                Selected: {selectedTemplate.name}
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>
                {selectedTemplate.active
                  ? 'Template is active — visible in the template list'
                  : 'Template is inactive — hidden from the template list'}
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={selectedTemplate.active}
                  onChange={() => toggleTemplateActive()}
                  size='small'
                  color='primary'
                  sx={{ mr: 1 }}
                />
              }
              label={<Typography sx={{ fontSize: '0.85rem', color: '#374151' }}>Active</Typography>}
            />
          </Box>
        )}

        {/* Save as Template — Scenario 2 toggle */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            px: 2,
            py: 1,
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 1.5,
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={saveAsTemplate}
                onChange={(e) => {
                  setSaveAsTemplate(e.target.checked);
                  if (e.target.checked)
                    setNewTemplateStatusValue(statusValue || incident.status || '');
                }}
                size='small'
                color='primary'
                sx={{ mr: 1 }}
              />
            }
            label={
              <Typography sx={{ fontSize: '0.85rem', color: '#374151', whiteSpace: 'nowrap' }}>
                Save as Template
              </Typography>
            }
          />
          <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
            {saveAsTemplate
              ? 'Comment will also be stored as a reusable Comment Template'
              : 'Comment will not be saved as a template'}
          </Typography>
        </Box>

        {/* New Template fields — shown when saving as a template */}
        {saveAsTemplate && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              px: 2,
              py: 1.5,
              bgcolor: alpha(COMMENT_ACCENT, 0.04),
              border: '1px solid',
              borderColor: alpha(COMMENT_ACCENT, 0.25),
              borderRadius: 1.5,
            }}
          >
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b' }}>
              New Template Details
            </Typography>
            <TextField
              label='Template Name'
              placeholder='Enter template name'
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              error={Boolean(templateNameError)}
              helperText={templateNameError}
              required
              fullWidth
              size='small'
              sx={fieldBaseSx}
            />
            <Box sx={{ position: 'relative' }}>
              <TextField
                label='Template Status'
                placeholder='Status applied when this template is used'
                value={statusOptions.find((o) => o.id === newTemplateStatusValue)?.label || ''}
                onChange={(e) => {
                  const match = statusOptions.find((o) => o.label === e.target.value);
                  setNewTemplateStatusValue(match ? match.id : '');
                }}
                onFocus={() => {
                  const next = statusOptions;
                  setTemplateStatusOptions(next);
                  if (next.length > 0) setTemplateStatusOptionsOpen(true);
                }}
                onBlur={() => {
                  setTimeout(() => setTemplateStatusOptionsOpen(false), 200);
                }}
                fullWidth
                size='small'
                sx={fieldBaseSx}
                slotProps={{
                  input: {
                    endAdornment: searchAdornment(
                      !!statusOptions.find((o) => o.id === newTemplateStatusValue),
                      () => setNewTemplateStatusValue(''),
                    ),
                  },
                }}
              />
              {templateStatusOptionsOpen && (
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
                  {templateStatusOptions.map((o) => (
                    <Box
                      key={o.id}
                      onClick={() => {
                        setNewTemplateStatusValue(o.id);
                        setTemplateStatusOptionsOpen(false);
                      }}
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
                      {o.label}
                    </Box>
                  ))}
                </Paper>
              )}
            </Box>
            <TextField
              label='Description'
              placeholder='Short description (shown as tooltip on the template list)'
              value={newTemplateDescription}
              onChange={(e) => setNewTemplateDescription(e.target.value)}
              fullWidth
              size='small'
              sx={fieldBaseSx}
            />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newTemplateActive}
                    onChange={(e) => setNewTemplateActive(e.target.checked)}
                    size='small'
                    color='primary'
                    sx={{ mr: 1 }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: '0.85rem', color: '#374151', whiteSpace: 'nowrap' }}>
                    Active (enable for future use)
                  </Typography>
                }
              />
            </Box>
            <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>
              The Internal Note, Self-note and Notify assignees only switches below will be saved
              with this template.
            </Typography>
          </Box>
        )}

        {/* Message — RichTextEditor */}
        <Box>
          <RichTextEditor
            value={{ segments: parseRichText(message).segments }}
            onChange={(value) => setMessage(serializeRichText(value.segments))}
            showFooterActions={false}
            title={
              mode === 'internal'
                ? 'Internal note'
                : mode === 'self'
                  ? 'Self-note'
                  : mode === 'notify'
                    ? 'Notify assignees only'
                    : mode === 'email'
                      ? 'Email Comment'
                      : 'Add a comment (visible to affected user)'
            }
            required
          />
          {messageError && (
            <Typography sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
              {messageError}
            </Typography>
          )}
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              py: 2,
              borderTop: '1px solid',
              borderTopColor: 'divider',
              borderBottom: '1px solid',
              borderBottomColor: 'divider',
            }}
          >
            {[
              {
                key: 'internal' as const,
                checked: isInternal,
                set: setIsInternal,
                label: 'Internal Note',
              },
              {
                key: 'self' as const,
                checked: isSelfNote,
                set: setIsSelfNote,
                label: 'Self-note',
              },
              {
                key: 'notify' as const,
                checked: notifyAssigneesOnly,
                set: setNotifyAssigneesOnly,
                label: 'Notify assignees only',
              },
            ].map(({ key, checked, set, label }) => (
              <Box key={key} sx={{ flex: '1 1 0', minWidth: 0 }}>
                <FormControlLabel
                  labelPlacement='start'
                  control={
                    <Switch
                      checked={checked}
                      onChange={(e) => set(e.target.checked)}
                      size='small'
                      sx={{ mr: 1 }}
                    />
                  }
                  label={
                    <Typography
                      sx={{
                        fontSize: '0.85rem',
                        color: '#374151',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {label}
                    </Typography>
                  }
                />
              </Box>
            ))}
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
