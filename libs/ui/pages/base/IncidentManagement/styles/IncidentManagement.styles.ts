import { Theme } from '@mui/material/styles';

import { getBaseStyles } from './IncidentManagement.styles.shared';
import { createAppStyles } from '../../../../../theme';

export const useStyles = createAppStyles((theme: Theme) => getBaseStyles(theme), {});
