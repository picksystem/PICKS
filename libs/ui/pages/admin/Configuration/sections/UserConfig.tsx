import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import ConfigPlaceholder from './ConfigPlaceholder';

const UserConfig = () => (
  <ConfigPlaceholder
    title='User Config'
    description='Default roles, permissions, departments and user onboarding preferences'
    Icon={ManageAccountsIcon}
    accentColor='#be185d'
  />
);

export default UserConfig;
