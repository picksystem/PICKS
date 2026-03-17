import FileCopyIcon from '@mui/icons-material/FileCopy';
import ConfigPlaceholder from './ConfigPlaceholder';

const Templates = () => (
  <ConfigPlaceholder
    title='Templates'
    description='Create and manage reusable ticket templates for common request types'
    Icon={FileCopyIcon}
    accentColor='#4f46e5'
  />
);

export default Templates;
