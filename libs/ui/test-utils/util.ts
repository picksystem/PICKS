import { RenderOptions } from '@testing-library/react';

export interface AllTheProvidersProps {
  children: React.ReactNode;
}

export interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {}
