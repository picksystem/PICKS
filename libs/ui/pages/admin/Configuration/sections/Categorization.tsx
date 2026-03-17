import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ConfigPlaceholder from './ConfigPlaceholder';

const Categorization = () => (
  <ConfigPlaceholder
    title='Categorization'
    description='Manage category trees for ticket classification and routing'
    Icon={AccountTreeIcon}
    accentColor='#059669'
  />
);

export default Categorization;
