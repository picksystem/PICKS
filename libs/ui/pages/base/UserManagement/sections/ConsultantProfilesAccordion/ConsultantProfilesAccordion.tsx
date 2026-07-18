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

  // A consultant can hold multiple profiles, but not two for the same
  // application — same "already exists" dialog-level Alert pattern used by
  // the Working Day Templates / Business Category sections (see
  // WorkingDayTemplatesSection.summaryValidator).
  const summaryValidator = useCallback(
    (
      form: Record<string, unknown>,
      _all: unknown[],
      editingRow: Record<string, unknown> | null,
    ): string | null => {
      const consultantVal = String(form.consultantName ?? '')
        .trim()
        .toLowerCase();
      const appVal = String(form.application ?? '')
        .trim()
        .toLowerCase();
      if (!consultantVal || !appVal) return null;
      const editingId = (editingRow?.id as string | undefined) ?? null;
      const isDuplicate = rows.some(
        (r) =>
          r.id !== editingId &&
          String(r.consultantName ?? '')
            .trim()
            .toLowerCase() === consultantVal &&
          String(r.application ?? '')
            .trim()
            .toLowerCase() === appVal,
      );
      return isDuplicate
        ? 'This Consultant Name and Application combination already exists. Please use a different value.'
        : null;
    },
    [rows],
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
      summaryValidator={summaryValidator as unknown as never}
    />
  );
};

export { ConsultantProfilesAccordion };
