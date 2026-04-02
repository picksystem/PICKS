import { Theme } from '@mui/material/styles';
import { createAppStyles } from '@serviceops/theme';
import { getBaseStyles } from './AutoGrid.styles.shared';

export const useStyles = createAppStyles((theme: Theme) => getBaseStyles(theme), {
  admin: {
    root: {},
  },
  user: {
    root: {},
  },
  consultant: {
    root: {},
  },
});
