import { Box, Typography, Select } from '@serviceops/component';
import { IncidentStatus } from '@serviceops/interfaces';
import { useStyles } from '../styles';

const statusOptions = [
  { value: IncidentStatus.DRAFT, label: 'Draft' },
  { value: IncidentStatus.NEW, label: 'New' },
  { value: IncidentStatus.IN_PROGRESS, label: 'In Progress' },
  { value: IncidentStatus.ON_HOLD, label: 'On Hold' },
  { value: IncidentStatus.RESOLVED, label: 'Resolved' },
  { value: IncidentStatus.CLOSED, label: 'Closed' },
  { value: IncidentStatus.CANCELLED, label: 'Cancelled' },
];

interface ChannelStatusSectionProps {
  channel: string;
  status: string;
  channelOptions: { value: string; label: string }[];
  onChannelChange: (v: string) => void;
  onStatusChange: (v: string) => void;
}

const ChannelStatusSection = ({
  channel,
  status,
  channelOptions,
  onChannelChange,
  onStatusChange,
}: ChannelStatusSectionProps) => {
  const { classes } = useStyles();

  return (
    <>
      <Typography className={classes.sectionTitle}>Channel & Status</Typography>
      <Box className={classes.formGrid}>
        <Select
          label='Channel'
          options={channelOptions}
          value={channel}
          onChange={(e) => onChannelChange(e.target.value as string)}
          required
        />
        <Select
          label='Status'
          options={statusOptions}
          value={status}
          onChange={(e) => onStatusChange(e.target.value as string)}
        />
      </Box>
    </>
  );
};

export default ChannelStatusSection;
