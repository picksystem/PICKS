import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { IConfigTicketUpdateTemplate } from '@serviceops/interfaces';
import { useConfiguration } from '../../hooks/useConfiguration';
import { useStyles } from '../../styles';
import TemplateTable from './components/TemplateTable';
import { TEMPLATE_TABLES } from './Templates.config';
import { TemplateItem } from './Templates.types';
import { ConfigurationSection } from '@serviceops/pages/base/Configuration/shared/ConfigurationSection/ConfigurationSection';

const Templates: React.FC = () => {
  const { classes } = useStyles();
  const {
    ticketUpdateTemplates: tutApi,
    commentTemplates: ctApi,
    internalNoteTemplates: intApi,
    statuses,
    saveSection,
  } = useConfiguration();
  const statusItems = statuses?.items ?? [];

  const [ticketUpdateRows, setTicketUpdateRows] = useState<IConfigTicketUpdateTemplate[]>([]);
  const [commentRows, setCommentRows] = useState<IConfigTicketUpdateTemplate[]>([]);
  const [internalNoteRows, setInternalNoteRows] = useState<IConfigTicketUpdateTemplate[]>([]);

  useEffect(() => {
    if (tutApi) setTicketUpdateRows(tutApi.items ?? []);
  }, [tutApi]);
  useEffect(() => {
    if (ctApi) setCommentRows(ctApi.items ?? []);
  }, [ctApi]);
  useEffect(() => {
    if (intApi) setInternalNoteRows(intApi.items ?? []);
  }, [intApi]);

  const handleSaveTicketUpdate = (data: TemplateItem[]) => {
    const typedData = data as IConfigTicketUpdateTemplate[];
    setTicketUpdateRows(typedData);
    saveSection('ticketUpdateTemplates', { items: typedData });
  };

  const handleSaveComment = (data: TemplateItem[]) => {
    const typedData = data as IConfigTicketUpdateTemplate[];
    setCommentRows(typedData);
    saveSection('commentTemplates', { items: typedData });
  };

  const handleSaveInternalNote = (data: TemplateItem[]) => {
    const typedData = data as IConfigTicketUpdateTemplate[];
    setInternalNoteRows(typedData);
    saveSection('internalNoteTemplates', { items: typedData });
  };

  const getSaveHandler = (configId: string) => {
    if (configId === 'ticketUpdate') return handleSaveTicketUpdate;
    if (configId === 'comment') return handleSaveComment;
    return handleSaveInternalNote;
  };

  return (
    <Box className={classes.container}>
      <ConfigurationSection loaderMessage='Loading Templates Configuration...'>
        {TEMPLATE_TABLES.map((config) => (
          <TemplateTable
            key={config.id}
            config={config}
            rows={
              config.id === 'ticketUpdate'
                ? ticketUpdateRows
                : config.id === 'comment'
                  ? commentRows
                  : internalNoteRows
            }
            onSave={getSaveHandler(config.id)}
            statusItems={statusItems}
          />
        ))}
      </ConfigurationSection>
    </Box>
  );
};

export default Templates;
