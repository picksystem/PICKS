import { useState } from 'react';
import { Box, Modal, Select, Checkbox, Button, UploadFile } from '../../../../components';
import { TextField } from '@mui/material';
import { IIncident, IncidentStatus, ResolutionCode } from '@serviceops/interfaces';
import { useCreateResolutionMutation, useUpdateIncidentMutation } from '../../../../../services';
import { useAuth, useNotification } from '@serviceops/hooks';

interface ResolveWindowProps {
  open: boolean;
  onClose: () => void;
  incident: IIncident;
  onSuccess: () => void;
}

const statusOptions = Object.values(IncidentStatus).map((v) => ({
  label: v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  value: v,
}));

const resolutionCodeOptions = Object.values(ResolutionCode).map((v) => ({
  label: v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  value: v,
}));

const footerSx = {
  display: 'flex',
  gap: 1,
  justifyContent: 'flex-end',
  flexDirection: { xs: 'column' as const, sm: 'row' as const },
};
const contentSx = { display: 'flex', flexDirection: 'column', gap: 2 };
const rowSx = { display: 'flex', gap: 2, flexDirection: { xs: 'column' as const, sm: 'row' as const } };
const fieldSx = { flex: 1, minWidth: 0 };

const ResolveWindow = ({ open, onClose, incident, onSuccess }: ResolveWindowProps) => {
  const { user } = useAuth();
  const [createResolution, { isLoading: resLoading }] = useCreateResolutionMutation();
  const [updateIncident, { isLoading: updLoading }] = useUpdateIncidentMutation();
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [customerConfirmation, setCustomerConfirmation] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [rootCauseIdentified, setRootCauseIdentified] = useState(false);
  const [rootCause, setRootCause] = useState('');
  const [resolutionCode, setResolutionCode] = useState('');
  const [resolution, setResolution] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const notify = useNotification();

  const isLoading = resLoading || updLoading;

  const handleSave = async (closeAfter = false) => {
    if (!resolutionCode) {
      notify.error('Resolution code is required');
      return;
    }
    if (!resolution.trim()) {
      notify.error('Resolution text is required');
      return;
    }
    try {
      await createResolution({
        incidentId: incident.id,
        application: incident.application || undefined,
        category: category || undefined,
        subCategory: subCategory || undefined,
        customerConfirmation,
        isRecurring,
        rootCauseIdentified,
        rootCause: rootCause || undefined,
        resolutionCode: resolutionCode as ResolutionCode,
        resolution,
        internalNote: internalNote || undefined,
        createdBy: user?.email || '',
      }).unwrap();

      await updateIncident({
        id: incident.id,
        data: { status: IncidentStatus.RESOLVED },
      }).unwrap();

      onSuccess();
      if (closeAfter) onClose();
    } catch {
      notify.error('Failed to resolve incident');
    }
  };

  const footer = (
    <Box sx={footerSx}>
      <Button variant='outlined' onClick={onClose}>
        Cancel
      </Button>
      <Button variant='outlined' onClick={() => handleSave(false)} disabled={isLoading}>
        Save
      </Button>
      <Button variant='contained' onClick={() => handleSave(true)} disabled={isLoading}>
        Save & Close
      </Button>
    </Box>
  );

  return (
    <Modal open={open} onClose={onClose} title='Resolve Incident' maxWidth='lg' footer={footer}>
      <Box sx={contentSx}>
        <Box sx={rowSx}>
          <Box sx={fieldSx}>
            <Select
              label='Status'
              options={statusOptions}
              value={IncidentStatus.RESOLVED}
              onChange={() => {}}
            />
          </Box>
          <Box sx={fieldSx}>
            <Select label='Resolution Template' options={[]} value='' onChange={() => {}} />
          </Box>
        </Box>

        <TextField
          label='Application'
          value={incident.application || ''}
          disabled
          size='small'
          fullWidth
        />

        <Box sx={rowSx}>
          <TextField
            label='Category'
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            size='small'
            sx={fieldSx}
          />
          <TextField
            label='Sub-category'
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            size='small'
            sx={fieldSx}
          />
        </Box>

        <Box sx={rowSx}>
          <Checkbox
            label='Customer Confirmation'
            checked={customerConfirmation}
            onChange={() => setCustomerConfirmation(!customerConfirmation)}
          />
          <Checkbox
            label='Recurring Issue'
            checked={isRecurring}
            onChange={() => setIsRecurring(!isRecurring)}
          />
          <Checkbox
            label='Root Cause Identified'
            checked={rootCauseIdentified}
            onChange={() => setRootCauseIdentified(!rootCauseIdentified)}
          />
        </Box>

        {rootCauseIdentified && (
          <TextField
            label='Root Cause'
            value={rootCause}
            onChange={(e) => setRootCause(e.target.value)}
            multiline
            minRows={2}
            maxRows={8}
            size='small'
            fullWidth
          />
        )}

        <Select
          label='Resolution Code'
          options={resolutionCodeOptions}
          value={resolutionCode}
          onChange={(e) => setResolutionCode(e.target.value as string)}
        />

        <TextField
          label='Resolution'
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          multiline
          minRows={3}
          maxRows={10}
          size='small'
          fullWidth
          required
        />

        <TextField
          label='Internal Note'
          value={internalNote}
          onChange={(e) => setInternalNote(e.target.value)}
          multiline
          minRows={2}
          maxRows={8}
          size='small'
          fullWidth
        />

        <UploadFile onChange={() => {}} />
      </Box>
    </Modal>
  );
};

export default ResolveWindow;
