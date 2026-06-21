import { useCallback } from 'react';
import { useStyles } from '../../styles';
import { Typography } from '@serviceops/component';
import { GenericPanel } from '@serviceops/genericpanel';
import { mkActiveChip } from '@serviceops/pages/base/Configuration/utils/cellRenderers';
import { RESOLUTION_SLA_CONFIG, ticketTypeChipCell, priorityCell } from '../shared/SLAsPanelConfig';
import { stripRichText, validateSlaRowDuplicate } from '../shared/textUtils';
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

  // Create a read-only config for the panel (no New button)
  const readonlyConfig = {
    ...RESOLUTION_SLA_CONFIG,
    title: 'Resolution SLAs (HH:MM)',
    subtitle: 'Track resolution time targets per ticket type and priority level',
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
      id: 'isActive',
      label: 'Activation',
      minWidth: 110,
      align: 'center' as const,
      format: (_v: unknown, row: IConfigResponseAckSLARow) =>
        mkActiveChip(row.activation ?? row.isActive),
    },
    {
      id: 'shortDescription',
      label: 'Short Description',
      minWidth: 180,
      format: (_v: unknown, row: IConfigResponseAckSLARow) => (
        <Typography sx={{ fontSize: '0.78rem', color: 'text.primary' }}>
          {row.shortDescription ? stripRichText(row.shortDescription) : '—'}
        </Typography>
      ),
    },
    {
      id: 'internalNote',
      label: 'Internal note',
      minWidth: 180,
      format: (_v: unknown, row: IConfigResponseAckSLARow) => (
        <Typography sx={{ fontSize: '0.78rem', color: 'text.primary' }}>
          {row.internalNote ? stripRichText(row.internalNote) : '—'}
        </Typography>
      ),
    },
    { id: 'p1', label: 'P1', minWidth: 70, format: priorityCell },
    { id: 'p2', label: 'P2', minWidth: 70, format: priorityCell },
    { id: 'p3', label: 'P3', minWidth: 70, format: priorityCell },
    { id: 'p4', label: 'P4', minWidth: 70, format: priorityCell },
    { id: 'p5', label: 'P5', minWidth: 70, format: priorityCell },
  ];

  // Per the spec for the Resolution SLA section:
  //   - SLAs (ticket type):  Not allowed
  //   - Activation:          N/A
  //   - Short Description:   Not allowed
  //   - Internal note:       Allowed  — skip
  //   - P1, P2, etc:         Allowed  — skip
  //
  // The Alert is the only signal — no per-field red borders for duplicates.
  // See validateSlaRowDuplicate in ../shared/textUtils for the rule details.
  const summaryValidator = useCallback(
    (form: Record<string, unknown>, _all: unknown[], editingRow: Record<string, unknown> | null) =>
      validateSlaRowDuplicate(
        form,
        displayRows as unknown as Parameters<typeof validateSlaRowDuplicate>[1],
        (editingRow?.id as string | null) ?? null,
      ),
    [displayRows],
  );

  return (
    <div className={classes.sectionAccordion}>
      <GenericPanel
        config={readonlyConfig}
        data={displayRows}
        onSave={onDataChange}
        customColumns={columns as any}
        variant='plain'
        defaultExpanded={false}
        summaryValidator={summaryValidator as unknown as never}
      />
    </div>
  );
};

export { ResolutionSLASection };
