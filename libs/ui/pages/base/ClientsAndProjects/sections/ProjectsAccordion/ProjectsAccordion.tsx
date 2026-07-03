import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_CONFIGURATION_DATA, IConfigProject } from '@serviceops/interfaces';
import { GenericAccordion } from '@serviceops/genericaccordion';
import { GenericPanel } from '@serviceops/genericpanel';
import {
  useGetConfigurationQuery,
  useUpdateConfigurationSectionMutation,
} from '@serviceops/services';
import {
  ACCENT,
  PROJECTS_ICON,
  PROJECTS_TABLE_CONFIG,
  projectColumns,
} from '../../shared/projects.config';

const ProjectsAccordion = () => {
  const [rows, setRows] = useState<IConfigProject[]>([]);

  const { data: configData, isLoading } = useGetConfigurationQuery();
  const [updateSection] = useUpdateConfigurationSectionMutation();

  const apiProjects = configData?.data?.clientsAndProjects?.projects;

  useEffect(() => {
    if (apiProjects !== undefined) {
      setRows(apiProjects);
    }
  }, [apiProjects]);

  const handleSave = useCallback(
    async (next: unknown[]) => {
      const newRows = next as IConfigProject[];
      setRows(newRows);
      const current =
        configData?.data?.clientsAndProjects ?? DEFAULT_CONFIGURATION_DATA.clientsAndProjects;
      await updateSection({
        section: 'clientsAndProjects',
        value: { ...current, projects: newRows },
      }).unwrap();
    },
    [configData, updateSection],
  );

  return (
    <GenericAccordion
      title='Projects'
      subtitle='Manage projects, their contracts and pre-paid hours balances'
      icon={PROJECTS_ICON}
      accent={ACCENT}
      defaultExpanded={false}
    >
      <GenericPanel
        config={PROJECTS_TABLE_CONFIG}
        data={rows as unknown as Record<string, unknown>[]}
        onSave={handleSave}
        customColumns={projectColumns as unknown as never}
        variant='standard'
        enableSuccessMessage
        isLoading={isLoading}
      />
    </GenericAccordion>
  );
};

export { ProjectsAccordion };
