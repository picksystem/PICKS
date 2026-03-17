import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import ConfigPlaceholder from './ConfigPlaceholder';

const Statuses = () => (
  <ConfigPlaceholder
    title='Statuses'
    description='Configure ticket lifecycle statuses and transitions for each ticket type'
    Icon={RadioButtonCheckedIcon}
    accentColor='#7c3aed'
  />
);

export default Statuses;
