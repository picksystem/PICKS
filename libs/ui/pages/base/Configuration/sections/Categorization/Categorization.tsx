import React from 'react';
import { Box } from '@serviceops/component';
import { useStyles } from './styles';
import {
  BusinessCategoriesSection,
  ServiceLinesSection,
  ApplicationsSection,
  ApplicationQueuesSection,
  ApplicationCategoriesSection,
  ApplicationSubCategoriesSection,
  ApplicationNumberSequencesSection,
} from './components';
import { ConfigurationSection } from '@serviceops/pages/base/Configuration/shared/ConfigurationSection';

const Categorization = () => {
  const { classes } = useStyles();
  return (
    <Box className={classes.container}>
      <ConfigurationSection loaderMessage='Loading Categorization Configuration...'>
        <BusinessCategoriesSection />
        <ServiceLinesSection />
        <ApplicationsSection />
        <ApplicationQueuesSection />
        <ApplicationCategoriesSection />
        <ApplicationSubCategoriesSection />
        <ApplicationNumberSequencesSection />
      </ConfigurationSection>
    </Box>
  );
};

export default Categorization;
