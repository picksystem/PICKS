import { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Button, TextField, Paper } from '../../../../components';
import { alpha, darken, InputAdornment } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon, CloudUploadOutlined as CloudUploadOutlinedIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { ResolutionCode } from '@serviceops/interfaces';
import { useCreateTicketResolutionMutation } from '../../../../../services';
import { useAuth, useNotification } from '@serviceops/hooks';
import { TicketEntity, UpdateTicketFn } from '../types/ticketDetail.types';
import { ConfigFormDialog } from '@serviceops/configdialogs';
import { useConfiguration } from '@serviceops/confighooks';

const RESOLVE_ACCENT = '#0369a1';

interface ResolveWindowProps {
  open: boolean;
  onClose: () => void;
  incident: TicketEntity;
  onUpdateTicket: UpdateTicketFn;
  onSuccess: () => void;
}

const ResolveWindow = ({
  open,
  onClose,
  incident,
  onUpdateTicket,
  onSuccess,
}: ResolveWindowProps) => {
  const { user } = useAuth();
  const { statuses, resolutionTemplates, reasonCodes } = useConfiguration();
  const [createResolution, { isLoading: resLoading }] = useCreateTicketResolutionMutation();
  const [updLoading, setUpdLoading] = useState(false);
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [customerConfirmation, setCustomerConfirmation] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [rootCauseIdentified, setRootCauseIdentified] = useState(false);
  const [rootCause, setRootCause] = useState('');
  const [resolutionCode, setResolutionCode] = useState('');
  const [resolution, setResolution] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const notify = useNotification();

  const isLoading = resLoading || updLoading;

  // ── Build options from configuration ──────────────────────────────────────
  const statusList = statuses?.items
    ? statuses.items
        .filter((s) => s.isActive)
        .map((s) => ({ id: String(s.id), label: s.displayName || s.name }))
    : [];

  const templateList = resolutionTemplates?.items
    ? resolutionTemplates.items
        .filter((t) => t.active)
        .map((t) => ({ id: String(t.id), label: t.name }))
    : [];

  const resolutionCodeList = reasonCodes?.resolutionCodes
    ? reasonCodes.resolutionCodes
        .filter((r) => r.activate)
        .map((r) => ({
          id: r.name,
          label: r.name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        }))
    : Object.values(ResolutionCode).map((v) => ({
        id: v,
        label: v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      }));

  // ── Status search ─────────────────────────────────────────────────────────
  const [statusInput, setStatusInput] = useState('');
  const [statusOptionsOpen, setStatusOptionsOpen] = useState(false);
  const [statusFiltered, setStatusFiltered] = useState<{ id: string; label: string }[]>([]);
  const statusDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    setStatusOptionsOpen(false);
    setStatusFiltered([]);
  }, []);

  const handleStatusClear = useCallback(() => {
    setStatusInput('');
    setStatusOptionsOpen(false);
    setStatusFiltered([]);
  }, []);

  // ── Resolution Template search ─────────────────────────────────────────────
  const [templateInput, setTemplateInput] = useState('');
  const [templateOptionsOpen, setTemplateOptionsOpen] = useState(false);
  const [templateFiltered, setTemplateFiltered] = useState<{ id: string; label: string }[]>([]);
  const templateDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTemplateInputChange = useCallback(
    (value: string) => {
      setTemplateInput(value);
      if (templateDebounceRef.current) clearTimeout(templateDebounceRef.current);
      templateDebounceRef.current = setTimeout(() => {
        const q = value.trim().toLowerCase();
        const next = q
          ? templateList.filter((o) => o.label.toLowerCase().includes(q))
          : templateList;
        setTemplateFiltered(next);
        setTemplateOptionsOpen(next.length > 0);
      }, 150);
    },
    [templateList],
  );

  const handleTemplateSelect = useCallback((opt: { id: string; label: string }) => {
    setTemplateInput(opt.label);
    setTemplateOptionsOpen(false);
    setTemplateFiltered([]);
  }, []);

  const handleTemplateClear = useCallback(() => {
    setTemplateInput('');
    setTemplateOptionsOpen(false);
    setTemplateFiltered([]);
  }, []);

  // ── Resolution Code search ─────────────────────────────────────────────────
  const [resCodeInput, setResCodeInput] = useState('');
  const [resCodeOptionsOpen, setResCodeOptionsOpen] = useState(false);
  const [resCodeFiltered, setResCodeFiltered] = useState<{ id: string; label: string }[]>([]);
  const resCodeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleResCodeInputChange = useCallback(
    (value: string) => {
      setResCodeInput(value);
      if (resCodeDebounceRef.current) clearTimeout(resCodeDebounceRef.current);
      resCodeDebounceRef.current = setTimeout(() => {
        const q = value.trim().toLowerCase();
        const next = q
          ? resolutionCodeList.filter((o) => o.label.toLowerCase().includes(q))
          : resolutionCodeList;
        setResCodeFiltered(next);
        setResCodeOptionsOpen(next.length > 0);
      }, 150);
    },
    [resolutionCodeList],
  );

  const handleResCodeSelect = useCallback((opt: { id: string; label: string }) => {
    setResCodeInput(opt.label);
    setResolutionCode(opt.id);
    setResCodeOptionsOpen(false);
    setResCodeFiltered([]);
  }, []);

  const handleResCodeClear = useCallback(() => {
    setResCodeInput('');
    setResolutionCode('');
    setResCodeOptionsOpen(false);
    setResCodeFiltered([]);
  }, []);

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

  // ── Reset fields when dialog opens ────────────────────────────────────────
  useEffect(() => {
    if (open) {
      setStatusInput('');
      setTemplateInput('');
      setResCodeInput('');
      setResolutionCode('');
      setCategory('');
      setSubCategory('');
      setCustomerConfirmation(false);
      setIsRecurring(false);
      setRootCauseIdentified(false);
      setRootCause('');
      setResolution('');
      setInternalNote('');
    }
  }, [open]);

  // ── Save handler ──────────────────────────────────────────────────────────
  const handleSave = async (closeAfter = false) => {
    if (!resolutionCode) {
      notify.error('Resolution code is required');
      return;
    }
    if (!resolution.trim()) {
      notify.error('Resolution text is required');
      return;
    }
    try {
      await createResolution({
        ticketType: incident.ticketType,
        ticketId: incident.id,
        application: incident.application || undefined,
        category: category || undefined,
        subCategory: subCategory || undefined,
        customerConfirmation,
        isRecurring,
        rootCauseIdentified,
        rootCause: rootCause || undefined,
        resolutionCode: resolutionCode as ResolutionCode,
        resolution,
        internalNote: internalNote || undefined,
        createdBy: user?.email || '',
      }).unwrap();

      setUpdLoading(true);
      await onUpdateTicket({
        id: incident.id,
        data: { status: 'resolved' },
      }).unwrap();

      onSuccess();
      if (closeAfter) onClose();
    } catch {
      notify.error('Failed to resolve ticket');
    } finally {
      setUpdLoading(false);
    }
  };

  return (
    <ConfigFormDialog
      open={open}
      onClose={onClose}
      onSubmit={() => handleSave(true)}
      isEdit={false}
      icon={<CheckCircleIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
      accent={RESOLVE_ACCENT}
      title='Resolve Ticket'
      subtitle='Add resolution details to this ticket'
      submitDisabled={false}
      submitLabel='Save'
      hideActions
      maxWidth='md'
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {/* Status & Resolution Template row */}
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          {/* Status */}
          <Box sx={{ flex: 1, minWidth: 0, position: 'relative' }}>
            <TextField
              label='Status'
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
                      '&:hover': { bgcolor: alpha(RESOLVE_ACCENT, 0.08) },
                    }}
                  >
                    {opt.label}
                  </Box>
                ))}
              </Paper>
            )}
          </Box>

          {/* Resolution Template */}
          <Box sx={{ flex: 1, minWidth: 0, position: 'relative' }}>
            <TextField
              label='Resolution Template'
              placeholder='Search templates...'
              value={templateInput}
              onChange={(e) => handleTemplateInputChange(e.target.value)}
              onFocus={() => {
                const q = templateInput.trim().toLowerCase();
                const next = q
                  ? templateList.filter((o) => o.label.toLowerCase().includes(q))
                  : templateList;
                setTemplateFiltered(next);
                if (next.length > 0) setTemplateOptionsOpen(true);
              }}
              onBlur={() => setTimeout(() => setTemplateOptionsOpen(false), 200)}
              size='small'
              fullWidth
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
                {templateFiltered.map((opt) => (
                  <Box
                    key={opt.id}
                    onClick={() => handleTemplateSelect(opt)}
                    sx={{
                      px: 1.5,
                      py: 1,
                      cursor: 'pointer',
                      fontSize: '0.84rem',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': { borderBottom: 'none' },
                      '&:hover': { bgcolor: alpha(RESOLVE_ACCENT, 0.08) },
                    }}
                  >
                    {opt.label}
                  </Box>
                ))}
              </Paper>
            )}
          </Box>
        </Box>

        {/* Application */}
        <TextField
          label='Application'
          value={incident.application || ''}
          disabled
          size='small'
          fullWidth
        />

        {/* Category & Sub-category row */}
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <TextField
              label='Category'
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              size='small'
              fullWidth
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <TextField
              label='Sub-category'
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              size='small'
              fullWidth
            />
          </Box>
        </Box>

        {/* Checkboxes */}
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box
              component='input'
              type='checkbox'
              id='customer-confirmation'
              checked={customerConfirmation}
              onChange={() => setCustomerConfirmation(!customerConfirmation)}
            />
            <label
              htmlFor='customer-confirmation'
              style={{ fontSize: '0.85rem', color: '#374151', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Customer Confirmation
            </label>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box
              component='input'
              type='checkbox'
              id='recurring-issue'
              checked={isRecurring}
              onChange={() => setIsRecurring(!isRecurring)}
            />
            <label
              htmlFor='recurring-issue'
              style={{ fontSize: '0.85rem', color: '#374151', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Recurring Issue
            </label>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box
              component='input'
              type='checkbox'
              id='root-cause'
              checked={rootCauseIdentified}
              onChange={() => setRootCauseIdentified(!rootCauseIdentified)}
            />
            <label
              htmlFor='root-cause'
              style={{ fontSize: '0.85rem', color: '#374151', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Root Cause Identified
            </label>
          </Box>
        </Box>

        {/* Root Cause (conditional) */}
        {rootCauseIdentified && (
          <TextField
            label='Root Cause'
            value={rootCause}
            onChange={(e) => setRootCause(e.target.value)}
            multiline
            minRows={2}
            maxRows={8}
            size='small'
            fullWidth
          />
        )}

        {/* Resolution Code — searchable dropdown */}
        <Box sx={{ position: 'relative' }}>
          <TextField
            label='Resolution Code'
            placeholder='Search resolution codes...'
            value={resCodeInput}
            onChange={(e) => handleResCodeInputChange(e.target.value)}
            onFocus={() => {
              const q = resCodeInput.trim().toLowerCase();
              const next = q
                ? resolutionCodeList.filter((o) => o.label.toLowerCase().includes(q))
                : resolutionCodeList;
              setResCodeFiltered(next);
              if (next.length > 0) setResCodeOptionsOpen(true);
            }}
            onBlur={() => setTimeout(() => setResCodeOptionsOpen(false), 200)}
            size='small'
            fullWidth
            slotProps={{
              input: {
                endAdornment: searchAdornment(resCodeInput.length > 0, handleResCodeClear),
              },
            }}
          />
          {resCodeOptionsOpen && resCodeFiltered.length > 0 && (
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
              {resCodeFiltered.map((opt) => (
                <Box
                  key={opt.id}
                  onClick={() => handleResCodeSelect(opt)}
                  sx={{
                    px: 1.5,
                    py: 1,
                    cursor: 'pointer',
                    fontSize: '0.84rem',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 'none' },
                    '&:hover': { bgcolor: alpha(RESOLVE_ACCENT, 0.08) },
                  }}
                >
                  {opt.label}
                </Box>
              ))}
            </Paper>
          )}
        </Box>

        {/* Resolution, Internal Note & File Upload in dashed border container */}
        <Box
          sx={{
            border: '2px dashed #d1d5db',
            borderRadius: '6px',
            p: 2.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
            bgcolor: '#fafafa',
          }}
        >
          {/* Resolution */}
          <TextField
            label='Resolution'
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            multiline
            minRows={4}
            size='small'
            fullWidth
            required
          />

          {/* Internal Note */}
          <TextField
            label='Internal Note'
            value={internalNote}
            onChange={(e) => setInternalNote(e.target.value)}
            multiline
            minRows={4}
            size='small'
            fullWidth
          />

          {/* File Upload */}
          <Box
            onClick={() => document.querySelector<HTMLInputElement>('.resolve-upload-input')?.click()}
            sx={{
              border: '2px dashed #d1d5db',
              borderRadius: '4px',
              p: '20px 16px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
              bgcolor: '#f9fafb',
              '&:hover': {
                borderColor: RESOLVE_ACCENT,
                bgcolor: alpha(RESOLVE_ACCENT, 0.02),
              },
            }}
          >
            <input
              type='file'
              className='resolve-upload-input'
              style={{ display: 'none' }}
              onChange={() => {}}
            />
            <Box sx={{ mb: 1.5 }}>
              <CloudUploadOutlinedIcon sx={{ fontSize: 32, color: '#9ca3af' }} />
            </Box>
            <Button
              variant='contained'
              size='small'
              sx={{
                bgcolor: '#2d5ebb',
                '&:hover': { bgcolor: '#1e40af' },
                textTransform: 'none',
                px: 3,
                py: 0.75,
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: '4px',
              }}
            >
              CHOOSE FILE
            </Button>
          </Box>
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
              borderColor: alpha(RESOLVE_ACCENT, 0.4),
              color: darken(RESOLVE_ACCENT, 0.15),
              '&:hover': {
                borderColor: RESOLVE_ACCENT,
                bgcolor: alpha(RESOLVE_ACCENT, 0.04),
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleSave(false)}
            disabled={isLoading}
            variant='contained'
            sx={{
              textTransform: 'none',
              width: { xs: '100%', sm: 'auto' },
              bgcolor: RESOLVE_ACCENT,
              '&:hover': { bgcolor: darken(RESOLVE_ACCENT, 0.15) },
              '&.Mui-disabled': {
                bgcolor: alpha(RESOLVE_ACCENT, 0.4),
              },
            }}
          >
            Save
          </Button>
          <Button
            onClick={() => handleSave(true)}
            disabled={isLoading}
            variant='contained'
            sx={{
              textTransform: 'none',
              width: { xs: '100%', sm: 'auto' },
              bgcolor: RESOLVE_ACCENT,
              '&:hover': { bgcolor: darken(RESOLVE_ACCENT, 0.15) },
              '&.Mui-disabled': {
                bgcolor: alpha(RESOLVE_ACCENT, 0.4),
              },
            }}
          >
            Save & Close
          </Button>
        </Box>
      </Box>
    </ConfigFormDialog>
  );
};

export default ResolveWindow;
