import { useState, useEffect, useCallback } from 'react';
import {
  DEFAULT_CONFIGURATION_DATA,
  IConfigProjectContract,
  IConfigProjectExtension,
} from '@serviceops/interfaces';
import { GenericAccordion } from '@serviceops/genericaccordion';
import { GenericPanel } from '@serviceops/genericpanel';
import { GenericToolbar } from '@serviceops/generictoolbar';
import {
  useGetConfigurationQuery,
  useUpdateConfigurationSectionMutation,
} from '@serviceops/services';
import {
  ACCENT,
  PROJECT_CONTRACTS_ICON,
  PROJECT_CONTRACTS_TABLE_CONFIG,
  projectContractColumns,
} from '../../shared/projectContracts.config';
import {
  PROJECT_EXTENSIONS_ICON,
  PROJECT_EXTENSIONS_TABLE_CONFIG,
  projectExtensionColumns,
} from '../../shared/projectExtensions.config';

type ActiveView = 'contracts' | 'extensions';

const ProjectContractsAccordion = () => {
  const [activeView, setActiveView] = useState<ActiveView>('contracts');
  const [contractRows, setContractRows] = useState<IConfigProjectContract[]>([]);
  const [extensionRows, setExtensionRows] = useState<IConfigProjectExtension[]>([]);

  const { data: configData, isLoading } = useGetConfigurationQuery();
  const [updateSection] = useUpdateConfigurationSectionMutation();

  const apiProjectContracts = configData?.data?.clientsAndProjects?.projectContracts;
  const apiProjectExtensions = configData?.data?.clientsAndProjects?.projectExtensions;

  useEffect(() => {
    if (apiProjectContracts !== undefined) {
      setContractRows(apiProjectContracts);
    }
  }, [apiProjectContracts]);

  useEffect(() => {
    if (apiProjectExtensions !== undefined) {
      setExtensionRows(apiProjectExtensions);
    }
  }, [apiProjectExtensions]);

  const handleSaveContracts = useCallback(
    async (next: unknown[]) => {
      const newRows = next as IConfigProjectContract[];
      setContractRows(newRows);
      const current =
        configData?.data?.clientsAndProjects ?? DEFAULT_CONFIGURATION_DATA.clientsAndProjects;
      await updateSection({
        section: 'clientsAndProjects',
        value: { ...current, projectContracts: newRows },
      }).unwrap();
    },
    [configData, updateSection],
  );

  const handleSaveExtensions = useCallback(
    async (next: unknown[]) => {
      const newRows = next as IConfigProjectExtension[];
      setExtensionRows(newRows);
      const current =
        configData?.data?.clientsAndProjects ?? DEFAULT_CONFIGURATION_DATA.clientsAndProjects;
      await updateSection({
        section: 'clientsAndProjects',
        value: { ...current, projectExtensions: newRows },
      }).unwrap();
    },
    [configData, updateSection],
  );

  return (
    <GenericAccordion
      title='Project Contracts'
      subtitle='Manage project contracts, extensions and their billing terms'
      icon={PROJECT_CONTRACTS_ICON}
      accent={ACCENT}
      defaultExpanded={false}
    >
      <GenericToolbar
        buttons={[
          {
            key: 'contracts',
            label: 'Project Contracts',
            icon: PROJECT_CONTRACTS_ICON,
            isActive: activeView === 'contracts',
            onClick: () => setActiveView('contracts'),
          },
          {
            key: 'extensions',
            label: 'Project Extensions',
            icon: PROJECT_EXTENSIONS_ICON,
            isActive: activeView === 'extensions',
            onClick: () => setActiveView('extensions'),
          },
        ]}
      />

      {activeView === 'contracts' && (
        <GenericPanel
          config={PROJECT_CONTRACTS_TABLE_CONFIG}
          data={contractRows as unknown as Record<string, unknown>[]}
          onSave={handleSaveContracts}
          customColumns={projectContractColumns as unknown as never}
          variant='standard'
          enableSuccessMessage
          isLoading={isLoading}
        />
      )}
      {activeView === 'extensions' && (
        <GenericPanel
          config={PROJECT_EXTENSIONS_TABLE_CONFIG}
          data={extensionRows as unknown as Record<string, unknown>[]}
          onSave={handleSaveExtensions}
          customColumns={projectExtensionColumns as unknown as never}
          variant='standard'
          enableSuccessMessage
          isLoading={isLoading}
        />
      )}
    </GenericAccordion>
  );
};

export { ProjectContractsAccordion };
