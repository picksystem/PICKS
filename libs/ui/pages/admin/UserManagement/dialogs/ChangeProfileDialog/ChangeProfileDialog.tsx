import { UserAvatar } from '@picks/component';
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Button,
  Chip,
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Grid,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import { useFieldError } from '@picks/hooks';
import { useStyles } from './styles';
import { UserRow, ChangeProfileErrors } from '../../types/userManagement.types';
import { ROLE_CHANGE_REASON_CODES } from '../../utils/userManagement.utils';

interface ChangeProfileDialogProps {
  open: boolean;
  onClose: () => void;
  confirmOpen: boolean;
  onConfirmClose: () => void;
  selectedRow: UserRow | null;
  changeProfileRole: string;
  onRoleChange: (v: string) => void;
  changeProfileReasonCode: string;
  onReasonCodeChange: (v: string) => void;
  changeProfileNoteText: string;
  onNoteTextChange: (v: string) => void;
  changeProfileAttachment: File | null;
  onAttachmentChange: (f: File | null) => void;
  changeProfileErrors: ChangeProfileErrors;
  onErrorsChange: (e: ChangeProfileErrors) => void;
  isSaving: boolean;
  noteRef: React.RefObject<HTMLTextAreaElement | null>;
  attachmentInputRef: React.RefObject<HTMLInputElement | null>;
  onSubmit: () => void;
  onConfirmSave: () => void;
}

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
  noteRef,
  attachmentInputRef,
  onSubmit,
  onConfirmSave,
}: ChangeProfileDialogProps) => {
  const { classes } = useStyles();
  const reqError = useFieldError();

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
              <FormControl fullWidth size='small' error={!!changeProfileErrors.role}>
                <InputLabel shrink required>Change role to</InputLabel>
                <Select
                  value={changeProfileRole}
                  label='Change role to'
                  displayEmpty
                  notched
                  renderValue={(val) =>
                    val ? (
                      <Typography variant='body2'>
                        {(val as string).charAt(0).toUpperCase() + (val as string).slice(1)}
                      </Typography>
                    ) : (
                      <Typography variant='body2' color='text.disabled'>
                        Select new role…
                      </Typography>
                    )
                  }
                  onChange={(e) => {
                    onRoleChange(e.target.value);
                    onErrorsChange({ ...changeProfileErrors, role: undefined });
                  }}
                  sx={{ borderRadius: 2 }}
                >
                  {(['user', 'consultant', 'admin'] as const)
                    .filter((r) => r !== selectedRow?.role)
                    .map((r) => (
                      <MenuItem key={r} value={r}>
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </MenuItem>
                    ))}
                </Select>
                {changeProfileErrors.role && (
                  <FormHelperText sx={{ ml: 0.5 }}>
                    {reqError(true, changeProfileErrors.role)}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size='small' error={!!changeProfileErrors.reasonCode}>
                <InputLabel shrink required>Reason code</InputLabel>
                <Select
                  value={changeProfileReasonCode}
                  label='Reason code'
                  displayEmpty
                  notched
                  renderValue={(val) =>
                    val ? (
                      <Typography variant='body2'>
                        {ROLE_CHANGE_REASON_CODES.find((r) => r.value === val)?.label ??
                          String(val)}
                      </Typography>
                    ) : (
                      <Typography variant='body2' color='text.disabled'>
                        Select reason…
                      </Typography>
                    )
                  }
                  onChange={(e) => {
                    onReasonCodeChange(e.target.value);
                    onErrorsChange({ ...changeProfileErrors, reasonCode: undefined });
                  }}
                  sx={{ borderRadius: 2 }}
                >
                  {ROLE_CHANGE_REASON_CODES.map((rc) => (
                    <MenuItem key={rc.value} value={rc.value}>
                      {rc.label}
                    </MenuItem>
                  ))}
                </Select>
                {changeProfileErrors.reasonCode && (
                  <FormHelperText sx={{ ml: 0.5 }}>
                    {reqError(true, changeProfileErrors.reasonCode)}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>

          {/* Rich-text note */}
          <Box sx={{ mt: 2.5 }}>
            <Typography variant='body2' fontWeight={600} color='text.primary' sx={{ mb: 0.75 }}>
              Role change note <Box component='span' sx={{ color: 'error.main' }}>*</Box>
            </Typography>

            {/* Formatting toolbar */}
            <Box
              className={`${classes.formattingToolbar}${changeProfileErrors.note ? ` ${classes.formattingToolbarError}` : ''}`}
            >
              {[
                { Icon: FormatBoldIcon, title: 'Bold', prefix: '**', suffix: '**' },
                { Icon: FormatItalicIcon, title: 'Italic', prefix: '_', suffix: '_' },
                { Icon: FormatUnderlinedIcon, title: 'Underline', prefix: '<u>', suffix: '</u>' },
              ].map(({ Icon, title, prefix, suffix }) => (
                <IconButton
                  key={title}
                  size='small'
                  title={title}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const ta = noteRef.current;
                    if (!ta) return;
                    const start = ta.selectionStart ?? 0;
                    const end = ta.selectionEnd ?? 0;
                    const selected = changeProfileNoteText.substring(start, end);
                    const newVal =
                      changeProfileNoteText.substring(0, start) +
                      prefix +
                      selected +
                      suffix +
                      changeProfileNoteText.substring(end);
                    onNoteTextChange(newVal);
                    onErrorsChange({ ...changeProfileErrors, note: undefined });
                  }}
                >
                  <Icon fontSize='small' />
                </IconButton>
              ))}

              <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />

              {[
                { Icon: FormatListBulletedIcon, title: 'Bullet list', insert: '\n• ' },
                { Icon: FormatListNumberedIcon, title: 'Numbered list', insert: '\n1. ' },
              ].map(({ Icon, title, insert }) => (
                <IconButton
                  key={title}
                  size='small'
                  title={title}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const ta = noteRef.current;
                    if (!ta) return;
                    const pos = ta.selectionStart ?? changeProfileNoteText.length;
                    const newVal =
                      changeProfileNoteText.substring(0, pos) +
                      insert +
                      changeProfileNoteText.substring(pos);
                    onNoteTextChange(newVal);
                    onErrorsChange({ ...changeProfileErrors, note: undefined });
                  }}
                >
                  <Icon fontSize='small' />
                </IconButton>
              ))}
            </Box>

            <TextField
              inputRef={noteRef}
              fullWidth
              multiline
              minRows={5}
              maxRows={10}
              value={changeProfileNoteText}
              placeholder='Describe the reason for this role change…'
              onChange={(e) => {
                if (e.target.value.length <= 32000) {
                  onNoteTextChange(e.target.value);
                  onErrorsChange({ ...changeProfileErrors, note: undefined });
                }
              }}
              error={!!changeProfileErrors.note}
              className={classes.noteTextarea}
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
            <input
              ref={attachmentInputRef}
              type='file'
              accept='.pdf,.doc,.docx,.png,.jpg,.jpeg'
              className={classes.hiddenInput}
              onChange={(e) => onAttachmentChange(e.target.files?.[0] ?? null)}
            />
            <Box className={classes.attachmentRow}>
              <Button
                variant='outlined'
                size='small'
                startIcon={<AttachFileIcon />}
                onClick={() => attachmentInputRef.current?.click()}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                {changeProfileAttachment ? changeProfileAttachment.name : 'Add attachment'}
              </Button>
              {changeProfileAttachment && (
                <IconButton size='small' onClick={() => onAttachmentChange(null)}>
                  <CloseIcon fontSize='small' />
                </IconButton>
              )}
              <Typography variant='caption' color='text.disabled'>
                Optional · PDF, DOC, DOCX, PNG, JPG
              </Typography>
            </Box>
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
