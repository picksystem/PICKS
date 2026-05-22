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

const Categorization = () => {
  const { classes } = useStyles();
  return (
    <Box className={classes.container}>
      <BusinessCategoriesSection />
      <ServiceLinesSection />
      <ApplicationsSection />
      <ApplicationQueuesSection />
      <ApplicationCategoriesSection />
      <ApplicationSubCategoriesSection />
      <ApplicationNumberSequencesSection />
    </Box>
  );
};

export default Categorization;
