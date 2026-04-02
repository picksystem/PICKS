import { Theme } from '@mui/material/styles';
import { getBaseStyles } from './Button.styles.shared';
import { createAppStyles } from '@serviceops/theme';

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
