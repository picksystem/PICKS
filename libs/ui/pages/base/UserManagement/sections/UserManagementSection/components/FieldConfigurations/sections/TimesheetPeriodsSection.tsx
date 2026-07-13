import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_CONFIGURATION_DATA, IConfigTimesheetPeriodEntry } from '@serviceops/interfaces';
import { GenericPanel } from '@serviceops/genericpanel';
import {
  TIMESHEET_PERIOD_ENTRY_CONFIG,
  timesheetPeriodEntryColumns,
} from '../shared/userConfig.config';
import {
  useGetConfigurationQuery,
  useUpdateConfigurationSectionMutation,
} from '@serviceops/services';

interface TimesheetPeriodsSectionProps {
  data?: IConfigTimesheetPeriodEntry[];
  onDataChange?: (data: IConfigTimesheetPeriodEntry[]) => void;
  hideHeader?: boolean;
}

const TimesheetPeriodsSection = ({ data, onDataChange, hideHeader }: TimesheetPeriodsSectionProps) => {
  const [rows, setRows] = useState<IConfigTimesheetPeriodEntry[]>([]);

  // Fetch from Configuration API
  const { data: configData } = useGetConfigurationQuery();
  const [updateSection] = useUpdateConfigurationSectionMutation();

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (configData?.data?.userManagement?.workingTimes?.timesheetPeriods) {
      setRows(configData.data.userManagement.workingTimes.timesheetPeriods);
    }
  }, [data, configData]);

  const handleSave = useCallback(
    async (next: unknown[]) => {
      const newRows = next as IConfigTimesheetPeriodEntry[];
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
              timesheetPeriods: newRows,
            },
          },
        }).unwrap();
      }
    },
    [onDataChange, configData, updateSection],
  );

  return (
    <GenericPanel
      config={TIMESHEET_PERIOD_ENTRY_CONFIG}
      data={rows as unknown as Record<string, unknown>[]}
      onSave={handleSave}
      customColumns={timesheetPeriodEntryColumns as unknown as never}
      variant='standard'
      hideHeader={hideHeader}
      enableSuccessMessage
    />
  );
};

export { TimesheetPeriodsSection };
