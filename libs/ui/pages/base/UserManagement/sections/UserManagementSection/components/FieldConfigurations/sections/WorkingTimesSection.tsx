import { useState, useEffect } from 'react';
import { IConfigWorkLocationWorkingTime } from '@serviceops/interfaces';
import { GenericPanel } from '@serviceops/genericpanel';
import { WORKING_TIME_CONFIG, workingTimeColumns } from '../shared/userConfig.config';

interface WorkingTimesSectionProps {
  data?: IConfigWorkLocationWorkingTime[];
  onDataChange?: (data: IConfigWorkLocationWorkingTime[]) => void;
}

const WorkingTimesSection = ({ data, onDataChange }: WorkingTimesSectionProps) => {
  const [rows, setRows] = useState<IConfigWorkLocationWorkingTime[]>([]);

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    }
  }, [data]);

  const handleSave = (next: IConfigWorkLocationWorkingTime[]) => {
    setRows(next);
    if (onDataChange) {
      onDataChange(next);
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
