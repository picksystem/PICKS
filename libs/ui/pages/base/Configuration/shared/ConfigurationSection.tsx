import { Loader } from '@serviceops/component';
import { useConfiguration } from '../hooks/useConfiguration';

interface ConfigurationSectionProps {
  children: React.ReactNode;
  showLoader?: boolean;
  loaderMessage?: string;
}

export const ConfigurationSection = ({
  children,
  showLoader = true,
  loaderMessage = 'Loading configuration...',
}: ConfigurationSectionProps) => {
  const { isLoading } = useConfiguration();

  if (isLoading && showLoader) {
    return <Loader text={loaderMessage} />;
  }

  return <>{children}</>;
};
