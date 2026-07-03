import { useState, useEffect, useCallback } from 'react';
import {
  DEFAULT_CONFIGURATION_DATA,
  IConfigUpdateTimesheetPeriodEntry,
} from '@serviceops/interfaces';
import { GenericPanel } from '@serviceops/genericpanel';
import {
  UPDATE_TIMESHEET_PERIOD_ENTRY_CONFIG,
  updateTimesheetPeriodEntryColumns,
} from '../shared/userConfig.config';
import {
  useGetConfigurationQuery,
  useUpdateConfigurationSectionMutation,
} from '@serviceops/services';

interface UpdateTimesheetPeriodsSectionProps {
  data?: IConfigUpdateTimesheetPeriodEntry[];
  onDataChange?: (data: IConfigUpdateTimesheetPeriodEntry[]) => void;
}

const UpdateTimesheetPeriodsSection = ({
  data,
  onDataChange,
}: UpdateTimesheetPeriodsSectionProps) => {
  const [rows, setRows] = useState<IConfigUpdateTimesheetPeriodEntry[]>([]);

  // Fetch from Configuration API
  const { data: configData } = useGetConfigurationQuery();
  const [updateSection] = useUpdateConfigurationSectionMutation();

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (configData?.data?.userManagement?.workingTimes?.updateTimesheetPeriods) {
      setRows(configData.data.userManagement.workingTimes.updateTimesheetPeriods);
    }
  }, [data, configData]);

  const handleSave = useCallback(
    async (next: unknown[]) => {
      const newRows = next as IConfigUpdateTimesheetPeriodEntry[];
      setRows(newRows);
      if (onDataChange) {
        onDataChange(newRows);
      } else {
        // Save to Configuration API
        const current =
          configData?.data?.userManagement ?? DEFAULT_CONFIGURATION_DATA.userManagement;
        await updateSection({
          section: 'userManagement',
          value: {
            ...current,
            workingTimes: {
              ...current.workingTimes,
              updateTimesheetPeriods: newRows,
            },
          },
        }).unwrap();
      }
    },
    [onDataChange, configData, updateSection],
  );

  return (
    <GenericPanel
      config={UPDATE_TIMESHEET_PERIOD_ENTRY_CONFIG}
      data={rows as unknown as Record<string, unknown>[]}
      onSave={handleSave}
      customColumns={updateTimesheetPeriodEntryColumns as unknown as never}
      variant='standard'
      enableSuccessMessage
    />
  );
};

export { UpdateTimesheetPeriodsSection };
