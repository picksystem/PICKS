import { Box } from '../../../../components';
import { TextField, Typography } from '@mui/material';
import { IIncident, IUpdateIncidentInput } from '@picks/interfaces';
import { useStyles } from '../styles';

interface DescriptionSectionProps {
  incident: IIncident;
  isEditing: boolean;
  editFormData: IUpdateIncidentInput;
  onEditFormChange: (data: Partial<IUpdateIncidentInput>) => void;
}

const DescriptionSection = ({
  incident,
  isEditing,
  editFormData,
  onEditFormChange,
}: DescriptionSectionProps) => {
  const { classes } = useStyles();

  return (
    <Box className={classes.descriptionCard}>
      <Box className={classes.descriptionCardHeader}>
        <Typography className={classes.descriptionSectionTitle}>Description</Typography>
      </Box>
      <Box className={classes.descriptionCardBody}>
        {isEditing ? (
          <>
            <TextField
              label='Short Description'
              fullWidth
              size='small'
              value={editFormData.shortDescription ?? incident.shortDescription ?? ''}
              onChange={(e) => onEditFormChange({ shortDescription: e.target.value })}
              className={classes.descriptionTextField}
            />
            <TextField
              label='Description'
              fullWidth
              multiline
              rows={4}
              size='small'
              value={editFormData.description ?? incident.description ?? ''}
              onChange={(e) => onEditFormChange({ description: e.target.value })}
              className={classes.descriptionDescField}
            />
          </>
        ) : (
          <>
            <Typography className={classes.descriptionShortTitle}>
              {incident.shortDescription || 'No short description'}
            </Typography>
            <Typography className={classes.descriptionBodyText}>
              {incident.description || 'No description provided'}
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
};

export default DescriptionSection;
