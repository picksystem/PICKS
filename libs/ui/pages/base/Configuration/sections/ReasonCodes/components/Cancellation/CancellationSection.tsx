import { useState, useEffect } from 'react';
import { IConfigCancellationReasonCode } from '@serviceops/interfaces';
import { useConfiguration } from '@serviceops/confighooks';
import { GenericPanel } from '@serviceops/genericpanel';
import { useStyles } from '../../styles';
import { CANCELLATION_CONFIG, countdownColumns } from '../shared/ReasonCodesPanelConfig';

interface CancellationSectionProps {
  data?: IConfigCancellationReasonCode[];
  onDataChange?: (data: IConfigCancellationReasonCode[]) => void;
}

const CancellationSection = ({ data, onDataChange }: CancellationSectionProps) => {
  const { classes } = useStyles();
  const { reasonCodes, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigCancellationReasonCode[]>([]);

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (reasonCodes?.cancellationReasonCodes) {
      setRows(reasonCodes.cancellationReasonCodes);
    }
  }, [data, reasonCodes]);

  const handleSave = (next: IConfigCancellationReasonCode[]) => {
    setRows(next);
    if (onDataChange) {
      onDataChange(next);
    } else {
      saveSection('reasonCodes', {
        ...reasonCodes,
        cancellationReasonCodes: next,
      });
    }
  };

  return (
    <div className={classes.sectionAccordion}>
      <GenericPanel
        config={CANCELLATION_CONFIG}
        data={rows}
        onSave={handleSave}
        customColumns={countdownColumns as any}
        variant='plain'
        defaultExpanded={false}
      />
    </div>
  );
};

export { CancellationSection };
