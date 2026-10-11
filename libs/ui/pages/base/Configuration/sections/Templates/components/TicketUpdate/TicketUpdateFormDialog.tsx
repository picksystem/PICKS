import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, TextField, Button, FormControlLabel } from '@serviceops/component';
import {
  alpha,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  darken,
  Dialog,
  DialogContent,
  DialogActions,
  Divider,
  Switch,
} from '@mui/material';
import { Clear as ClearIcon, Search as SearchIcon } from '@mui/icons-material';
import { RichTextEditor, parseRichText } from '@serviceops/richtexteditor';
import type { IConfigTicketUpdateTemplate } from '@serviceops/interfaces';
import { useFieldError } from '@serviceops/hooks';
import FileCopyIcon from '@mui/icons-material/FileCopy';

interface TicketUpdateFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'select';
  initialData?: IConfigTicketUpdateTemplate | null;
  onSave: (data: Record<string, unknown>) => void;
  accent?: string;
  statusOptions?: { value: string; label: string }[];
}

const createEmptyForm = () => ({
  name: '',
  description: '',
  active: true,
  ticketStatus: '',
  commentDescription: '',
  internalNote: false,
  notifyAssigneesOnly: false,
  selfNote: false,
});

interface FormState {
  name: string;
  description: string;
  active: boolean;
  ticketStatus: string;
  commentDescription: string;
  internalNote: boolean;
  notifyAssigneesOnly: boolean;
  selfNote: boolean;
}

export const TicketUpdateFormDialog = ({
  open,
  onClose,
  mode,
  initialData,
  onSave,
  accent = '#0369a1',
  statusOptions = [],
}: TicketUpdateFormDialogProps) => {
  const [form, setForm] = useState<FormState>(createEmptyForm());
  const [touched, setTouched] = useState<{
    name?: boolean;
    ticketStatus?: boolean;
    description?: boolean;
    commentDescription?: boolean;
  }>({});
  const [requiredErrors, setRequiredErrors] = useState<{
    name?: string;
    ticketStatus?: string;
    description?: string;
    commentDescription?: string;
  }>({});

  const reqError = useFieldError();

  // ── Ticket Status search state ───────────────────────────────────────
  const [tsInput, setTsInput] = useState<string>('');
  const [tsOptionsOpen, setTsOptionsOpen] = useState(false);
  const [tsFiltered, setTsFiltered] = useState<{ value: string; label: string }[]>([]);
  const tsDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stored = String(form.ticketStatus ?? '');
    if (stored !== tsInput) setTsInput(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.ticketStatus]);

  const handleTsSelect = useCallback((opt: { value: string; label: string }) => {
    setTsInput(opt.label);
    setTsOptionsOpen(false);
    setTsFiltered([]);
    setTouched((t) => ({ ...t, ticketStatus: true }));
    setForm((prev) => ({ ...prev, ticketStatus: opt.value }));
  }, []);

  const handleTsClear = useCallback(() => {
    setTsInput('');
    setTsFiltered([]);
    setTsOptionsOpen(false);
    setForm((prev) => ({ ...prev, ticketStatus: '' }));
  }, []);

  const validateRequired = (
    f: FormState,
  ): {
    name?: string;
    ticketStatus?: string;
    description?: string;
    commentDescription?: string;
  } => {
    const errs: typeof requiredErrors = {};
    if (!String(f.name ?? '').trim()) errs.name = 'required';
    if (!String(f.ticketStatus ?? '').trim()) errs.ticketStatus = 'required';
    if (!String(f.description ?? '').trim()) errs.description = 'required';
    if (!String(f.commentDescription ?? '').trim()) errs.commentDescription = 'required';
    return errs;
  };

  const handleChange = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (!open) return;
    setTouched({});
    setRequiredErrors({});
    if (initialData) {
      setForm({
        name: initialData.name,
        description: initialData.description,
        active: initialData.active,
        ticketStatus: initialData.ticketStatus,
        commentDescription: initialData.commentDescription,
        internalNote: initialData.internalNote,
        notifyAssigneesOnly: initialData.notifyAssigneesOnly,
        selfNote: initialData.selfNote,
      });
    } else {
      setForm(createEmptyForm());
    }
    setTsInput('');
    setTsFiltered([]);
    setTsOptionsOpen(false);
  }, [open, initialData]);

  const handleSubmit = () => {
    setTouched({ name: true, ticketStatus: true, description: true, commentDescription: true });
    const errs = validateRequired(form);
    setRequiredErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const template: Record<string, unknown> = { ...form };
    // Only include id in edit mode — let the section generate it for new items
    if (initialData?.id) {
      template.id = initialData.id;
    }
    onSave(template);
  };

  const nameError = reqError(touched.name, requiredErrors.name);
  const ticketStatusError = reqError(touched.ticketStatus, requiredErrors.ticketStatus);
  const descriptionError = reqError(touched.description, requiredErrors.description);
  const commentError = reqError(touched.commentDescription, requiredErrors.commentDescription);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
      disableEscapeKeyDown
      TransitionProps={{ unmountOnExit: true }}
      PaperProps={{ sx: { borderRadius: 2, overflow: 'hidden' } }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          background: `linear-gradient(135deg, ${darken(accent, 0.15)} 0%, ${accent} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 1,
              bgcolor: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileCopyIcon sx={{ fontSize: '1rem', color: '#fff' }} />
          </Box>
          <Box>
            <Typography
              sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', lineHeight: 1.2 }}
            >
              {mode === 'edit' ? 'Edit Ticket Update Template' : 'Add Ticket Update Template'}
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', mt: 0.2 }}>
              Define reusable template for ticket status updates
            </Typography>
          </Box>
        </Box>
      </Box>

      <DialogContent dividers sx={{ p: 0 }}>
        <Box sx={{ px: 2.5, py: 2 }}>
          {/* Row 1: Template Name + Ticket Status side-by-side */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
            <Box>
              <TextField
                label='Template Name'
                size='small'
                fullWidth
                value={form.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange('name', e.target.value)
                }
                required
                placeholder='Enter template name'
                inputProps={{ maxLength: 40 }}
                error={Boolean(nameError)}
                helperText={nameError}
              />
            </Box>
            <Box sx={{ position: 'relative' }}>
              <TextField
                label='Ticket Status'
                size='small'
                fullWidth
                value={tsInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setTsInput(val);
                  if (tsDebounceRef.current) clearTimeout(tsDebounceRef.current);
                  tsDebounceRef.current = setTimeout(() => {
                    const q = val.trim().toLowerCase();
                    const next = q
                      ? statusOptions.filter((o) => o.label.toLowerCase().includes(q))
                      : statusOptions;
                    setTsFiltered(next);
                    setTsOptionsOpen(next.length > 0);
                  }, 150);
                }}
                onFocus={() => {
                  const q = tsInput.trim().toLowerCase();
                  const next = q
                    ? statusOptions.filter((o) => o.label.toLowerCase().includes(q))
                    : statusOptions;
                  setTsFiltered(next);
                  if (next.length > 0) setTsOptionsOpen(true);
                }}
                onBlur={() => setTimeout(() => setTsOptionsOpen(false), 150)}
                placeholder='Search ticket status...'
                required
                error={Boolean(ticketStatusError)}
                helperText={ticketStatusError}
                slotProps={{
                  input: {
                    endAdornment: tsInput ? (
                      <InputAdornment position='end'>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <ClearIcon
                            onClick={handleTsClear}
                            sx={{ fontSize: 18, color: 'text.primary', cursor: 'pointer' }}
                          />
                        </Box>
                      </InputAdornment>
                    ) : (
                      <InputAdornment position='end'>
                        <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              {tsOptionsOpen && tsFiltered.length > 0 && (
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
                    {tsFiltered.map((opt) => (
                      <ListItem key={opt.value} disablePadding>
                        <ListItemButton
                          onClick={() => handleTsSelect(opt)}
                          sx={{
                            py: 1,
                            px: 1.5,
                            '&:hover': { bgcolor: alpha(accent, 0.08) },
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
          </Box>

          {/* Row 2: Description (RichTextEditor) */}
          <Box sx={{ mb: 2 }}>
            <RichTextEditor
              value={parseRichText(form.description)}
              onChange={(value: { segments: Array<{ text: string }> }) => {
                const text = value.segments.map((s) => s.text).join('');
                handleChange('description', text);
              }}
              accent={accent}
              title='Description'
              placeholder='Enter description...'
              showFooterActions={false}
              required
            />
            {descriptionError && (
              <Typography sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                {descriptionError}
              </Typography>
            )}
          </Box>

          {/* Row 3: Comment (RichTextEditor) */}
          <Box sx={{ mb: 2 }}>
            <RichTextEditor
              value={parseRichText(form.commentDescription)}
              onChange={(value: { segments: Array<{ text: string }> }) => {
                const text = value.segments.map((s) => s.text).join('');
                handleChange('commentDescription', text);
              }}
              accent={accent}
              title='Comment'
              placeholder='Enter comment...'
              showFooterActions={false}
              required
            />
            {commentError && (
              <Typography sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                {commentError}
              </Typography>
            )}
          </Box>

          {/* Row 4: Toggle fields - label first, then standard MUI switch */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Divider />
            <Box
              sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 2 }}
            >
              {[
                { key: 'active', label: 'Active' },
                { key: 'internalNote', label: 'Internal Note' },
                { key: 'notifyAssigneesOnly', label: 'Notify Assignees Only' },
                { key: 'selfNote', label: 'Self Note' },
              ].map(({ key, label }) => (
                <FormControlLabel
                  key={key}
                  labelPlacement='start'
                  control={
                    <Switch
                      checked={form[key as keyof FormState] as boolean}
                      onChange={(e) => handleChange(key as keyof FormState, e.target.checked)}
                      size='small'
                    />
                  }
                  label={label}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      {/* Actions */}
      <DialogActions
        sx={{ px: 2.5, py: 1.5, borderTop: '1px solid', borderColor: 'divider', gap: 1 }}
      >
        <Button onClick={onClose} variant='outlined'>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant='contained'>
          {mode === 'edit' ? 'Update' : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
