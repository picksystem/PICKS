import HowToRegIcon from '@mui/icons-material/HowToReg';
import ConfigPlaceholder from './ConfigPlaceholder';

const Approvals = () => (
  <ConfigPlaceholder
    title='Approvals'
    description='Configure multi-level approval workflows for tickets and user registrations'
    Icon={HowToRegIcon}
    accentColor='#0369a1'
  />
);

export default Approvals;
