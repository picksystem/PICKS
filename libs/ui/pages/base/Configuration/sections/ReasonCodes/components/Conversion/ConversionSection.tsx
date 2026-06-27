import { useState, useEffect } from 'react';
import { IConfigConversionReasonCode } from '@serviceops/interfaces';
import { useConfiguration } from '@serviceops/confighooks';
import { GenericPanel } from '@serviceops/genericpanel';
import { useStyles } from '../../styles';
import { CONVERSION_CONFIG, conversionColumns } from '../shared/ReasonCodesPanelConfig';
import { validateConversionDuplicate } from './validateConversion';

interface ConversionSectionProps {
  data?: IConfigConversionReasonCode[];
  onDataChange?: (data: IConfigConversionReasonCode[]) => void;
}

const ConversionSection = ({ data, onDataChange }: ConversionSectionProps) => {
  const { classes } = useStyles();
  const { reasonCodes, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigConversionReasonCode[]>([]);

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (reasonCodes?.conversionReasonCodes) {
      setRows(reasonCodes.conversionReasonCodes);
    }
  }, [data, reasonCodes]);

  const handleSave = (next: IConfigConversionReasonCode[]) => {
    setRows(next);
    if (onDataChange) {
      onDataChange(next);
    } else {
      saveSection('reasonCodes', {
        ...reasonCodes,
        conversionReasonCodes: next,
      });
    }
  };

  return (
    <div className={classes.sectionAccordion}>
      <GenericPanel
        config={CONVERSION_CONFIG}
        data={rows}
        onSave={handleSave}
        customColumns={conversionColumns as any}
        variant='plain'
        defaultExpanded={false}
        validateFields={validateConversionDuplicate as never}
      />
    </div>
  );
};

export { ConversionSection };
