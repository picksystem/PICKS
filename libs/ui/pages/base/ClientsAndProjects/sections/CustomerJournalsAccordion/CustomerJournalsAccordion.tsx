import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_CONFIGURATION_DATA, IConfigCustomerJournal } from '@serviceops/interfaces';
import { GenericPanel } from '@serviceops/genericpanel';
import {
  useGetConfigurationQuery,
  useUpdateConfigurationSectionMutation,
} from '@serviceops/services';
import {
  ACCENT,
  CUSTOMER_JOURNALS_ICON,
  CUSTOMER_JOURNALS_TABLE_CONFIG,
  customerJournalColumns,
} from '../../shared/customerJournals.config';

const CustomerJournalsAccordion = () => {
  const [rows, setRows] = useState<IConfigCustomerJournal[]>([]);

  const { data: configData, isLoading } = useGetConfigurationQuery();
  const [updateSection] = useUpdateConfigurationSectionMutation();

  const apiCustomerJournals = configData?.data?.clientsAndProjects?.customerJournals;

  useEffect(() => {
    if (apiCustomerJournals !== undefined) {
      setRows(apiCustomerJournals);
    }
  }, [apiCustomerJournals]);

  const handleSave = useCallback(
    async (next: unknown[]) => {
      const newRows = next as IConfigCustomerJournal[];
      setRows(newRows);
      const current =
        configData?.data?.clientsAndProjects ?? DEFAULT_CONFIGURATION_DATA.clientsAndProjects;
      await updateSection({
        section: 'clientsAndProjects',
        value: { ...current, customerJournals: newRows },
      }).unwrap();
    },
    [configData, updateSection],
  );

  return (
    <GenericPanel
      config={CUSTOMER_JOURNALS_TABLE_CONFIG}
      data={rows as unknown as Record<string, unknown>[]}
      onSave={handleSave}
      customColumns={customerJournalColumns as unknown as never}
      variant='plain'
      defaultExpanded={false}
      enableSuccessMessage
      isLoading={isLoading}
    />
  );
};

export { CustomerJournalsAccordion };
