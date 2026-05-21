import React from 'react';
import { Box } from '@serviceops/component';
import { useStyles } from '../../styles';
import ReasonCodeTable from './components/ReasonCodeTable';
import { useConfiguration } from '../../hooks/useConfiguration';
import { ReasonCodeItem, ReasonCodeTableConfig } from './ReasonCodes.types';
import { REASON_CODE_TABLES } from './ReasonCodes.config';

const ReasonCodes: React.FC = () => {
  const { classes } = useStyles();
  const { reasonCodes, saveSection } = useConfiguration();

  const handleSave = (dataKey: ReasonCodeTableConfig['dataKey']) => (data: ReasonCodeItem[]) => {
    const currentCodes = reasonCodes || {
      priorityChangeReasonCodes: [],
      roleChangeReasonCodes: [],
      resolutionCodes: [],
      cancellationReasonCodes: [],
      reopenReasonCodes: [],
      conversionReasonCodes: [],
    };

    saveSection('reasonCodes', {
      ...currentCodes,
      [dataKey]: data,
    });
  };

  return (
    <Box className={classes.container}>
      {REASON_CODE_TABLES.map((config) => (
        <ReasonCodeTable
          key={config.id}
          config={config}
          rows={(reasonCodes?.[config.dataKey] as ReasonCodeItem[]) || []}
          onSave={handleSave(config.dataKey)}
        />
      ))}
    </Box>
  );
};

export default ReasonCodes;
