import { Theme } from '@mui/material/styles';
import { createAppStyles } from '@serviceops/theme';
import { getBaseStyles } from './ClientsAndProjects.styles.shared';

export const useStyles = createAppStyles((theme: Theme) => getBaseStyles(theme), {
  admin: {
    pageHeader: {},
    pageHeaderRow: {},
    title: {},
    description: {},
    container: {},
    tableContainer: {},
    sectionAccordion: {},
    actionToolbar: {},
    toolbarButtons: {},
    tablePaper: {},
  },
});
