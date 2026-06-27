import { useState, useEffect } from 'react';
import { IConfigPriorityChangeReasonCode } from '@serviceops/interfaces';
import { useConfiguration } from '@serviceops/confighooks';
import { GenericPanel } from '@serviceops/genericpanel';
import { useStyles } from '../../styles';
import { PRIORITY_CHANGE_CONFIG, priorityChangeColumns } from '../shared/ReasonCodesPanelConfig';
import { validatePriorityChangeDuplicate } from './validatePriorityChange';

interface PriorityChangeSectionProps {
  data?: IConfigPriorityChangeReasonCode[];
  onDataChange?: (data: IConfigPriorityChangeReasonCode[]) => void;
}

const PriorityChangeSection = ({ data, onDataChange }: PriorityChangeSectionProps) => {
  const { classes } = useStyles();
  const { reasonCodes, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigPriorityChangeReasonCode[]>([]);

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (reasonCodes?.priorityChangeReasonCodes) {
      setRows(reasonCodes.priorityChangeReasonCodes);
    }
  }, [data, reasonCodes]);

  const handleSave = (next: IConfigPriorityChangeReasonCode[]) => {
    setRows(next);
    if (onDataChange) {
      onDataChange(next);
    } else {
      saveSection('reasonCodes', {
        ...reasonCodes,
        priorityChangeReasonCodes: next,
      });
    }
  };

  return (
    <div className={classes.sectionAccordion}>
      <GenericPanel
        config={PRIORITY_CHANGE_CONFIG}
        data={rows}
        onSave={handleSave}
        customColumns={priorityChangeColumns as any}
        variant='plain'
        validateFields={validatePriorityChangeDuplicate as never}
      />
    </div>
  );
};

export { PriorityChangeSection };
