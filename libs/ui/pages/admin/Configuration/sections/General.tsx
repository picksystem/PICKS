import SettingsIcon from '@mui/icons-material/Settings';
import ConfigPlaceholder from './ConfigPlaceholder';

const General = () => (
  <ConfigPlaceholder
    title='General Settings'
    description='System-wide defaults, locale, timezone, and branding preferences'
    Icon={SettingsIcon}
    accentColor='#2563eb'
  />
);

export default General;
