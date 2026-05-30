import { useState, useEffect } from 'react';
import { IConfigTimeEntryTemplate } from '@serviceops/interfaces';
import { useConfiguration } from '@serviceops/confighooks';
import { GenericPanel } from '@serviceops/genericpanel';
import { useStyles } from '../../styles';
import { TIME_ENTRY_CONFIG, timeEntryColumns } from '../shared/TemplatesPanelConfig';

interface TimeEntrySectionProps {
  data?: IConfigTimeEntryTemplate[];
  onDataChange?: (data: IConfigTimeEntryTemplate[]) => void;
}

const TimeEntrySection = ({ data, onDataChange }: TimeEntrySectionProps) => {
  const { classes } = useStyles();
  const { timeEntryTemplates, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigTimeEntryTemplate[]>([]);

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (timeEntryTemplates?.items) {
      setRows(timeEntryTemplates.items);
    }
  }, [data, timeEntryTemplates]);

  const handleSave = (next: IConfigTimeEntryTemplate[]) => {
    setRows(next);
    if (onDataChange) {
      onDataChange(next);
    } else {
      saveSection('timeEntryTemplates', { items: next });
    }
  };

  return (
    <div className={classes.sectionAccordion}>
      <GenericPanel
        config={TIME_ENTRY_CONFIG}
        data={rows}
        onSave={handleSave}
        customColumns={timeEntryColumns as unknown as undefined}
        variant='plain'
        defaultExpanded={false}
      />
    </div>
  );
};

export { TimeEntrySection };