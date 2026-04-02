import { Theme } from '@mui/material/styles';
import { createAppStyles } from '@serviceops/theme';
import { getBaseStyles } from './DataTable.styles.shared';

export const useStyles = createAppStyles((theme: Theme) => getBaseStyles(theme), {
  admin: {
    toolbar: {},
    toolbarSelected: {},
    title: {},
    searchField: {},
    tableContainer: {},
    tableCell: {},
    clickableRow: {},
    defaultRow: {},
    emptyCell: {},
  },
  user: {
    toolbar: {},
    toolbarSelected: {},
    title: {},
    searchField: {},
    tableContainer: {},
    tableCell: {},
    clickableRow: {},
    defaultRow: {},
    emptyCell: {},
  },
});
