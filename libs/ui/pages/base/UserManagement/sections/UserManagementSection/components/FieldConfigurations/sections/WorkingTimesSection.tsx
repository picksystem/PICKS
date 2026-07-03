import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_CONFIGURATION_DATA, IConfigComposedWorkingTime } from '@serviceops/interfaces';
import { GenericPanel } from '@serviceops/genericpanel';
import {
  COMPOSED_WORKING_TIME_CONFIG,
  composedWorkingTimeColumns,
} from '../shared/userConfig.config';
import {
  useGetConfigurationQuery,
  useUpdateConfigurationSectionMutation,
} from '@serviceops/services';

interface WorkingTimesSectionProps {
  data?: IConfigComposedWorkingTime[];
  onDataChange?: (data: IConfigComposedWorkingTime[]) => void;
}

const WorkingTimesSection = ({ data, onDataChange }: WorkingTimesSectionProps) => {
  const [rows, setRows] = useState<IConfigComposedWorkingTime[]>([]);

  // Fetch from Configuration API
  const { data: configData } = useGetConfigurationQuery();
  const [updateSection] = useUpdateConfigurationSectionMutation();

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (configData?.data?.userManagement?.workingTimes?.composeWorkingTimes) {
      setRows(configData.data.userManagement.workingTimes.composeWorkingTimes);
    }
  }, [data, configData]);

  const handleSave = useCallback(
    async (next: unknown[]) => {
      const newRows = next as IConfigComposedWorkingTime[];
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
              composeWorkingTimes: newRows,
            },
          },
        }).unwrap();
      }
    },
    [onDataChange, configData, updateSection],
  );

  return (
    <GenericPanel
      config={COMPOSED_WORKING_TIME_CONFIG}
      data={rows as unknown as Record<string, unknown>[]}
      onSave={handleSave}
      customColumns={composedWorkingTimeColumns as unknown as never}
      variant='standard'
      enableSuccessMessage
    />
  );
};

export { WorkingTimesSection };
