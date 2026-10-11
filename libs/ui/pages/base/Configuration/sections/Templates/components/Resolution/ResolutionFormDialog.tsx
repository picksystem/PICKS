import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, FormControlLabel } from '@serviceops/component';
import { darken, Dialog, DialogContent, DialogActions, Divider, Switch } from '@mui/material';
import { RichTextEditor, parseRichText } from '@serviceops/richtexteditor';
import type { IConfigResolutionTemplate } from '@serviceops/interfaces';
import { useFieldError } from '@serviceops/hooks';
import ChecklistIcon from '@mui/icons-material/Checklist';

interface ResolutionFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'select';
  initialData?: IConfigResolutionTemplate | null;
  onSave: (data: Record<string, unknown>) => void;
  accent?: string;
}

const createEmptyForm = () => ({
  name: '',
  description: '',
  active: true,
  ticketStatus: '',
  application: '',
  applicationCategory: '',
  applicationSubCategory: '',
  receivedCustomerInformation: false,
  recurringIssue: false,
  rootCauseIdentified: false,
  rootCause: '',
  resolutionCode: '',
  resolution: '',
  resolutionInternalNote: '',
});

interface FormState {
  name: string;
  description: string;
  active: boolean;
  ticketStatus: string;
  application: string;
  applicationCategory: string;
  applicationSubCategory: string;
  receivedCustomerInformation: boolean;
  recurringIssue: boolean;
  rootCauseIdentified: boolean;
  rootCause: string;
  resolutionCode: string;
  resolution: string;
  resolutionInternalNote: string;
}

export const ResolutionFormDialog = ({
  open,
  onClose,
  mode,
  initialData,
  onSave,
  accent = '#0369a1',
}: ResolutionFormDialogProps) => {
  const [form, setForm] = useState<FormState>(createEmptyForm());
  const [touched, setTouched] = useState<{
    name?: boolean;
    ticketStatus?: boolean;
    description?: boolean;
    resolution?: boolean;
  }>({});
  const [requiredErrors, setRequiredErrors] = useState<{
    name?: string;
    ticketStatus?: string;
    description?: string;
    resolution?: string;
  }>({});

  const reqError = useFieldError();

  const validateRequired = (
    f: FormState,
  ): {
    name?: string;
    ticketStatus?: string;
    description?: string;
    resolution?: string;
  } => {
    const errs: typeof requiredErrors = {};
    if (!String(f.name ?? '').trim()) errs.name = 'required';
    if (!String(f.ticketStatus ?? '').trim()) errs.ticketStatus = 'required';
    if (!String(f.description ?? '').trim()) errs.description = 'required';
    if (!String(f.resolution ?? '').trim()) errs.resolution = 'required';
    return errs;
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
        application: initialData.application,
        applicationCategory: initialData.applicationCategory,
        applicationSubCategory: initialData.applicationSubCategory,
        receivedCustomerInformation: initialData.receivedCustomerInformation,
        recurringIssue: initialData.recurringIssue,
        rootCauseIdentified: initialData.rootCauseIdentified,
        rootCause: initialData.rootCause,
        resolutionCode: initialData.resolutionCode,
        resolution: initialData.resolution,
        resolutionInternalNote: initialData.resolutionInternalNote,
      });
    } else {
      setForm(createEmptyForm());
    }
  }, [open, initialData]);

  const handleChange = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    setTouched({ name: true, ticketStatus: true, description: true, resolution: true });
    const errs = validateRequired(form);
    setRequiredErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const template: Record<string, unknown> = { ...form };
    if (initialData?.id) {
      template.id = initialData.id;
    }
    onSave(template);
  };

  const nameError = reqError(touched.name, requiredErrors.name);
  const ticketStatusError = reqError(touched.ticketStatus, requiredErrors.ticketStatus);
  const descriptionError = reqError(touched.description, requiredErrors.description);
  const resolutionError = reqError(touched.resolution, requiredErrors.resolution);

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
            <ChecklistIcon sx={{ fontSize: '1rem', color: '#fff' }} />
          </Box>
          <Box>
            <Typography
              sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', lineHeight: 1.2 }}
            >
              {mode === 'edit' ? 'Edit Resolution Template' : 'Add Resolution Template'}
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', mt: 0.2 }}>
              Define reusable resolution templates with root cause and resolution details
            </Typography>
          </Box>
        </Box>
      </Box>

      <DialogContent dividers sx={{ p: 0 }}>
        <Box sx={{ px: 2.5, py: 2 }}>
          {/* Row 1: Name */}
          <Box sx={{ mb: 2 }}>
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

          {/* Row 2: Ticket Status + Application side-by-side */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
            <TextField
              label='Ticket Status'
              size='small'
              fullWidth
              value={form.ticketStatus}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange('ticketStatus', e.target.value)
              }
              required
              placeholder='Enter ticket status'
              error={Boolean(ticketStatusError)}
              helperText={ticketStatusError}
            />
            <TextField
              label='Application'
              size='small'
              fullWidth
              value={form.application}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange('application', e.target.value)
              }
              placeholder='Enter application'
            />
          </Box>

          {/* Row 3: App Category + App Sub-Category side-by-side */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
            <TextField
              label='Application Category'
              size='small'
              fullWidth
              value={form.applicationCategory}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange('applicationCategory', e.target.value)
              }
              placeholder='Enter application category'
            />
            <TextField
              label='Application Sub-Category'
              size='small'
              fullWidth
              value={form.applicationSubCategory}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange('applicationSubCategory', e.target.value)
              }
              placeholder='Enter application sub-category'
            />
          </Box>

          {/* Row 4: Root Cause + Resolution Code side-by-side */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
            <TextField
              label='Root Cause'
              size='small'
              fullWidth
              value={form.rootCause}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange('rootCause', e.target.value)
              }
              placeholder='Enter root cause'
            />
            <TextField
              label='Resolution Code'
              size='small'
              fullWidth
              value={form.resolutionCode}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange('resolutionCode', e.target.value)
              }
              placeholder='Enter resolution code'
            />
          </Box>

          {/* Row 5: Description (RichTextEditor) */}
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

          {/* Row 6: Resolution (RichTextEditor) */}
          <Box sx={{ mb: 2 }}>
            <RichTextEditor
              value={parseRichText(form.resolution)}
              onChange={(value: { segments: Array<{ text: string }> }) => {
                const text = value.segments.map((s) => s.text).join('');
                handleChange('resolution', text);
              }}
              accent={accent}
              title='Resolution'
              placeholder='Enter resolution...'
              showFooterActions={false}
              required
            />
            {resolutionError && (
              <Typography sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                {resolutionError}
              </Typography>
            )}
          </Box>

          {/* Row 7: Resolution Internal Note */}
          <Box sx={{ mb: 2 }}>
            <RichTextEditor
              value={parseRichText(form.resolutionInternalNote)}
              onChange={(value: { segments: Array<{ text: string }> }) => {
                const text = value.segments.map((s) => s.text).join('');
                handleChange('resolutionInternalNote', text);
              }}
              accent={accent}
              title='Resolution Internal Note'
              placeholder='Enter internal note...'
              showFooterActions={false}
            />
          </Box>

          {/* Row 8: Toggle fields */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Divider />
            <Box
              sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 2 }}
            >
              {[
                { key: 'active', label: 'Active' },
                { key: 'receivedCustomerInformation', label: 'Received Customer Information' },
                { key: 'recurringIssue', label: 'Recurring Issue' },
                { key: 'rootCauseIdentified', label: 'Root Cause Identified' },
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
