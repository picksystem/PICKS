import { useState, useEffect, useCallback } from 'react';
import { IConfigComposedWorkingTime } from '@serviceops/interfaces';
import { GenericPanel } from '@serviceops/genericpanel';
import {
  COMPOSED_WORKING_TIME_CONFIG,
  composedWorkingTimeColumns,
} from '../shared/userConfig.config';

interface WorkingTimesSectionProps {
  data?: IConfigComposedWorkingTime[];
  onDataChange?: (data: IConfigComposedWorkingTime[]) => void;
}

const WorkingTimesSection = ({ data, onDataChange }: WorkingTimesSectionProps) => {
  const [rows, setRows] = useState<IConfigComposedWorkingTime[]>([]);

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    }
  }, [data]);

  const handleSave = useCallback(
    (next: unknown[]) => {
      setRows(next as IConfigComposedWorkingTime[]);
      if (onDataChange) {
        onDataChange(next as IConfigComposedWorkingTime[]);
      }
    },
    [onDataChange],
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
