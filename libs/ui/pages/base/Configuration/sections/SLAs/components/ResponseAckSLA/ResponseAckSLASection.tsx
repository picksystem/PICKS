import { useStyles } from '../../styles';
import { GenericPanel } from '@serviceops/genericpanel';
import {
  RESPONSE_ACK_SLA_CONFIG,
  ticketTypeChipCell,
  activationCell,
  priorityCell,
} from '../shared/SLAsPanelConfig';
import type { IConfigResponseAckSLARow, ITicketType } from '@serviceops/interfaces';

interface ResponseAckSLASectionProps {
  displayRows: IConfigResponseAckSLARow[];
  activeTicketTypes: ITicketType[];
  onDataChange: (rows: IConfigResponseAckSLARow[]) => void;
}

const ResponseAckSLASection = ({
  displayRows,
  activeTicketTypes,
  onDataChange,
}: ResponseAckSLASectionProps) => {
  const { classes } = useStyles();

  // Create a read-only config for the panel (no New button)
  const readonlyConfig = {
    ...RESPONSE_ACK_SLA_CONFIG,
    title: 'Response / Acknowledgement SLA (in minutes)',
    subtitle: 'Configure response time targets and breach alerting for initial acknowledgement',
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
        enableNewButton={false}
      />
    </div>
  );
};

export { ResponseAckSLASection };
