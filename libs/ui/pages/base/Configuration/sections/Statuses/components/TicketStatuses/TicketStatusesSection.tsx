import { useState, useEffect } from 'react';
import { IConfigStatusLevel } from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import { useConfiguration } from '@serviceops/confighooks';
import { GenericPanel } from '@serviceops/genericpanel';
import { TICKET_STATUSES_CONFIG, ticketStatusColumns } from '../../Statuses.config';

interface TicketStatusesSectionProps {
  activeTicketTypeColumns: Array<{ key: string; label: string }>;
}

const TicketStatusesSection = ({ activeTicketTypeColumns }: TicketStatusesSectionProps) => {
  const { classes } = useStyles();
  const { statuses: apiStatuses, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigStatusLevel[]>([]);

  useEffect(() => {
    if (!apiStatuses) return;
    if (apiStatuses.items && apiStatuses.items.length > 0) {
      setRows(apiStatuses.items as IConfigStatusLevel[]);
    }
  }, [apiStatuses]);

  const handleSave = (next: IConfigStatusLevel[]) => {
    setRows(next);
    saveSection('statuses', { items: next });
  };

  return (
    <div className={classes.sectionAccordion}>
      <GenericPanel
        config={TICKET_STATUSES_CONFIG}
        data={rows}
        onSave={handleSave}
        customColumns={ticketStatusColumns(activeTicketTypeColumns) as any}
        variant='plain'
        enableSuccessMessage
      />
    </div>
  );
};

export { TicketStatusesSection };
