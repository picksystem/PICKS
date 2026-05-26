import { useStyles } from '../../styles';
import { GenericPanel } from '@serviceops/pages/base/Configuration/shared/GenericPanel/GenericPanel';
import {
  TIME_LOGS_ACTIVATION_CONFIG,
  ticketTypeChipCell,
  activationCell,
} from '../shared/SLAsPanelConfig';
import type { IConfigActivationRow, ITicketType } from '@serviceops/interfaces';

interface TimeLogsActivationSectionProps {
  displayRows: IConfigActivationRow[];
  activeTicketTypes: ITicketType[];
  onDataChange: (rows: IConfigActivationRow[]) => void;
}

const TimeLogsActivationSection = ({
  displayRows,
  activeTicketTypes,
  onDataChange,
}: TimeLogsActivationSectionProps) => {
  const { classes } = useStyles();

  const columns = [
    {
      id: 'ticketTypeName',
      label: 'Ticket Type',
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
  ];

  return (
    <div className={classes.sectionAccordion}>
      <GenericPanel
        config={TIME_LOGS_ACTIVATION_CONFIG}
        data={displayRows}
        onSave={onDataChange}
        customColumns={columns as any}
        variant='plain'
        defaultExpanded={false}
      />
    </div>
  );
};

export { TimeLogsActivationSection };
