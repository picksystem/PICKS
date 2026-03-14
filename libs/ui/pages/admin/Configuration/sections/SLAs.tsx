import TimerIcon from '@mui/icons-material/Timer';
import ConfigPlaceholder from './ConfigPlaceholder';

const SLAs = () => (
  <ConfigPlaceholder
    title='Service Level Agreements (SLAs)'
    description='Define response and resolution targets based on priority and ticket type'
    Icon={TimerIcon}
    accentColor='#0891b2'
  />
);

export default SLAs;
