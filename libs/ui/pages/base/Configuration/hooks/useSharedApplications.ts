import { useConfiguration } from '@serviceops/confighooks';
import type { IConfigApplication } from '@serviceops/interfaces';

export interface ApplicationOption {
  id: string;
  name: string;
}

export const useSharedApplications = () => {
  const { categorization: api } = useConfiguration();

  const applications: IConfigApplication[] = api?.applications ?? [];
  const isLoading = !api;

  const options: ApplicationOption[] = applications.map((a) => ({
    id: a.id,
    name: a.name,
  }));

  return { applications, options, isLoading };
};
