import { Theme } from '@mui/material/styles';
import { createAppStyles } from '@serviceops/theme';
import { getBaseStyles } from './UserManagement.styles.shared';

export const useStyles = createAppStyles((theme: Theme) => getBaseStyles(theme), {
  admin: {
    container: {},
    title: {},
    description: {},
    tableContainer: {},
  },
  user: {
    container: {},
    title: {},
    description: {},
    tableContainer: {},
  },
  consultant: {
    container: {},
    title: {},
    description: {},
    tableContainer: {},
  },
});
