import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SearchIcon from '@mui/icons-material/Search';
import { Box, Button } from '@serviceops/component';
import { useStyles } from '../styles';

interface ActionButtonsProps {
  isLoading: boolean;
  onBack: () => void;
  onCancel: () => void;
  onSaveAsDraft: () => void;
  onSearchForSolution: () => void;
}

const ActionButtons = ({
  isLoading,
  onBack,
  onCancel,
  onSaveAsDraft,
  onSearchForSolution,
}: ActionButtonsProps) => {
  const { classes } = useStyles();

  return (
    <Box className={classes.buttonContainer}>
      <Button variant='outlined' onClick={onBack} disabled={isLoading} icon={<ArrowBackIcon />}>
        Back
      </Button>
      <Button
        variant='outlined'
        color='error'
        onClick={onCancel}
        disabled={isLoading}
        icon={<CancelIcon />}
      >
        Cancel
      </Button>
      <Button
        variant='outlined'
        color='warning'
        onClick={onSaveAsDraft}
        disabled={isLoading}
        icon={<SaveIcon />}
      >
        Save as Draft
      </Button>
      <Button
        variant='contained'
        color='primary'
        onClick={onSearchForSolution}
        disabled={isLoading}
        icon={<SearchIcon />}
      >
        Search for Solution
      </Button>
      <Button
        type='submit'
        variant='contained'
        color='success'
        disabled={isLoading}
        loading={isLoading}
        icon={<SkipNextIcon />}
      >
        Create Incident
      </Button>
    </Box>
  );
};

export default ActionButtons;
