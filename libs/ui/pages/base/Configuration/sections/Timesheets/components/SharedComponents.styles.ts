import { Theme } from '@mui/material/styles';
import { createAppStyles } from '@serviceops/theme';

export const useStyles = createAppStyles(
  (theme: Theme) => ({
    container: { mt: 2 },
    dataTablePaper: { borderRadius: 1, overflow: 'hidden' },
    tableSearchField: {
      flexShrink: 0,
      width: '160px',
      '& .MuiOutlinedInput-root': {
        height: '30px',
        fontSize: '0.8rem',
        backgroundColor: theme.palette.common.white,
        borderRadius: '6px',
      },
      '& .MuiInputBase-input': { padding: '4px 6px', fontSize: '0.8rem' },
      '& .MuiInputBase-input::placeholder': { opacity: 0.7 },
      '& .MuiInputAdornment-root .MuiSvgIcon-root': {
        fontSize: '1.1rem',
        color: theme.palette.text.secondary,
      },
      [theme.breakpoints.down('sm')]: { width: '100%', flexShrink: 1 },
      [theme.breakpoints.up('sm')]: { flexGrow: 0 },
    },
  }),
  {},
);
