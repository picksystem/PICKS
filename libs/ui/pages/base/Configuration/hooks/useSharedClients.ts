import { useGetConfigurationQuery } from '@serviceops/services';
import type { IConfigClient } from '@serviceops/interfaces';

export interface ClientOption {
  clientId: string;
  clientName: string;
}

/**
 * Shared hook for the Clients list (Clients & Projects > Clients accordion).
 * Mirrors the convention used by `useSharedConsultantRoles` /
 * `useSharedUserWorkLocations` — reads from the cached configuration query
 * rather than issuing its own fetch.
 */
export const useSharedClients = () => {
  const { data: configData, isLoading } = useGetConfigurationQuery();

  const clients: IConfigClient[] = configData?.data?.clientsAndProjects?.clients ?? [];

  const options: ClientOption[] = clients.map((c) => ({
    clientId: c.clientId ?? '',
    clientName: c.clientName ?? '',
  }));

  return { clients, options, isLoading };
};
