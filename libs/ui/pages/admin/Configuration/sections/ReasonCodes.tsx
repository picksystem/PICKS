import CommentIcon from '@mui/icons-material/Comment';
import ConfigPlaceholder from './ConfigPlaceholder';

const ReasonCodes = () => (
  <ConfigPlaceholder
    title='Reason Codes'
    description='Define codes for closure, cancellation, escalation and other ticket actions'
    Icon={CommentIcon}
    accentColor='#0f766e'
  />
);

export default ReasonCodes;
