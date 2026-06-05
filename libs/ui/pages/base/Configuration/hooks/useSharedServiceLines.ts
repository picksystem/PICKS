import { useConfiguration } from '@serviceops/confighooks';
import type { IConfigServiceLine } from '@serviceops/interfaces';

export interface ServiceLineOption {
  id: string;
  name: string;
}

export const useSharedServiceLines = () => {
  const { categorization: api } = useConfiguration();

  const serviceLines: IConfigServiceLine[] = api?.serviceLines ?? [];
  const isLoading = !api;

  const options: ServiceLineOption[] = serviceLines.map((sl) => ({
    id: sl.id,
    name: sl.name,
  }));

  return { serviceLines, options, isLoading };
};
