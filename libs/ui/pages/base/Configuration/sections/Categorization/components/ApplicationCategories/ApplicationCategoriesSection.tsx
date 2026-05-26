import { useState, useEffect } from 'react';
import { IConfigApplicationCategory } from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';
import { GenericPanel } from '@serviceops/pages/base/Configuration/shared/GenericPanel/GenericPanel';
import {
  CATEG_TABLE_CONFIG,
  applicationCategoryColumns,
} from '../shared/CategorizationPanelConfig';
import { ApplicationCategoriesSectionProps } from './ApplicationCategoriesSection.types';

const ApplicationCategoriesSection = ({
  data,
  onDataChange,
}: ApplicationCategoriesSectionProps) => {
  const { classes } = useStyles();
  const { categorization: apiCat, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigApplicationCategory[]>([]);

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (apiCat?.applicationCategories) {
      setRows(apiCat.applicationCategories);
    }
  }, [data, apiCat]);

  const handleSave = (next: IConfigApplicationCategory[]) => {
    setRows(next);
    if (onDataChange) {
      onDataChange(next);
    } else {
      saveSection('categorization', {
        businessCategories: apiCat?.businessCategories ?? [],
        serviceLines: apiCat?.serviceLines ?? [],
        applications: apiCat?.applications ?? [],
        queues: apiCat?.queues ?? [],
        applicationCategories: next,
        applicationSubCategories: apiCat?.applicationSubCategories ?? [],
        applicationNumberSequences: apiCat?.applicationNumberSequences ?? [],
      });
    }
  };

  return (
    <div className={classes.sectionAccordion}>
      <GenericPanel
        config={CATEG_TABLE_CONFIG.applicationCategory}
        data={rows}
        onSave={handleSave}
        customColumns={applicationCategoryColumns as any}
        variant='plain'
        defaultExpanded={false}
      />
    </div>
  );
};

export { ApplicationCategoriesSection };
