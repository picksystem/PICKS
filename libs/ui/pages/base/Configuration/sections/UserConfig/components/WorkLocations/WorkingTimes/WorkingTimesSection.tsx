import { useState, useEffect } from 'react';
import { IConfigWorkLocationWorkingTime } from '@serviceops/interfaces';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';
import { GenericPanel } from '@serviceops/pages/base/Configuration/shared/GenericPanel/GenericPanel';
import { WORKING_TIME_CONFIG, workingTimeColumns } from '../../shared/userConfig.config';

interface WorkingTimesSectionProps {
  data?: IConfigWorkLocationWorkingTime[];
  onDataChange?: (data: IConfigWorkLocationWorkingTime[]) => void;
}

const WorkingTimesSection = ({ data, onDataChange }: WorkingTimesSectionProps) => {
  const { userConfig: apiUC, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigWorkLocationWorkingTime[]>([]);

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (apiUC?.workingTimes) {
      setRows(apiUC.workingTimes);
    }
  }, [data, apiUC]);

  const handleSave = (next: IConfigWorkLocationWorkingTime[]) => {
    setRows(next);
    if (onDataChange) {
      onDataChange(next);
    } else {
      saveSection('userConfig', {
        workLocations: apiUC?.workLocations ?? [],
        workingTimes: next,
        associatedProfiles: apiUC?.associatedProfiles ?? [],
        shifts: apiUC?.shifts ?? [],
        workLocationAssociations: apiUC?.workLocationAssociations ?? [],
      });
    }
  };

  return (
    <GenericPanel
      config={WORKING_TIME_CONFIG}
      data={rows}
      onSave={handleSave}
      customColumns={workingTimeColumns as any}
      variant='standard'
    />
  );
};

export { WorkingTimesSection };
