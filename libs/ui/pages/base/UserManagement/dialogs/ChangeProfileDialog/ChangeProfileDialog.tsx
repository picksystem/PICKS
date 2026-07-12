import { useState } from 'react';
import {
  UserAvatar,
  Box,
  Typography,
  IconButton,
  Button,
  Chip,
  Divider,
  TextField,
  Paper,
  Grid,
} from '@serviceops/component';
import {
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  InputAdornment,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { useFieldError } from '@serviceops/hooks';
import {
  parseRichText,
  serializeRichText,
  RichTextEditor,
} from '@serviceops/pages/base/Configuration/shared/RichTextEditor';
import { useStyles } from './styles';
import { ROLE_CHANGE_REASON_CODES } from '../../utils/userManagement.utils';
import { ChangeProfileDialogProps } from './util';

const ChangeProfileDialog = ({
  open,
  onClose,
  confirmOpen,
  onConfirmClose,
  selectedRow,
  changeProfileRole,
  onRoleChange,
  changeProfileReasonCode,
  onReasonCodeChange,
  changeProfileNoteText,
  onNoteTextChange,
  changeProfileAttachment,
  onAttachmentChange,
  changeProfileErrors,
  onErrorsChange,
  isSaving,
  attachmentInputRef,
  onSubmit,
  onConfirmSave,
}: ChangeProfileDialogProps) => {
  const { classes, cx } = useStyles();
  const reqError = useFieldError();
  const [roleOpen, setRoleOpen] = useState(false);
  const [reasonOpen, setReasonOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth='md'
        fullWidth
        slotProps={{ paper: { className: classes.dialogPaper } }}
      >
        {/* Header */}
        <Box className={classes.header}>
          <Box className={classes.badgeRow}>
            <WarningAmberIcon className={classes.badgeIcon} />
            <Typography variant='caption' fontWeight={700} className={classes.badgeLabel}>
              Role Change Warning
            </Typography>
          </Box>

          <Box className={classes.userCard}>
            <UserAvatar user={selectedRow ?? {}} size={56} className={classes.headerAvatar} />
            <Box className={classes.infoBox}>
              <Typography variant='h6' fontWeight={700} className={classes.headerTitle}>
                {selectedRow?.name}
              </Typography>
              <Typography variant='body2' className={classes.headerEmail}>
                {selectedRow?.email}
              </Typography>
              <Box className={classes.roleRow}>
                <Chip
                  label={
                    selectedRow?.role
                      ? selectedRow.role.charAt(0).toUpperCase() + selectedRow.role.slice(1)
                      : '-'
                  }
                  size='small'
                  className={classes.roleChip}
                />
                <ArrowForwardIcon className={classes.roleArrowIcon} />
                <Chip
                  label={
                    changeProfileRole
                      ? changeProfileRole.charAt(0).toUpperCase() + changeProfileRole.slice(1)
                      : '?'
                  }
                  size='small'
                  className={
                    changeProfileRole ? classes.newRoleChipSelected : classes.newRoleChipEmpty
                  }
                />
              </Box>
            </Box>
          </Box>

          <IconButton size='small' onClick={onClose} className={classes.closeBtn}>
            <CloseIcon fontSize='small' />
          </IconButton>
        </Box>

        <DialogContent sx={{ pt: 3, pb: 1 }}>
          {/* Role fields */}
          <Grid container spacing={2} alignItems='flex-start'>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label='Current Role'
                value={
                  selectedRow?.role
                    ? selectedRow.role.charAt(0).toUpperCase() + selectedRow.role.slice(1)
                    : '-'
                }
                fullWidth
                size='small'
                disabled
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ position: 'relative' }}>
                <TextField
                  label='Change role to'
                  placeholder='Select new role…'
                  value={
                    changeProfileRole
                      ? changeProfileRole.charAt(0).toUpperCase() + changeProfileRole.slice(1)
                      : ''
                  }
                  onFocus={() => setRoleOpen(true)}
                  onBlur={() => setTimeout(() => setRoleOpen(false), 150)}
                  required
                  fullWidth
                  size='small'
                  error={!!changeProfileErrors.role}
                  slotProps={{
                    input: {
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position='end'>
                          {changeProfileRole ? (
                            <ClearIcon
                              onClick={(e) => {
                                e.stopPropagation();
                                onRoleChange('');
                                setRoleOpen(false);
                              }}
                              sx={{
                                fontSize: 18,
                                color: 'text.primary',
                                cursor: 'pointer',
                                '&:hover': { color: 'text.primary' },
                              }}
                            />
                          ) : (
                            <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                          )}
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, cursor: 'pointer' } }}
                />
                {roleOpen && (
                  <Paper
                    elevation={4}
                    sx={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 1000,
                      mt: 0.5,
                      maxHeight: 220,
                      overflow: 'auto',
                    }}
                  >
                    <List dense disablePadding>
                      {(['user', 'consultant', 'admin'] as const)
                        .filter((r) => r !== selectedRow?.role)
                        .map((r) => (
                          <ListItem key={r} disablePadding>
                            <ListItemButton
                              selected={changeProfileRole === r}
                              onClick={() => {
                                onRoleChange(r);
                                onErrorsChange({ ...changeProfileErrors, role: undefined });
                                setRoleOpen(false);
                              }}
                              sx={{ py: 1, px: 1.5 }}
                            >
                              <ListItemText
                                primary={r.charAt(0).toUpperCase() + r.slice(1)}
                                primaryTypographyProps={{ fontSize: '0.84rem' }}
                              />
                            </ListItemButton>
                          </ListItem>
                        ))}
                    </List>
                  </Paper>
                )}
              </Box>
              <Typography
                variant='caption'
                sx={{
                  color: changeProfileErrors.role ? 'error.main' : 'transparent',
                  fontSize: '0.75rem',
                  mt: 0.5,
                  ml: 1.75,
                  display: 'block',
                  minHeight: '1em',
                  lineHeight: 1.66,
                }}
              >
                {changeProfileErrors.role ? reqError(true, changeProfileErrors.role) : ' '}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ position: 'relative' }}>
                <TextField
                  label='Reason code'
                  placeholder='Select reason…'
                  value={
                    ROLE_CHANGE_REASON_CODES.find((r) => r.value === changeProfileReasonCode)
                      ?.label ?? ''
                  }
                  onFocus={() => setReasonOpen(true)}
                  onBlur={() => setTimeout(() => setReasonOpen(false), 150)}
                  required
                  fullWidth
                  size='small'
                  error={!!changeProfileErrors.reasonCode}
                  slotProps={{
                    input: {
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position='end'>
                          {changeProfileReasonCode ? (
                            <ClearIcon
                              onClick={(e) => {
                                e.stopPropagation();
                                onReasonCodeChange('');
                                setReasonOpen(false);
                              }}
                              sx={{
                                fontSize: 18,
                                color: 'text.primary',
                                cursor: 'pointer',
                                '&:hover': { color: 'text.primary' },
                              }}
                            />
                          ) : (
                            <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                          )}
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, cursor: 'pointer' } }}
                />
                {reasonOpen && (
                  <Paper
                    elevation={4}
                    sx={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 1000,
                      mt: 0.5,
                      maxHeight: 220,
                      overflow: 'auto',
                    }}
                  >
                    <List dense disablePadding>
                      {ROLE_CHANGE_REASON_CODES.map((rc) => (
                        <ListItem key={rc.value} disablePadding>
                          <ListItemButton
                            selected={changeProfileReasonCode === rc.value}
                            onClick={() => {
                              onReasonCodeChange(rc.value);
                              onErrorsChange({ ...changeProfileErrors, reasonCode: undefined });
                              setReasonOpen(false);
                            }}
                            sx={{ py: 1, px: 1.5 }}
                          >
                            <ListItemText
                              primary={rc.label}
                              primaryTypographyProps={{ fontSize: '0.84rem' }}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                )}
              </Box>
              <Typography
                variant='caption'
                sx={{
                  color: changeProfileErrors.reasonCode ? 'error.main' : 'transparent',
                  fontSize: '0.75rem',
                  mt: 0.5,
                  ml: 1.75,
                  display: 'block',
                  minHeight: '1em',
                  lineHeight: 1.66,
                }}
              >
                {changeProfileErrors.reasonCode
                  ? reqError(true, changeProfileErrors.reasonCode)
                  : ' '}
              </Typography>
            </Grid>
          </Grid>

          {/* Rich-text note */}
          <Box sx={{ mt: 2.5 }}>
            <RichTextEditor
              value={parseRichText(changeProfileNoteText)}
              onChange={(value) => {
                const serialized = serializeRichText(value.segments);
                if (serialized.length <= 32000) {
                  onNoteTextChange(serialized);
                  onErrorsChange({ ...changeProfileErrors, note: undefined });
                }
              }}
              showFooterActions={false}
              title='Role change note'
              required
              error={!!changeProfileErrors.note}
            />

            <Box className={classes.charCountRow}>
              {changeProfileErrors.note ? (
                <Typography variant='caption' color='error.main' sx={{ ml: 0.5 }}>
                  {reqError(true, changeProfileErrors.note)}
                </Typography>
              ) : (
                <Box />
              )}
              <Typography
                variant='caption'
                color={changeProfileNoteText.length > 30000 ? 'warning.main' : 'text.disabled'}
              >
                {changeProfileNoteText.length.toLocaleString()} / 32,000
              </Typography>
            </Box>
          </Box>

          {/* Attachment */}
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant='body2' fontWeight={600} color='text.primary' sx={{ mb: 0.75 }}>
              Attachment
            </Typography>
            <input
              ref={attachmentInputRef}
              type='file'
              accept='.pdf,.doc,.docx,.png,.jpg,.jpeg'
              className={classes.hiddenInput}
              onChange={(e) => onAttachmentChange(e.target.files?.[0] ?? null)}
            />
            {changeProfileAttachment ? (
              <Box className={classes.attachmentRow}>
                <AttachFileIcon fontSize='small' sx={{ color: 'text.secondary' }} />
                <Typography variant='body2' sx={{ flex: 1, wordBreak: 'break-all' }}>
                  {changeProfileAttachment.name}
                </Typography>
                <IconButton size='small' onClick={() => onAttachmentChange(null)}>
                  <CloseIcon fontSize='small' />
                </IconButton>
              </Box>
            ) : (
              <Box
                className={cx(classes.dropzone, isDragging && classes.dropzoneActive)}
                onClick={() => attachmentInputRef.current?.click()}
                onDragEnter={(e: React.DragEvent<HTMLDivElement>) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragging(true);
                }}
                onDragOver={(e: React.DragEvent<HTMLDivElement>) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragging(true);
                }}
                onDragLeave={(e: React.DragEvent<HTMLDivElement>) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragging(false);
                }}
                onDrop={(e: React.DragEvent<HTMLDivElement>) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) onAttachmentChange(file);
                }}
              >
                <CloudUploadIcon className={classes.dropzoneIcon} />
                <Typography variant='body2' fontWeight={600}>
                  {isDragging ? 'Drop file to attach' : 'Drag and drop a file, or click to browse'}
                </Typography>
                <Typography variant='caption' color='text.disabled'>
                  Optional · PDF, DOC, DOCX, PNG, JPG
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>

        <Divider />
        <DialogActions className={classes.actions}>
          <Button variant='outlined' onClick={onClose} sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button
            variant='contained'
            onClick={onSubmit}
            disabled={isSaving}
            sx={{ borderRadius: 2, px: 3 }}
          >
            Update Role
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation sub-dialog */}
      <Dialog open={confirmOpen} onClose={onConfirmClose} maxWidth='xs' fullWidth>
        <DialogTitle>Confirm Role Change</DialogTitle>
        <DialogContent>
          <Typography variant='body2'>
            You are about to change <strong>{selectedRow?.name}</strong>&apos;s role from{' '}
            <Chip
              label={selectedRow?.role}
              size='small'
              sx={{ mx: 0.5, verticalAlign: 'middle' }}
            />{' '}
            to{' '}
            <Chip
              label={changeProfileRole}
              color='primary'
              size='small'
              sx={{ mx: 0.5, verticalAlign: 'middle' }}
            />
            .
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 1.5 }}>
            This will affect the user&apos;s access and permissions immediately. Do you want to
            proceed?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onConfirmClose}>Back</Button>
          <Button
            variant='contained'
            color='warning'
            onClick={onConfirmSave}
            disabled={isSaving}
            startIcon={
              isSaving ? <AutorenewIcon sx={{ animation: 'spin 1s linear infinite' }} /> : undefined
            }
          >
            {isSaving ? 'Updating…' : 'Confirm Change'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ChangeProfileDialog;
