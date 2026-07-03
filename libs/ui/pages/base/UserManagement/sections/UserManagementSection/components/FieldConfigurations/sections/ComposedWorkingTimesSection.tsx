import { useState, useEffect, useCallback } from 'react';
import {
  IConfigComposedWorkingTime,
  IConfigWorkingCalendar,
  IConfigHolidayCalendar,
  IConfigWorkingDayTemplate,
} from '@serviceops/interfaces';
import { useConfiguration } from '@serviceops/confighooks';
import { GenericAccordion } from '@serviceops/genericaccordion';
import { GenericToolbar } from '@serviceops/generictoolbar';
import { GenericPanel } from '@serviceops/genericpanel';
import {
  COMPOSED_WORKING_TIME_CONFIG,
  composedWorkingTimeColumns,
} from '../shared/userConfig.config';

interface ComposeWorkingTimesSectionProps {
  data?: IConfigComposedWorkingTime[];
  onDataChange?: (data: IConfigComposedWorkingTime[]) => void;
}

const ComposeWorkingTimesSection = ({
  data,
  onDataChange,
}: ComposeWorkingTimesSectionProps) => {
  const { calendars: apiCalendars } = useConfiguration();
  const [rows, setRows] = useState<IConfigComposedWorkingTime[]>([]);

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    }
  }, [data]);

  const handleSave = (next: unknown[]) => {
    setRows(next as IConfigComposedWorkingTime[]);
    if (onDataChange) {
      onDataChange(next as IConfigComposedWorkingTime[]);
    }
  };

  return (
    <GenericAccordion
      title={COMPOSED_WORKING_TIME_CONFIG.title}
      subtitle={COMPOSED_WORKING_TIME_CONFIG.subtitle}
      icon={COMPOSED_WORKING_TIME_CONFIG.icon}
      accent={COMPOSED_WORKING_TIME_CONFIG.accent}
      defaultExpanded={false}
    >
      <GenericPanel
        config={COMPOSED_WORKING_TIME_CONFIG}
        data={rows as unknown as Record<string, unknown>[]}
        onSave={handleSave as (data: unknown[]) => void}
        customColumns={composedWorkingTimeColumns as unknown as never}
        variant="standard"
        enableSuccessMessage
      />
    </GenericAccordion>
  );
};

export { ComposeWorkingTimesSection };
