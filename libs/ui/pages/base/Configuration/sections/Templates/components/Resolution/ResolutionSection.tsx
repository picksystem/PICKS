import { useState, useEffect } from 'react';
import { IConfigResolutionTemplate } from '@serviceops/interfaces';
import { useConfiguration } from '@serviceops/confighooks';
import { GenericPanel } from '@serviceops/genericpanel';
import { useStyles } from '../../styles';
import { RESOLUTION_CONFIG, resolutionColumns } from '../shared/TemplatesPanelConfig';

interface ResolutionSectionProps {
  data?: IConfigResolutionTemplate[];
  onDataChange?: (data: IConfigResolutionTemplate[]) => void;
}

const ResolutionSection = ({ data, onDataChange }: ResolutionSectionProps) => {
  const { classes } = useStyles();
  const { resolutionTemplates, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigResolutionTemplate[]>([]);

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (resolutionTemplates?.items) {
      setRows(resolutionTemplates.items);
    }
  }, [data, resolutionTemplates]);

  const handleSave = (next: IConfigResolutionTemplate[]) => {
    setRows(next);
    if (onDataChange) {
      onDataChange(next);
    } else {
      saveSection('resolutionTemplates', { items: next });
    }
  };

  return (
    <div className={classes.sectionAccordion}>
      <GenericPanel
        config={RESOLUTION_CONFIG}
        data={rows}
        onSave={handleSave}
        customColumns={resolutionColumns as unknown as undefined}
        variant='plain'
        defaultExpanded={false}
      />
    </div>
  );
};

export { ResolutionSection };
