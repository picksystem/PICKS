import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_CONFIGURATION_DATA, IConfigClient } from '@serviceops/interfaces';
import { GenericAccordion } from '@serviceops/genericaccordion';
import { GenericPanel } from '@serviceops/genericpanel';
import {
  useGetConfigurationQuery,
  useUpdateConfigurationSectionMutation,
} from '@serviceops/services';
import {
  ACCENT,
  CLIENTS_ICON,
  CLIENTS_TABLE_CONFIG,
  clientColumns,
} from '../../shared/clients.config';

const ClientsAccordion = () => {
  const [rows, setRows] = useState<IConfigClient[]>([]);

  const { data: configData, isLoading } = useGetConfigurationQuery();
  const [updateSection] = useUpdateConfigurationSectionMutation();

  const apiClients = configData?.data?.clientsAndProjects?.clients;

  useEffect(() => {
    if (apiClients !== undefined) {
      setRows(apiClients);
    }
  }, [apiClients]);

  const handleSave = useCallback(
    async (next: unknown[]) => {
      const newRows = next as IConfigClient[];
      setRows(newRows);
      const current =
        configData?.data?.clientsAndProjects ?? DEFAULT_CONFIGURATION_DATA.clientsAndProjects;
      await updateSection({
        section: 'clientsAndProjects',
        value: { ...current, clients: newRows },
      }).unwrap();
    },
    [configData, updateSection],
  );

  return (
    <GenericAccordion
      title='Clients'
      subtitle='Manage client master records and billing details'
      icon={CLIENTS_ICON}
      accent={ACCENT}
      defaultExpanded={true}
    >
      <GenericPanel
        config={CLIENTS_TABLE_CONFIG}
        data={rows as unknown as Record<string, unknown>[]}
        onSave={handleSave}
        customColumns={clientColumns as unknown as never}
        variant='standard'
        enableSuccessMessage
        isLoading={isLoading}
      />
    </GenericAccordion>
  );
};

export { ClientsAccordion };
