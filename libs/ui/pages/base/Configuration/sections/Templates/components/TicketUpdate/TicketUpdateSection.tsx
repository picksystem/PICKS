import { useState, useEffect } from 'react';
import { IConfigTicketUpdateTemplate } from '@serviceops/interfaces';
import { useConfiguration } from '@serviceops/confighooks';
import { GenericPanel } from '@serviceops/genericpanel';
import { useStyles } from '../../styles';
import { TICKET_UPDATE_CONFIG, ticketUpdateColumns } from '../shared/TemplatesPanelConfig';

interface TicketUpdateSectionProps {
  data?: IConfigTicketUpdateTemplate[];
  onDataChange?: (data: IConfigTicketUpdateTemplate[]) => void;
}

const TicketUpdateSection = ({ data, onDataChange }: TicketUpdateSectionProps) => {
  const { classes } = useStyles();
  const { ticketUpdateTemplates, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigTicketUpdateTemplate[]>([]);

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (ticketUpdateTemplates?.items) {
      setRows(ticketUpdateTemplates.items);
    }
  }, [data, ticketUpdateTemplates]);

  const handleSave = (next: IConfigTicketUpdateTemplate[]) => {
    setRows(next);
    if (onDataChange) {
      onDataChange(next);
    } else {
      saveSection('ticketUpdateTemplates', { items: next });
    }
  };

  return (
    <div className={classes.sectionAccordion}>
      <GenericPanel
        config={TICKET_UPDATE_CONFIG}
        data={rows}
        onSave={handleSave}
        customColumns={ticketUpdateColumns as any}
        variant='plain'
      />
    </div>
  );
};

export { TicketUpdateSection };
