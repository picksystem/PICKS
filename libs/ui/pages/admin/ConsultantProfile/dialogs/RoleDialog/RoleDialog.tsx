import {
  Box,
  Typography,
  Grid,
  TextField,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import CloseIcon from '@mui/icons-material/Close';
import { RoleForm } from '../../types/consultantProfile.types';
import { useStyles } from './styles';

interface RoleDialogProps {
  open: boolean;
  onClose: () => void;
  editingRoleId: number | null;
  roleForm: RoleForm;
  onFormChange: (form: RoleForm) => void;
  isSaving: boolean;
  onSave: () => void;
}

const RoleDialog = ({
  open,
  onClose,
  editingRoleId,
  roleForm,
  onFormChange,
  isSaving,
  onSave,
}: RoleDialogProps) => {
  const { classes } = useStyles();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, overflow: 'hidden' } } }}
    >
      <Box className={classes.dialogHeader}>
        <Box className={classes.dialogHeaderBadge}>
          <WorkIcon className={classes.dialogHeaderBadgeIcon} />
          <Typography variant='caption' fontWeight={700} className={classes.dialogHeaderBadgeText}>
            {editingRoleId ? 'Edit Consultant Role' : 'New Consultant Role'}
          </Typography>
        </Box>
        <Box className={classes.dialogHeaderRow}>
          <Box>
            <Typography variant='h6' fontWeight={700} className={classes.dialogHeaderTitle}>
              {editingRoleId ? 'Update Role Definition' : 'Define Consultant Role'}
            </Typography>
            <Typography variant='body2' className={classes.dialogHeaderSubtitle}>
              {editingRoleId
                ? 'Update the role name and description below'
                : 'Create a new role for an application to assign to consultants'}
            </Typography>
          </Box>
          <IconButton onClick={onClose} className={classes.closeButton}>
            <CloseIcon fontSize='small' />
          </IconButton>
        </Box>
      </Box>
      <DialogContent dividers sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <TextField
              label='Application'
              fullWidth
              size='small'
              required
              value={roleForm.application}
              onChange={(e) => onFormChange({ ...roleForm, application: e.target.value })}
              className={classes.textField}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              label='Role Name'
              fullWidth
              size='small'
              required
              value={roleForm.roleName}
              onChange={(e) => onFormChange({ ...roleForm, roleName: e.target.value })}
              className={classes.textField}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label='Description'
              fullWidth
              size='small'
              multiline
              minRows={2}
              value={roleForm.description}
              onChange={(e) => onFormChange({ ...roleForm, description: e.target.value })}
              className={classes.textField}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Button onClick={onClose} variant='outlined' className={classes.cancelButton}>
          Cancel
        </Button>
        <Button
          variant='contained'
          onClick={onSave}
          disabled={isSaving}
          className={classes.saveButton}
        >
          {isSaving ? 'Saving…' : editingRoleId ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoleDialog;
