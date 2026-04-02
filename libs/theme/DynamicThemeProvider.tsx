import { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { getThemeOverride, mergeWithBase } from './themePalettes';
import './theme.types';

const STORAGE_KEY = 'serivceops_selected_theme';

interface ThemeContextValue {
  themeName: string;
  setThemeName: (name: string) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  themeName: 'System',
  setThemeName: () => {
    /* empty */
  },
});

export const useThemeContext = () => useContext(ThemeContext);

interface DynamicThemeProviderProps {
  children: ReactNode;
}

const DynamicThemeProvider = ({ children }: DynamicThemeProviderProps) => {
  const [themeName, setThemeNameState] = useState<string>(
    () => localStorage.getItem(STORAGE_KEY) || 'System',
  );

  const setThemeName = (name: string) => {
    setThemeNameState(name);
    localStorage.setItem(STORAGE_KEY, name);
  };

  const dynamicTheme = useMemo(() => {
    const override = getThemeOverride(themeName);
    const mergedPalette = mergeWithBase(override);

    return createTheme({
      palette: mergedPalette,
      breakpoints: {
        values: {
          xs: 0,
          sm: 577,
          md: 769,
          lg: 1025,
          xl: 1351,
        },
      },
      components: {
        MuiFormLabel: {
          styleOverrides: {
            asterisk: {
              color: mergedPalette.error?.main ?? '#d32f2f',
            },
          },
        },
        MuiDrawer: {
          styleOverrides: {
            paper: {
              backgroundColor: mergedPalette.sidebar.background,
              backgroundImage: 'none',
              transition: 'background-color 0.3s ease, width 0.3s ease',
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              transition: 'background-color 0.3s ease',
            },
          },
        },
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              backgroundColor: mergedPalette.background.default,
              color: mergedPalette.text.primary,
              transition: 'background-color 0.3s ease, color 0.2s ease',
            },
          },
        },
      },
    });
  }, [themeName]);

  return (
    <ThemeContext.Provider value={{ themeName, setThemeName }}>
      <ThemeProvider theme={dynamicTheme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default DynamicThemeProvider;
