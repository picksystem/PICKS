import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CollapseProvider } from '../hooks/useCollapse';
import { AllTheProvidersProps, CustomRenderOptions } from './util';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  return (
    <ThemeProvider theme={theme}>
      <CollapseProvider>{children}</CollapseProvider>
    </ThemeProvider>
  );
};

const customRender = (ui: ReactElement, options?: CustomRenderOptions): RenderResult =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
