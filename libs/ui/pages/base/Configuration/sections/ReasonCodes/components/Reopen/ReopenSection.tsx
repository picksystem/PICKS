import { useState, useEffect } from 'react';
import { IConfigReopenReasonCode } from '@serviceops/interfaces';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';
import { GenericPanel } from '@serviceops/pages/base/Configuration/shared/GenericPanel/GenericPanel';
import { useStyles } from '../../styles';
import { REOPEN_CONFIG, reopenColumns } from '../shared/ReasonCodesPanelConfig';

interface ReopenSectionProps {
  data?: IConfigReopenReasonCode[];
  onDataChange?: (data: IConfigReopenReasonCode[]) => void;
}

const ReopenSection = ({ data, onDataChange }: ReopenSectionProps) => {
  const { classes } = useStyles();
  const { reasonCodes, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigReopenReasonCode[]>([]);

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (reasonCodes?.reopenReasonCodes) {
      setRows(reasonCodes.reopenReasonCodes);
    }
  }, [data, reasonCodes]);

  const handleSave = (next: IConfigReopenReasonCode[]) => {
    setRows(next);
    if (onDataChange) {
      onDataChange(next);
    } else {
      saveSection('reasonCodes', {
        ...reasonCodes,
        reopenReasonCodes: next,
      });
    }
  };

  return (
    <div className={classes.sectionAccordion}>
      <GenericPanel
        config={REOPEN_CONFIG}
        data={rows}
        onSave={handleSave}
        customColumns={reopenColumns as any}
        variant='plain'
        defaultExpanded={false}
      />
    </div>
  );
};

export { ReopenSection };
