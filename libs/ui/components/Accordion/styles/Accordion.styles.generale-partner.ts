import { Theme } from '@mui/material/styles';
import { createAppStyles } from '@serviceops/theme';
import { getBaseStyles } from './Accordion.styles.shared';

export const useStyles = createAppStyles((theme: Theme) => getBaseStyles(theme), {
  admin: {
    root: {},
    details: {},
    title: {},
  },
  user: {
    root: {},
    details: {},
    title: {},
  },
  consultant: {
    root: {},
    details: {},
    title: {},
  },
});
