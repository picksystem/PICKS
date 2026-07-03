import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_CONFIGURATION_DATA, IConfigUserConsultantProfile } from '@serviceops/interfaces';
import { GenericPanel } from '@serviceops/genericpanel';
import {
  useGetConfigurationQuery,
  useUpdateConfigurationSectionMutation,
} from '@serviceops/services';
import {
  CONSULTANT_PROFILES_TABLE,
  consultantProfileColumns,
} from './shared/consultantProfiles.config';

const ConsultantProfilesAccordion = () => {
  const [rows, setRows] = useState<IConfigUserConsultantProfile[]>([]);

  const { data: configData } = useGetConfigurationQuery();
  const [updateSection] = useUpdateConfigurationSectionMutation();

  const apiConsultantProfiles = configData?.data?.userManagement?.consultantProfiles;

  useEffect(() => {
    if (apiConsultantProfiles !== undefined) {
      setRows(apiConsultantProfiles);
    }
  }, [apiConsultantProfiles]);

  const handleSave = useCallback(
    async (next: unknown[]) => {
      const newRows = next as IConfigUserConsultantProfile[];
      setRows(newRows);
      const current = configData?.data?.userManagement ?? DEFAULT_CONFIGURATION_DATA.userManagement;
      await updateSection({
        section: 'userManagement',
        value: { ...current, consultantProfiles: newRows },
      }).unwrap();
    },
    [configData, updateSection],
  );

  return (
    <GenericPanel
      config={CONSULTANT_PROFILES_TABLE}
      data={rows as unknown as Record<string, unknown>[]}
      onSave={handleSave}
      customColumns={consultantProfileColumns as unknown as never}
      variant='plain'
      defaultExpanded={false}
      enableSuccessMessage
    />
  );
};

export { ConsultantProfilesAccordion };
