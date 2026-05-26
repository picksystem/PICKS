import { useState, useEffect } from 'react';
import { IConfigBusinessCategory } from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';
import { GenericPanel } from '@serviceops/pages/base/Configuration/shared/GenericPanel/GenericPanel';
import { CATEG_TABLE_CONFIG, businessCategoryColumns } from '../shared/CategorizationPanelConfig';

interface BusinessCategoriesSectionProps {
  data?: IConfigBusinessCategory[];
  onDataChange?: (data: IConfigBusinessCategory[]) => void;
}

const BusinessCategoriesSection = ({ data, onDataChange }: BusinessCategoriesSectionProps) => {
  const { classes } = useStyles();
  const { categorization: apiCat, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigBusinessCategory[]>([]);

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (apiCat?.businessCategories) {
      setRows(apiCat.businessCategories);
    }
  }, [data, apiCat]);

  const handleSave = (next: IConfigBusinessCategory[]) => {
    setRows(next);
    if (onDataChange) {
      onDataChange(next);
    } else {
      saveSection('categorization', {
        businessCategories: next,
        serviceLines: apiCat?.serviceLines ?? [],
        applications: apiCat?.applications ?? [],
        queues: apiCat?.queues ?? [],
        applicationCategories: apiCat?.applicationCategories ?? [],
        applicationSubCategories: apiCat?.applicationSubCategories ?? [],
        applicationNumberSequences: apiCat?.applicationNumberSequences ?? [],
      });
    }
  };

  return (
    <div className={classes.sectionAccordion}>
      <GenericPanel
        config={CATEG_TABLE_CONFIG.businessCategory}
        data={rows}
        onSave={handleSave}
        customColumns={businessCategoryColumns as any}
        variant='plain'
      />
    </div>
  );
};

export { BusinessCategoriesSection };
