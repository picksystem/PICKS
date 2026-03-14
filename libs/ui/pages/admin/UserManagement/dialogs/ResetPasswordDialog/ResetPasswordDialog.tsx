import { UserAvatar } from '@picks/component';
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Divider,
  Alert,
  TextField,
  InputAdornment,
  FormControlLabel,
  Switch,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  LinearProgress,
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import CloseIcon from '@mui/icons-material/Close';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import EmailIcon from '@mui/icons-material/Email';
import { useStyles } from './styles';
import { useNotification, useFieldError } from '@picks/hooks';
import { UserRow, ResetPwErrors } from '../../types/userManagement.types';
import { getPasswordStrength, generateTempPassword } from '../../utils/userManagement.utils';

interface ResetPasswordDialogProps {
  open: boolean;
  onClose: () => void;
  selectedRow: UserRow | null;
  resetPwMode: 'auto' | 'manual';
  onModeChange: (v: 'auto' | 'manual') => void;
  autoResetPw: string;
  onAutoResetPwChange: (v: string) => void;
  showAutoResetPw: boolean;
  onShowAutoResetPwChange: (v: boolean) => void;
  newPassword: string;
  onNewPasswordChange: (v: string) => void;
  newPasswordConfirm: string;
  onNewPasswordConfirmChange: (v: string) => void;
  showManualPw: boolean;
  onShowManualPwChange: (v: boolean) => void;
  showManualPwConfirm: boolean;
  onShowManualPwConfirmChange: (v: boolean) => void;
  resetPwForceChange: boolean;
  onForceChangeChange: (v: boolean) => void;
  resetPwReason: string;
  onReasonChange: (v: string) => void;
  resetPwErrors: ResetPwErrors;
  onErrorsChange: (e: ResetPwErrors) => void;
  isResetting: boolean;
  onReset: () => void;
}

const ResetPasswordDialog = ({
  open,
  onClose,
  selectedRow,
  resetPwMode,
  onModeChange,
  autoResetPw,
  onAutoResetPwChange,
  showAutoResetPw,
  onShowAutoResetPwChange,
  newPassword,
  onNewPasswordChange,
  newPasswordConfirm,
  onNewPasswordConfirmChange,
  showManualPw,
  onShowManualPwChange,
  showManualPwConfirm,
  onShowManualPwConfirmChange,
  resetPwForceChange,
  onForceChangeChange,
  resetPwReason,
  onReasonChange,
  resetPwErrors,
  onErrorsChange,
  isResetting,
  onReset,
}: ResetPasswordDialogProps) => {
  const { classes } = useStyles();
  const notify = useNotification();
  const reqError = useFieldError();
  const strengthAuto = getPasswordStrength(autoResetPw);
  const strengthManual = getPasswordStrength(newPassword);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      slotProps={{ paper: { className: classes.dialogPaper } }}
    >
      {/* Banner */}
      <Box className={classes.header}>
        <Box className={classes.badgeRow}>
          <LockResetIcon className={classes.badgeIcon} />
          <Typography variant='caption' fontWeight={700} className={classes.badgeLabel}>
            Password Reset
          </Typography>
          <Chip label='⚠ Admin Action' size='small' className={classes.adminActionChip} />
        </Box>
        <Box className={classes.userCard}>
          <UserAvatar user={selectedRow ?? {}} size={52} className={classes.headerAvatar} />
          <Box className={classes.infoBox}>
            <Typography variant='h6' fontWeight={700} className={classes.headerTitle}>
              {selectedRow?.name}
            </Typography>
            <Typography variant='body2' className={classes.headerEmail}>
              {selectedRow?.email}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.75 }}>
              <Chip label={selectedRow?.role || '-'} size='small' className={classes.roleChip} />
              <Typography variant='caption' className={classes.metaCaption}>
                This action will be logged in the audit trail
              </Typography>
            </Box>
          </Box>
        </Box>
        <IconButton size='small' onClick={onClose} className={classes.closeBtn}>
          <CloseIcon fontSize='small' />
        </IconButton>
      </Box>

      <DialogContent className={classes.dialogContent}>
        {/* Mode selector */}
        <Typography variant='subtitle2' fontWeight={700} sx={{ mb: 1 }}>
          Reset Method
        </Typography>
        <ToggleButtonGroup
          exclusive
          value={resetPwMode}
          onChange={(_, v) => {
            if (v) {
              onModeChange(v);
              onErrorsChange({});
            }
          }}
          size='small'
          fullWidth
          sx={{ mb: 2.5 }}
        >
          <ToggleButton value='auto' className={classes.modeToggleAuto}>
            <AutorenewIcon sx={{ fontSize: 16, mr: 0.75 }} />
            Auto-Generate (Recommended)
          </ToggleButton>
          <ToggleButton value='manual' className={classes.modeToggleManual}>
            <EditIcon sx={{ fontSize: 16, mr: 0.75 }} />
            Set Manually
          </ToggleButton>
        </ToggleButtonGroup>

        {/* AUTO MODE */}
        {resetPwMode === 'auto' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1.5 }}>
              A secure password has been generated. It will be sent to the user&apos;s email
              automatically.
            </Typography>
            <Stack direction='row' spacing={1} alignItems='center'>
              <TextField
                fullWidth
                size='small'
                value={autoResetPw}
                type={showAutoResetPw ? 'text' : 'password'}
                slotProps={{
                  input: {
                    readOnly: true,
                    sx: { fontFamily: 'monospace', letterSpacing: showAutoResetPw ? 1 : 2 },
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          size='small'
                          onClick={() => onShowAutoResetPwChange(!showAutoResetPw)}
                          edge='end'
                        >
                          {showAutoResetPw ? (
                            <VisibilityOffIcon fontSize='small' />
                          ) : (
                            <VisibilityIcon fontSize='small' />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <IconButton
                size='small'
                onClick={() => {
                  navigator.clipboard.writeText(autoResetPw);
                  notify.success('Password copied to clipboard');
                }}
              >
                <ContentCopyIcon fontSize='small' />
              </IconButton>
              <IconButton
                size='small'
                color='error'
                onClick={() => onAutoResetPwChange(generateTempPassword())}
              >
                <AutorenewIcon fontSize='small' />
              </IconButton>
            </Stack>
            <Box sx={{ mt: 1 }}>
              <LinearProgress
                variant='determinate'
                value={strengthAuto.pct}
                className={classes.strengthBar}
                sx={{ '& .MuiLinearProgress-bar': { bgcolor: strengthAuto.color } }}
              />
              <Typography variant='caption' sx={{ color: strengthAuto.color, fontWeight: 600 }}>
                {strengthAuto.label}
              </Typography>
            </Box>
            <Alert severity='success' icon={<EmailIcon />} sx={{ mt: 1.5, fontSize: '0.8rem' }}>
              This password will be <strong>emailed to {selectedRow?.email}</strong> automatically
              on submit.
            </Alert>
          </Box>
        )}

        {/* MANUAL MODE */}
        {resetPwMode === 'manual' && (
          <Box sx={{ mb: 2 }}>
            <Box className={classes.rulesBox}>
              <Typography
                variant='caption'
                fontWeight={700}
                color='text.secondary'
                sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
              >
                Password Requirements
              </Typography>
              {[
                { rule: 'At least 8 characters', ok: newPassword.length >= 8 },
                { rule: 'At least one uppercase letter', ok: /[A-Z]/.test(newPassword) },
                { rule: 'At least one number', ok: /[0-9]/.test(newPassword) },
                { rule: 'At least one special character', ok: /[^A-Za-z0-9]/.test(newPassword) },
              ].map(({ rule, ok }) => (
                <Box key={rule} className={classes.ruleRow}>
                  {ok ? (
                    <CheckCircleOutlineIcon className={classes.ruleIconValid} />
                  ) : (
                    <CancelOutlinedIcon className={classes.ruleIconInvalid} />
                  )}
                  <Typography
                    variant='caption'
                    className={ok ? classes.ruleTextValid : classes.ruleTextInvalid}
                  >
                    {rule}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Stack spacing={1.5}>
              <TextField
                label='New Password'
                fullWidth
                size='small'
                type={showManualPw ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => {
                  onNewPasswordChange(e.target.value);
                  onErrorsChange({ ...resetPwErrors, password: undefined });
                }}
                error={!!resetPwErrors.password}
                helperText={reqError(true, resetPwErrors.password)}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          size='small'
                          onClick={() => onShowManualPwChange(!showManualPw)}
                          edge='end'
                        >
                          {showManualPw ? (
                            <VisibilityOffIcon fontSize='small' />
                          ) : (
                            <VisibilityIcon fontSize='small' />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              {newPassword && (
                <Box>
                  <LinearProgress
                    variant='determinate'
                    value={strengthManual.pct}
                    className={classes.strengthBar}
                    sx={{ '& .MuiLinearProgress-bar': { bgcolor: strengthManual.color } }}
                  />
                  <Typography
                    variant='caption'
                    sx={{ color: strengthManual.color, fontWeight: 600 }}
                  >
                    {strengthManual.label}
                  </Typography>
                </Box>
              )}
              <TextField
                label='Confirm Password'
                fullWidth
                size='small'
                type={showManualPwConfirm ? 'text' : 'password'}
                value={newPasswordConfirm}
                onChange={(e) => {
                  onNewPasswordConfirmChange(e.target.value);
                  onErrorsChange({ ...resetPwErrors, confirm: undefined });
                }}
                error={!!resetPwErrors.confirm}
                helperText={reqError(true, resetPwErrors.confirm)}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          size='small'
                          onClick={() => onShowManualPwConfirmChange(!showManualPwConfirm)}
                          edge='end'
                        >
                          {showManualPwConfirm ? (
                            <VisibilityOffIcon fontSize='small' />
                          ) : (
                            <VisibilityIcon fontSize='small' />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Stack>
          </Box>
        )}

        <Divider sx={{ mb: 2 }} />

        {/* Settings */}
        <FormControlLabel
          control={
            <Switch
              checked={resetPwForceChange}
              color='error'
              onChange={(e) => onForceChangeChange(e.target.checked)}
            />
          }
          label={
            <Box>
              <Typography variant='body2' fontWeight={600}>
                Force password change on next login
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                User must immediately set a new password after logging in with this reset password
              </Typography>
            </Box>
          }
          sx={{ alignItems: 'flex-start', mb: 2 }}
        />

        <Typography variant='body2' fontWeight={600} sx={{ mb: 1 }}>
          Notify User Via
        </Typography>
        <Box className={classes.notifyRow}>
          <Chip
            icon={<EmailIcon />}
            label='Registered Email (Automatic)'
            color='success'
            variant='outlined'
            size='small'
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Reason */}
        <Typography variant='subtitle2' fontWeight={700} sx={{ mb: 1 }}>
          Reason{' '}
          <Typography component='span' variant='caption' color='text.secondary'>
            (optional – logged for compliance)
          </Typography>
        </Typography>
        <TextField
          fullWidth
          size='small'
          multiline
          minRows={2}
          placeholder='e.g. Account compromise suspected, policy enforcement…'
          value={resetPwReason}
          onChange={(e) => onReasonChange(e.target.value)}
        />
      </DialogContent>

      <DialogActions className={classes.actions}>
        <Button onClick={onClose} variant='outlined' sx={{ borderRadius: 2 }}>
          Cancel
        </Button>
        <Button
          variant='contained'
          color='error'
          onClick={onReset}
          disabled={isResetting || (resetPwMode === 'manual' && newPassword.length < 8)}
          sx={{ borderRadius: 2, px: 3 }}
        >
          {isResetting ? 'Resetting…' : 'Reset Password'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResetPasswordDialog;
