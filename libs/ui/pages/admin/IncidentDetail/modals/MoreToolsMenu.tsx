import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  ThumbUpIcon,
  ContentCopyIcon,
  TrendingUpIcon,
  CancelIcon,
} from '../../../../components';
import { IIncident } from '@serviceops/interfaces';

interface MoreToolsMenuProps {
  anchorEl: null | HTMLElement;
  onClose: () => void;
  incident: IIncident;
  onCancelIncident: () => void;
  onDuplicate: () => void;
}

const MoreToolsMenu = ({
  anchorEl,
  onClose,
  onCancelIncident,
  onDuplicate,
}: MoreToolsMenuProps) => (
  <Menu
    anchorEl={anchorEl}
    open={Boolean(anchorEl)}
    onClose={onClose}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
  >
    <MenuItem
      onClick={() => {
        onClose();
      }}
    >
      <ListItemIcon>
        <ThumbUpIcon fontSize='small' sx={{ color: '#1565c0' }} />
      </ListItemIcon>
      <ListItemText>Submit for Approval</ListItemText>
    </MenuItem>
    <MenuItem
      onClick={() => {
        onDuplicate();
        onClose();
      }}
    >
      <ListItemIcon>
        <ContentCopyIcon fontSize='small' sx={{ color: '#455a64' }} />
      </ListItemIcon>
      <ListItemText>Create Duplicate</ListItemText>
    </MenuItem>
    <MenuItem onClick={onClose}>
      <ListItemIcon>
        <TrendingUpIcon fontSize='small' sx={{ color: '#d32f2f' }} />
      </ListItemIcon>
      <ListItemText>Escalate</ListItemText>
    </MenuItem>
    <MenuItem
      onClick={() => {
        onCancelIncident();
        onClose();
      }}
    >
      <ListItemIcon>
        <CancelIcon fontSize='small' sx={{ color: '#c62828' }} />
      </ListItemIcon>
      <ListItemText>Cancel Incident</ListItemText>
    </MenuItem>
    <Divider />
    <MenuItem onClick={onClose}>
      <ListItemText>Merge</ListItemText>
    </MenuItem>
    <MenuItem onClick={onClose}>
      <ListItemText>Absorb</ListItemText>
    </MenuItem>
    <MenuItem onClick={onClose}>
      <ListItemText>Reopen</ListItemText>
    </MenuItem>
    <Divider />
    <MenuItem onClick={onClose}>
      <ListItemText>Link to Other Ticket</ListItemText>
    </MenuItem>
    <MenuItem onClick={onClose}>
      <ListItemText>Add to Problem</ListItemText>
    </MenuItem>
    <MenuItem onClick={onClose}>
      <ListItemText>Create Change Request</ListItemText>
    </MenuItem>
    <MenuItem onClick={onClose}>
      <ListItemText>Convert to Other Type</ListItemText>
    </MenuItem>
    <Divider />
    <MenuItem onClick={onClose}>
      <ListItemText>Print Summary</ListItemText>
    </MenuItem>
    <MenuItem onClick={onClose}>
      <ListItemText>Print Audit History</ListItemText>
    </MenuItem>
  </Menu>
);

export default MoreToolsMenu;
