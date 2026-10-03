import { useConfiguration } from '@serviceops/confighooks';
import type { IConfigApplicationQueue } from '@serviceops/interfaces';

export interface QueueOption {
  id: string;
  name: string;
  applicationName: string;
  shortDescription: string;
}

export const useSharedQueues = () => {
  const { categorization: api } = useConfiguration();

  const queues: IConfigApplicationQueue[] = api?.queues ?? [];
  const isLoading = !api;

  const options: QueueOption[] = queues.map((q) => ({
    id: q.id,
    name: q.name,
    applicationName: q.applicationName,
    shortDescription: q.shortDescription || '',
  }));

  return { queues, options, isLoading };
};
