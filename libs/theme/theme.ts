// theme.ts
import { createTheme } from '@mui/material/styles';
import { palette } from './palette';
import './theme.types'; // Import type declarations

const theme = createTheme({
  palette,

  breakpoints: {
    values: {
      xs: 0, // Mobile
      sm: 577, // Tablet
      md: 769, // Large Tablet / Small Desktop
      lg: 1025, // Desktop
      xl: 1351, // Large Desktop
    },
  },

  // Required for MUI + JSS (makeStyles) to register breakpoint rules
  components: {
    // Make the required-field asterisk always red across the entire application
    MuiFormLabel: {
      styleOverrides: {
        asterisk: {
          color: palette.error?.main ?? '#d32f2f',
        },
      },
    },
  },
});

export default theme;
