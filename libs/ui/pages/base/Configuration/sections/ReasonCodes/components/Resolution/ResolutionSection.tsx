import { useState, useEffect } from 'react';
import { IConfigResolutionCode } from '@serviceops/interfaces';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';
import { GenericPanel } from '@serviceops/pages/base/Configuration/shared/GenericPanel/GenericPanel';
import { useStyles } from '../../styles';
import { RESOLUTION_CONFIG, resolutionColumns } from '../shared/ReasonCodesPanelConfig';

interface ResolutionSectionProps {
  data?: IConfigResolutionCode[];
  onDataChange?: (data: IConfigResolutionCode[]) => void;
}

const ResolutionSection = ({ data, onDataChange }: ResolutionSectionProps) => {
  const { classes } = useStyles();
  const { reasonCodes, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigResolutionCode[]>([]);

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (reasonCodes?.resolutionCodes) {
      setRows(reasonCodes.resolutionCodes);
    }
  }, [data, reasonCodes]);

  const handleSave = (next: IConfigResolutionCode[]) => {
    setRows(next);
    if (onDataChange) {
      onDataChange(next);
    } else {
      saveSection('reasonCodes', {
        ...reasonCodes,
        resolutionCodes: next,
      });
    }
  };

  return (
    <div className={classes.sectionAccordion}>
      <GenericPanel
        config={RESOLUTION_CONFIG}
        data={rows}
        onSave={handleSave}
        customColumns={resolutionColumns as any}
        variant='plain'
        defaultExpanded={false}
      />
    </div>
  );
};

export { ResolutionSection };
