import { Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { Box } from '@picks/component';
import { useStyles } from '../styles';

interface ActionButtonsProps {
  canApply: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onCancel: () => void;
  onSaveAsDraft: () => void;
  onCreateNew: () => void;
  onApplyAndSubmit: () => void;
}

const ActionButtons = ({
  canApply,
  isSubmitting,
  onBack,
  onCancel,
  onSaveAsDraft,
  onCreateNew,
  onApplyAndSubmit,
}: ActionButtonsProps) => {
  const { classes } = useStyles();
  return (
    <Box className={classes.buttonContainer}>
      <Button
        variant='outlined'
        startIcon={<ArrowBackIcon />}
        onClick={onBack}
        disabled={isSubmitting}
        className={classes.backBtn}
      >
        Back
      </Button>
      <Button
        variant='outlined'
        startIcon={<CancelIcon />}
        onClick={onCancel}
        disabled={isSubmitting}
        className={classes.cancelBtn}
      >
        Cancel
      </Button>
      <Box className={classes.flexSpacer} />
      <Button
        variant='outlined'
        startIcon={<SaveIcon />}
        onClick={onSaveAsDraft}
        disabled={isSubmitting}
        className={classes.draftBtn}
      >
        Save as Draft
      </Button>
      <Button
        variant='outlined'
        startIcon={<AddCircleIcon />}
        onClick={onCreateNew}
        disabled={isSubmitting}
        className={classes.newIncidentBtn}
      >
        Create as New
      </Button>
      <Button
        variant='contained'
        startIcon={<TaskAltIcon />}
        onClick={onApplyAndSubmit}
        disabled={!canApply || isSubmitting}
        className={canApply ? classes.applyBtnActive : undefined}
      >
        Apply Solution & Submit
      </Button>
    </Box>
  );
};

export default ActionButtons;
