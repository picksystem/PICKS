import { useStyles } from '../../styles';
import { GenericPanel } from '@serviceops/pages/base/Configuration/shared/GenericPanel/GenericPanel';
import {
  RESOLUTION_SLA_CONFIG,
  ticketTypeChipCell,
  activationCell,
  priorityCell,
} from '../shared/SLAsPanelConfig';
import type { IConfigResponseAckSLARow, ITicketType } from '@serviceops/interfaces';

interface ResolutionSLASectionProps {
  displayRows: IConfigResponseAckSLARow[];
  activeTicketTypes: ITicketType[];
  onDataChange: (rows: IConfigResponseAckSLARow[]) => void;
}

const ResolutionSLASection = ({
  displayRows,
  activeTicketTypes,
  onDataChange,
}: ResolutionSLASectionProps) => {
  const { classes } = useStyles();

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
        config={RESOLUTION_SLA_CONFIG}
        data={displayRows}
        onSave={onDataChange}
        customColumns={columns as any}
        variant='plain'
        defaultExpanded={false}
      />
    </div>
  );
};

export { ResolutionSLASection };
