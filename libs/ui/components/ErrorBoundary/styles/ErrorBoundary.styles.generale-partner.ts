import { Theme } from '@mui/material/styles';
import { createAppStyles } from '@serviceops/theme';
import { getBaseStyles } from './ErrorBoundary.styles.shared';

export const useStyles = createAppStyles((theme: Theme) => getBaseStyles(theme), {
  admin: {
    container: {},
    paper: {},
    errorIcon: {},
    errorDetailsBox: {},
    errorText: {},
    buttonContainer: {},
  },
  user: {
    container: {},
    paper: {},
    errorIcon: {},
    errorDetailsBox: {},
    errorText: {},
    buttonContainer: {},
  },
});
