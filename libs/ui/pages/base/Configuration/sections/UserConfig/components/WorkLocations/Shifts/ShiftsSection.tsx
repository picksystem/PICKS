import { useState, useEffect } from 'react';
import { IConfigWorkLocationShift } from '@serviceops/interfaces';
import { useConfiguration } from '@serviceops/confighooks';
import { GenericPanel } from '@serviceops/genericpanel';
import { SHIFT_CONFIG, shiftColumns } from '../../shared/userConfig.config';

interface ShiftsSectionProps {
  data?: IConfigWorkLocationShift[];
  onDataChange?: (data: IConfigWorkLocationShift[]) => void;
}

const ShiftsSection = ({ data, onDataChange }: ShiftsSectionProps) => {
  const { userConfig: apiUC, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigWorkLocationShift[]>([]);

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (apiUC?.shifts) {
      setRows(apiUC.shifts);
    }
  }, [data, apiUC]);

  const handleSave = (next: IConfigWorkLocationShift[]) => {
    setRows(next);
    if (onDataChange) {
      onDataChange(next);
    } else {
      saveSection('userConfig', {
        workLocations: apiUC?.workLocations ?? [],
        workingTimes: apiUC?.workingTimes ?? [],
        associatedProfiles: apiUC?.associatedProfiles ?? [],
        shifts: next,
        workLocationAssociations: apiUC?.workLocationAssociations ?? [],
      });
    }
  };

  return (
    <GenericPanel
      config={SHIFT_CONFIG}
      data={rows}
      onSave={handleSave}
      customColumns={shiftColumns as any}
      variant='standard'
    />
  );
};

export { ShiftsSection };
