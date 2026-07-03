import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_CONFIGURATION_DATA, IConfigProjectJournal } from '@serviceops/interfaces';
import { GenericAccordion } from '@serviceops/genericaccordion';
import { GenericPanel } from '@serviceops/genericpanel';
import {
  useGetConfigurationQuery,
  useUpdateConfigurationSectionMutation,
} from '@serviceops/services';
import {
  ACCENT,
  PROJECT_JOURNALS_ICON,
  PROJECT_JOURNALS_TABLE_CONFIG,
  projectJournalColumns,
} from '../../shared/projectJournals.config';

const ProjectJournalsAccordion = () => {
  const [rows, setRows] = useState<IConfigProjectJournal[]>([]);

  const { data: configData, isLoading } = useGetConfigurationQuery();
  const [updateSection] = useUpdateConfigurationSectionMutation();

  const apiProjectJournals = configData?.data?.clientsAndProjects?.projectJournals;

  useEffect(() => {
    if (apiProjectJournals !== undefined) {
      setRows(apiProjectJournals);
    }
  }, [apiProjectJournals]);

  const handleSave = useCallback(
    async (next: unknown[]) => {
      const newRows = next as IConfigProjectJournal[];
      setRows(newRows);
      const current =
        configData?.data?.clientsAndProjects ?? DEFAULT_CONFIGURATION_DATA.clientsAndProjects;
      await updateSection({
        section: 'clientsAndProjects',
        value: { ...current, projectJournals: newRows },
      }).unwrap();
    },
    [configData, updateSection],
  );

  return (
    <GenericAccordion
      title='Project Journals'
      subtitle='Track project journal transactions and their approval status'
      icon={PROJECT_JOURNALS_ICON}
      accent={ACCENT}
      defaultExpanded={false}
    >
      <GenericPanel
        config={PROJECT_JOURNALS_TABLE_CONFIG}
        data={rows as unknown as Record<string, unknown>[]}
        onSave={handleSave}
        customColumns={projectJournalColumns as unknown as never}
        variant='standard'
        enableSuccessMessage
        isLoading={isLoading}
      />
    </GenericAccordion>
  );
};

export { ProjectJournalsAccordion };
