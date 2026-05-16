import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
  Chip,
  Divider,
  Alert,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  ToggleButtonGroup,
  ToggleButton,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Grid,
} from '@mui/material';
import KeyIcon from '@mui/icons-material/Key';
import CloseIcon from '@mui/icons-material/Close';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import { UserAvatar } from '@serviceops/component';
import { useStyles } from './styles';
import { UserRow } from '../../types/userManagement.types';
import { IAuthUser } from '@serviceops/interfaces';

interface TempPasswordDialogProps {
  open: boolean;
  onClose: () => void;
  selectedRow: UserRow | null;
  allUsers: IAuthUser[];
  tempPwBulkMode: boolean;
  onBulkModeChange: (v: boolean) => void;
  bulkSelectedIds: number[];
  onBulkIdsChange: (ids: number[]) => void;
  tempPwValidity: string;
  onValidityChange: (v: string) => void;
  tempPwForceReset: boolean;
  onForceResetChange: (v: boolean) => void;
  tempPwNote: string;
  onNoteChange: (v: string) => void;
  isGenerating: boolean;
  onGenerate: () => void;
}

const TempPasswordDialog = ({
  open,
  onClose,
  selectedRow,
  allUsers,
  tempPwBulkMode,
  onBulkModeChange,
  bulkSelectedIds,
  onBulkIdsChange,
  tempPwValidity,
  onValidityChange,
  tempPwForceReset,
  onForceResetChange,
  tempPwNote,
  onNoteChange,
  isGenerating,
  onGenerate,
}: TempPasswordDialogProps) => {
  const { classes } = useStyles();
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
          <KeyIcon className={classes.badgeIcon} />
          <Typography variant='caption' fontWeight={700} className={classes.badgeLabel}>
            Temporary Password
          </Typography>
          <Chip label='Time-bound' size='small' className={classes.timeBoundChip} />
        </Box>

        <Box className={classes.userCard}>
          {tempPwBulkMode ? (
            <Avatar className={classes.headerAvatar}>
              <PeopleIcon sx={{ fontSize: 26 }} />
            </Avatar>
          ) : (
            <UserAvatar user={selectedRow ?? {}} size={52} className={classes.headerAvatar} />
          )}
          <Box className={classes.infoBox}>
            {tempPwBulkMode ? (
              <>
                <Typography variant='h6' fontWeight={700} className={classes.headerTitle}>
                  Bulk Password Generation
                </Typography>
                <Typography variant='body2' className={classes.headerSubtitle}>
                  {bulkSelectedIds.length} user{bulkSelectedIds.length !== 1 ? 's' : ''} selected
                </Typography>
              </>
            ) : (
              <>
                <Typography variant='h6' fontWeight={700} className={classes.headerTitle}>
                  {selectedRow?.name}
                </Typography>
                <Typography variant='body2' className={classes.headerSubtitle}>
                  {selectedRow?.email}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.75 }}>
                  <Chip
                    label={selectedRow?.role || '-'}
                    size='small'
                    className={classes.roleChip}
                  />
                  <Chip
                    label={selectedRow?.isActive ? 'Active' : 'Inactive'}
                    size='small'
                    className={selectedRow?.isActive ? classes.activeChip : classes.inactiveChip}
                  />
                </Box>
              </>
            )}
          </Box>
        </Box>

        <IconButton size='small' onClick={onClose} className={classes.closeBtn}>
          <CloseIcon fontSize='small' />
        </IconButton>
      </Box>

      <DialogContent className={classes.dialogContent}>
        {/* Scope toggle */}
        <Typography variant='subtitle2' fontWeight={700} color='text.primary' sx={{ mb: 1 }}>
          Scope
        </Typography>
        <ToggleButtonGroup
          exclusive
          value={tempPwBulkMode ? 'bulk' : 'single'}
          onChange={(_, v) => {
            if (!v) return;
            const isBulk = v === 'bulk';
            onBulkModeChange(isBulk);
            if (!isBulk) onBulkIdsChange(selectedRow ? [selectedRow.id] : []);
          }}
          size='small'
          sx={{ mb: 2 }}
        >
          <ToggleButton value='single' className={classes.toggleBtn}>
            Single User
          </ToggleButton>
          <ToggleButton value='bulk' className={classes.toggleBtn}>
            <PeopleIcon sx={{ fontSize: 16, mr: 0.75 }} /> Bulk (Multiple Users)
          </ToggleButton>
        </ToggleButtonGroup>

        {/* Bulk list */}
        {tempPwBulkMode && (
          <Box className={classes.bulkList}>
            {allUsers
              .filter((u) => u.isActive)
              .map((u) => (
                <ListItem key={u.id} dense disablePadding className={classes.listItem}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Checkbox
                      size='small'
                      checked={bulkSelectedIds.includes(u.id)}
                      onChange={(e) => {
                        onBulkIdsChange(
                          e.target.checked
                            ? [...bulkSelectedIds, u.id]
                            : bulkSelectedIds.filter((id) => id !== u.id),
                        );
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant='body2' fontWeight={500}>
                        {u.name}
                      </Typography>
                    }
                    secondary={
                      <Typography variant='caption' color='text.secondary'>
                        {u.email}
                      </Typography>
                    }
                  />
                  <Chip
                    label={u.role}
                    size='small'
                    sx={{ fontSize: '0.68rem', height: 18, ml: 1 }}
                  />
                </ListItem>
              ))}
          </Box>
        )}

        <Divider sx={{ mb: 2 }} />

        {/* Password Settings */}
        <Typography variant='subtitle2' fontWeight={700} color='text.primary' sx={{ mb: 1.5 }}>
          Password Settings
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size='small'>
              <InputLabel>Validity Period</InputLabel>
              <Select
                value={tempPwValidity}
                label='Validity Period'
                onChange={(e) => onValidityChange(e.target.value)}
              >
                <MenuItem value='12h'>12 Hours</MenuItem>
                <MenuItem value='24h'>24 Hours (Recommended)</MenuItem>
                <MenuItem value='48h'>48 Hours</MenuItem>
                <MenuItem value='72h'>72 Hours</MenuItem>
                <MenuItem value='7d'>7 Days</MenuItem>
                <MenuItem value='30d'>30 Days</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={tempPwForceReset}
                  color='warning'
                  onChange={(e) => onForceResetChange(e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant='body2' fontWeight={600}>
                    Force reset on first login
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    User must set a new password immediately
                  </Typography>
                </Box>
              }
              sx={{ alignItems: 'flex-start', mt: 0.25 }}
            />
          </Grid>
        </Grid>

        <Alert severity='info' icon={<SecurityIcon />} sx={{ mt: 2, mb: 2, fontSize: '0.8rem' }}>
          The password is <strong>system-generated, random, and secure</strong>. It will be sent
          directly to the user&apos;s registered email. This action will be logged in the audit
          trail.
        </Alert>

        <Divider sx={{ mb: 2 }} />

        {/* Audit note */}
        <Typography variant='subtitle2' fontWeight={700} color='text.primary' sx={{ mb: 1 }}>
          Audit Note{' '}
          <Typography component='span' variant='caption' color='text.secondary'>
            (optional)
          </Typography>
        </Typography>
        <TextField
          fullWidth
          size='small'
          multiline
          minRows={2}
          placeholder='Reason for generating a temporary password…'
          value={tempPwNote}
          onChange={(e) => onNoteChange(e.target.value)}
        />
      </DialogContent>

      <DialogActions className={classes.actions}>
        <Button onClick={onClose} variant='outlined' sx={{ borderRadius: 2 }}>
          Cancel
        </Button>
        <Button
          variant='contained'
          onClick={onGenerate}
          disabled={isGenerating || (tempPwBulkMode ? bulkSelectedIds.length === 0 : !selectedRow)}
          className={classes.submitBtn}
        >
          {isGenerating
            ? 'Generating…'
            : `Generate & Send${tempPwBulkMode && bulkSelectedIds.length > 1 ? ` (${bulkSelectedIds.length})` : ''}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TempPasswordDialog;
