import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Avatar,
  ToggleButtonGroup,
  ToggleButton,
  List,
  ListItemButton,
  InputAdornment,
  alpha,
} from '@mui/material';
import type { Theme } from '@mui/material/styles';
import KeyIcon from '@mui/icons-material/Key';
import CloseIcon from '@mui/icons-material/Close';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import {
  UserAvatar,
  Box,
  Typography,
  IconButton,
  Button,
  Chip,
  Divider,
  Alert,
  TextField,
  Paper,
  FormControlLabel,
  Switch,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Grid,
} from '@serviceops/component';
import {
  parseRichText,
  serializeRichText,
  RichTextEditor,
} from '@serviceops/pages/base/Configuration/shared/RichTextEditor';
import { useStyles } from './styles';
import { TempPasswordDialogProps } from './util';

const VALIDITY_OPTIONS = [
  { value: '12h', label: '12 Hours' },
  { value: '24h', label: '24 Hours (Recommended)' },
  { value: '48h', label: '48 Hours' },
  { value: '72h', label: '72 Hours' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
];

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
  const [validityOpen, setValidityOpen] = useState(false);
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
          <Grid size={{ xs: 12 }}>
            <Box sx={{ position: 'relative' }}>
              <TextField
                label='Validity Period'
                value={VALIDITY_OPTIONS.find((o) => o.value === tempPwValidity)?.label ?? ''}
                onFocus={() => setValidityOpen(true)}
                onBlur={() => setTimeout(() => setValidityOpen(false), 150)}
                fullWidth
                size='small'
                slotProps={{
                  input: {
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position='end'>
                        {tempPwValidity ? (
                          <ClearIcon
                            onClick={() => {
                              onValidityChange('');
                              setValidityOpen(false);
                            }}
                            sx={{
                              fontSize: 20,
                              color: 'text.secondary',
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
                sx={{ '& .MuiOutlinedInput-root': { cursor: 'pointer' } }}
              />
              {validityOpen && (
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
                    {VALIDITY_OPTIONS.map((o) => (
                      <ListItem key={o.value} disablePadding>
                        <ListItemButton
                          selected={tempPwValidity === o.value}
                          onClick={() => {
                            onValidityChange(o.value);
                            setValidityOpen(false);
                          }}
                          sx={{ py: 1, px: 1.5 }}
                        >
                          <ListItemText
                            primary={o.label}
                            primaryTypographyProps={{ fontSize: '0.84rem' }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </Box>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Box
              sx={(theme: Theme) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                py: 1.25,
                borderRadius: 1,
                border: '1px solid',
                borderColor: tempPwForceReset ? alpha(theme.palette.warning.main, 0.3) : 'divider',
                bgcolor: tempPwForceReset ? alpha(theme.palette.warning.main, 0.04) : 'transparent',
                transition: 'all 0.2s ease',
              })}
            >
              <Box>
                <Typography variant='body2' color='warning.main' fontWeight={600}>
                  Force reset on first login
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  User must set a new password immediately
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={tempPwForceReset}
                    color='warning'
                    onChange={(e) => onForceResetChange(e.target.checked)}
                  />
                }
                label={
                  <Typography
                    variant='body2'
                    fontWeight={700}
                    sx={{ color: tempPwForceReset ? 'warning.main' : 'text.secondary' }}
                  >
                    {tempPwForceReset ? 'On' : 'Off'}
                  </Typography>
                }
                sx={{ ml: 0 }}
              />
            </Box>
          </Grid>
        </Grid>

        <Alert severity='info' icon={<SecurityIcon />} sx={{ mt: 2, mb: 2, fontSize: '0.8rem' }}>
          The password is <strong>system-generated, random, and secure</strong>. It will be sent
          directly to the user&apos;s registered email. This action will be logged in the audit
          trail.
        </Alert>

        <Divider sx={{ mb: 2 }} />

        {/* Audit note */}
        <RichTextEditor
          value={parseRichText(tempPwNote)}
          onChange={(value) => onNoteChange(serializeRichText(value.segments))}
          showFooterActions={false}
          title='Audit Note'
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
