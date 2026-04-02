import { Theme } from '@mui/material/styles';
import { getBaseStyles } from './Accordion.styles.shared';
import { createAppStyles } from '@serviceops/theme';

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
