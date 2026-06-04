import { useState, useEffect } from 'react';
import { IConfigApplicationNumberSequence } from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import { useConfiguration } from '@serviceops/confighooks';
import { useSharedTicketTypes } from '../../../../hooks/useSharedTicketTypes';
import { GenericPanel } from '@serviceops/genericpanel';
import {
  CATEG_TABLE_CONFIG,
  applicationNumberSequenceColumns,
} from '../shared/CategorizationPanelConfig';
import { ApplicationNumberSequencesSectionProps } from './ApplicationNumberSequencesSection.types';

const ApplicationNumberSequencesSection = ({
  data,
  onDataChange,
}: ApplicationNumberSequencesSectionProps) => {
  const { classes } = useStyles();
  const { categorization: apiCat, saveSection } = useConfiguration();
  const { ticketTypes } = useSharedTicketTypes();

  const [rows, setRows] = useState<IConfigApplicationNumberSequence[]>([]);

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (apiCat?.applicationNumberSequences) {
      setRows(apiCat.applicationNumberSequences);
    }
  }, [data, apiCat]);

  const handleSave = (next: IConfigApplicationNumberSequence[]) => {
    // Transform rows to ensure ticketTypeName is set correctly
    const transformedRows = next.map((row) => {
      if (row.ticketTypeId && !row.ticketTypeName) {
        const tt = ticketTypes?.find(
          (t: { id: string | number }) => String(t.id) === String(row.ticketTypeId),
        );
        return {
          ...row,
          ticketTypeName: tt?.displayName || tt?.name || String(row.ticketTypeId),
        };
      }
      return row;
    });

    setRows(transformedRows);
    if (onDataChange) {
      onDataChange(transformedRows);
    } else {
      saveSection('categorization', {
        businessCategories: apiCat?.businessCategories ?? [],
        serviceLines: apiCat?.serviceLines ?? [],
        applications: apiCat?.applications ?? [],
        queues: apiCat?.queues ?? [],
        applicationCategories: apiCat?.applicationCategories ?? [],
        applicationSubCategories: apiCat?.applicationSubCategories ?? [],
        applicationNumberSequences: transformedRows,
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
