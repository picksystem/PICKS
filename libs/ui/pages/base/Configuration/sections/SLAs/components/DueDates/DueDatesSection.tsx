import { useStyles } from '../../styles';
import { GenericPanel } from '@serviceops/genericpanel';
import {
  DUE_DATES_CONFIG,
  ticketTypeChipCell,
  activationCell,
  priorityCell,
} from '../shared/SLAsPanelConfig';
import type { IConfigResponseAckSLARow, ITicketType } from '@serviceops/interfaces';

interface DueDatesSectionProps {
  displayRows: IConfigResponseAckSLARow[];
  activeTicketTypes: ITicketType[];
  onDataChange: (rows: IConfigResponseAckSLARow[]) => void;
}

const DueDatesSection = ({
  displayRows,
  activeTicketTypes,
  onDataChange,
}: DueDatesSectionProps) => {
  const { classes } = useStyles();

  // Create a read-only config for the panel (no New button)
  const readonlyConfig = {
    ...DUE_DATES_CONFIG,
    title: 'Due Dates',
    subtitle: 'Control due date visibility and alerting on tickets',
  };

  const columns = [
    {
      id: 'ticketTypeName',
      label: 'SLAs',
      minWidth: 140,
      format: (_v: unknown, row: { ticketTypeId: number; ticketTypeName: string }) =>
        ticketTypeChipCell(row, activeTicketTypes),
    },
    {
      id: 'activation',
      label: 'Activation',
      minWidth: 90,
      align: 'center' as const,
      format: (_v: unknown, row: { ticketTypeId: number; activation: boolean }) =>
        activationCell(row, (ticketTypeId: number, value: boolean) => {
          onDataChange(
            displayRows.map((r) =>
              r.ticketTypeId === ticketTypeId ? { ...r, activation: value } : r,
            ),
          );
        }),
    },
    { id: 'p1', label: 'P1', minWidth: 55, format: priorityCell },
    { id: 'p2', label: 'P2', minWidth: 55, format: priorityCell },
    { id: 'p3', label: 'P3', minWidth: 55, format: priorityCell },
    { id: 'p4', label: 'P4', minWidth: 55, format: priorityCell },
    { id: 'p5', label: 'P5', minWidth: 55, format: priorityCell },
  ];

  return (
    <div className={classes.sectionAccordion}>
      <GenericPanel
        config={readonlyConfig}
        data={displayRows}
        onSave={onDataChange}
        customColumns={columns as any}
        variant='plain'
        defaultExpanded={false}
      />
    </div>
  );
};

export { DueDatesSection };
