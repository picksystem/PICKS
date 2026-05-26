import { useState, useEffect } from 'react';
import { IConfigApplicationNumberSequence } from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';
import { GenericPanel } from '@serviceops/pages/base/Configuration/shared/GenericPanel/GenericPanel';
import {
  CATEG_TABLE_CONFIG,
  applicationNumberSequenceColumns,
} from '../shared/CategorizationPanelConfig';

interface ApplicationNumberSequencesSectionProps {
  data?: IConfigApplicationNumberSequence[];
  onDataChange?: (data: IConfigApplicationNumberSequence[]) => void;
}

const ApplicationNumberSequencesSection = ({
  data,
  onDataChange,
}: ApplicationNumberSequencesSectionProps) => {
  const { classes } = useStyles();
  const { categorization: apiCat, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigApplicationNumberSequence[]>([]);

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (apiCat?.applicationNumberSequences) {
      setRows(apiCat.applicationNumberSequences);
    }
  }, [data, apiCat]);

  const handleSave = (next: IConfigApplicationNumberSequence[]) => {
    setRows(next);
    if (onDataChange) {
      onDataChange(next);
    } else {
      saveSection('categorization', {
        businessCategories: apiCat?.businessCategories ?? [],
        serviceLines: apiCat?.serviceLines ?? [],
        applications: apiCat?.applications ?? [],
        queues: apiCat?.queues ?? [],
        applicationCategories: apiCat?.applicationCategories ?? [],
        applicationSubCategories: apiCat?.applicationSubCategories ?? [],
        applicationNumberSequences: next,
      });
    }
  };

  return (
    <div className={classes.sectionAccordion}>
      <GenericPanel
        config={CATEG_TABLE_CONFIG.applicationNumberSequence}
        data={rows}
        onSave={handleSave}
        customColumns={applicationNumberSequenceColumns as any}
        variant='plain'
        defaultExpanded={false}
      />
    </div>
  );
};

export { ApplicationNumberSequencesSection };
