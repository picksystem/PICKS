import { Theme } from '@mui/material/styles';
import { createAppStyles } from '@serviceops/theme';
import { getBaseStyles } from './CardCTA.styles.shared';

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
