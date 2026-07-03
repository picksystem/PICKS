import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_CONFIGURATION_DATA, IConfigUserConsultantRole } from '@serviceops/interfaces';
import { GenericPanel } from '@serviceops/genericpanel';
import {
  useGetConfigurationQuery,
  useUpdateConfigurationSectionMutation,
} from '@serviceops/services';
import { CONSULTANT_ROLES_TABLE, consultantRoleColumns } from './shared/consultantRoles.config';

const ConsultantRolesAccordion = () => {
  const [rows, setRows] = useState<IConfigUserConsultantRole[]>([]);

  const { data: configData } = useGetConfigurationQuery();
  const [updateSection] = useUpdateConfigurationSectionMutation();

  const apiConsultantRoles = configData?.data?.userManagement?.consultantRoles;

  useEffect(() => {
    if (apiConsultantRoles !== undefined) {
      setRows(apiConsultantRoles);
    }
  }, [apiConsultantRoles]);

  const handleSave = useCallback(
    async (next: unknown[]) => {
      const newRows = next as IConfigUserConsultantRole[];
      setRows(newRows);
      const current =
        configData?.data?.userManagement ?? DEFAULT_CONFIGURATION_DATA.userManagement;
      await updateSection({
        section: 'userManagement',
        value: { ...current, consultantRoles: newRows },
      }).unwrap();
    },
    [configData, updateSection],
  );

  return (
    <GenericPanel
      config={CONSULTANT_ROLES_TABLE}
      data={rows as unknown as Record<string, unknown>[]}
      onSave={handleSave}
      customColumns={consultantRoleColumns as unknown as never}
      variant='plain'
      defaultExpanded={false}
      enableSuccessMessage
    />
  );
};

export { ConsultantRolesAccordion };
