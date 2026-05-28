import React from 'react';
import { Button, Box, Typography } from '@serviceops/component';
import { Dialog, DialogContent, DialogActions, alpha, darken } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { ConfigFormDialogProps } from './util';

export const ConfigFormDialog = ({
  open,
  onClose,
  onSubmit,
  isEdit,
  icon,
  accent,
  title,
  newTitle,
  editTitle,
  subtitle,
  editSubtitle,
  submitDisabled,
  submitLabel,
  maxWidth = 'sm',
  children,
}: ConfigFormDialogProps) => {
  const resolvedTitle = editTitle ?? (isEdit ? `Edit ${title}` : `Add ${title}`);
  const resolvedSubtitle = isEdit ? (editSubtitle ?? subtitle ?? '') : (subtitle ?? '');
  const resolvedSubmitLabel = submitLabel ?? (isEdit ? 'Save' : 'Submit');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      disableEscapeKeyDown
      TransitionProps={{ unmountOnExit: true }}
      PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
    >
      <Box
        sx={{
          px: 3,
          py: 2.5,
          background: `linear-gradient(135deg, ${darken(accent, 0.18)} 0%, ${accent} 100%)`,
          display: 'flex',
          alignItems: 'center',
          gap: 1.75,
        }}
      >
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 1.5,
            bgcolor: 'rgba(255,255,255,0.18)',
            border: '1.5px solid rgba(255,255,255,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Box
            sx={{ color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {icon}
          </Box>
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff', lineHeight: 1.2 }}>
            {resolvedTitle}
          </Typography>
          {resolvedSubtitle && (
            <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', mt: 0.3 }}>
              {resolvedSubtitle}
            </Typography>
          )}
        </Box>
      </Box>

      <DialogContent dividers sx={{ p: 0 }}>
        <Box sx={{ px: 3, py: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {children}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Button
          onClick={onClose}
          variant='outlined'
          sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
        >
          Cancel
        </Button>
        <Button
          variant='contained'
          onClick={onSubmit}
          disabled={submitDisabled}
          sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
        >
          {resolvedSubmitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export interface ConfigDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  entityName: string;
  itemName?: string;
  message?: React.ReactNode;
  confirmLabel?: string;
}

export const ConfigDeleteDialog = ({
  open,
  onClose,
  onConfirm,
  entityName,
  itemName,
  message,
  confirmLabel,
}: ConfigDeleteDialogProps) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth='xs'
    fullWidth
    disableEscapeKeyDown
    TransitionProps={{ unmountOnExit: true }}
    PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
  >
    <Box sx={{ px: 2.5, pt: 2.5, pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1.5,
          bgcolor: alpha('#dc2626', 0.1),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <DeleteOutlineIcon sx={{ color: '#dc2626', fontSize: '1.1rem' }} />
      </Box>
      <Box>
        <Typography fontWeight={700} fontSize='0.95rem'>
          Delete
        </Typography>
        <Typography variant='caption' color='text.secondary'>
          This action cannot be undone
        </Typography>
      </Box>
    </Box>

    <DialogContent sx={{ px: 2.5, pt: 1, pb: 1.5 }}>
      {message ?? (
        <Typography variant='body2' color='text.secondary'>
          Are you sure you want to delete{' '}
          {itemName && (
            <Typography component='span' fontWeight={700} color='text.primary' variant='body2'>
              {itemName}
            </Typography>
          )}
          {itemName ? '?' : 'this record?'} All associated data will be permanently removed.
        </Typography>
      )}
    </DialogContent>

    <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
      <Button
        onClick={onClose}
        variant='outlined'
        sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
      >
        Cancel
      </Button>
      <Button
        variant='contained'
        color='error'
        onClick={onConfirm}
        sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
      >
        Delete
      </Button>
    </DialogActions>
  </Dialog>
);
