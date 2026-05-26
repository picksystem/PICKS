import { useState, useEffect } from 'react';
import { IConfigApplicationSubCategory } from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';
import { GenericPanel } from '@serviceops/pages/base/Configuration/shared/GenericPanel/GenericPanel';
import {
  CATEG_TABLE_CONFIG,
  applicationSubCategoryColumns,
} from '../shared/CategorizationPanelConfig';

interface ApplicationSubCategoriesSectionProps {
  data?: IConfigApplicationSubCategory[];
  onDataChange?: (data: IConfigApplicationSubCategory[]) => void;
}

const ApplicationSubCategoriesSection = ({
  data,
  onDataChange,
}: ApplicationSubCategoriesSectionProps) => {
  const { classes } = useStyles();
  const { categorization: apiCat, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigApplicationSubCategory[]>([]);

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (apiCat?.applicationSubCategories) {
      setRows(apiCat.applicationSubCategories);
    }
  }, [data, apiCat]);

  const handleSave = (next: IConfigApplicationSubCategory[]) => {
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
        applicationSubCategories: next,
        applicationNumberSequences: apiCat?.applicationNumberSequences ?? [],
      });
    }
  };

  return (
    <div className={classes.sectionAccordion}>
      <GenericPanel
        config={CATEG_TABLE_CONFIG.applicationSubCategory}
        data={rows}
        onSave={handleSave}
        customColumns={applicationSubCategoryColumns as any}
        variant='plain'
        defaultExpanded={false}
      />
    </div>
  );
};

export { ApplicationSubCategoriesSection };
