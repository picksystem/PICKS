import { useState, useEffect } from 'react';
import { IConfigWorkLocation } from '@serviceops/interfaces';
import { useConfiguration } from '@serviceops/confighooks';
import { GenericPanel } from '@serviceops/genericpanel';
import { WORK_LOCATION_CONFIG, workLocationColumns } from '../../shared/userConfig.config';

interface WorkLocationsSectionProps {
  data?: IConfigWorkLocation[];
  onDataChange?: (data: IConfigWorkLocation[]) => void;
}

const WorkLocationsSection = ({ data, onDataChange }: WorkLocationsSectionProps) => {
  const { userConfig: apiUC, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigWorkLocation[]>([]);

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (apiUC?.workLocations) {
      setRows(apiUC.workLocations);
    }
  }, [data, apiUC]);

  const handleSave = (next: IConfigWorkLocation[]) => {
    setRows(next);
    if (onDataChange) {
      onDataChange(next);
    } else {
      saveSection('userConfig', {
        workLocations: next,
        workingTimes: apiUC?.workingTimes ?? [],
        associatedProfiles: apiUC?.associatedProfiles ?? [],
        shifts: apiUC?.shifts ?? [],
        workLocationAssociations: apiUC?.workLocationAssociations ?? [],
      });
    }
  };

  return (
    <GenericPanel
      config={WORK_LOCATION_CONFIG}
      data={rows}
      onSave={handleSave}
      customColumns={workLocationColumns as any}
      variant='standard'
    />
  );
};

export { WorkLocationsSection };
