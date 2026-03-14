import { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CollapseProvider } from '../hooks/useCollapse';

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

interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  return (
    <ThemeProvider theme={theme}>
      <CollapseProvider>{children}</CollapseProvider>
    </ThemeProvider>
  );
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>): RenderResult =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
