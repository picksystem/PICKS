import { Box } from '@serviceops/component';
import { ApprovalsSection } from './components';
import { ConfigurationSection } from '@serviceops/pages/base/Configuration/shared/ConfigurationSection';

const Approvals = () => (
  <Box sx={{ p: 3, width: '100%' }}>
    <ConfigurationSection loaderMessage='Loading Approvals Configuration...'>
      <ApprovalsSection />
    </ConfigurationSection>
  </Box>
);

export default Approvals;
