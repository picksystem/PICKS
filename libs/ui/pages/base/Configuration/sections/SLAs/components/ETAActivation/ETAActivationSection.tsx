import { useCallback } from 'react';
import { useStyles } from '../../styles';
import { Typography } from '@serviceops/component';
import { GenericPanel } from '@serviceops/genericpanel';
import { mkActiveChip } from '@serviceops/pages/base/Configuration/utils/cellRenderers';
import { ETA_ACTIVATION_CONFIG, ticketTypeChipCell } from '../shared/SLAsPanelConfig';
import { stripRichText, validateActivationRowDuplicate } from '../shared/textUtils';
import type { IConfigActivationRow, ITicketType } from '@serviceops/interfaces';

interface ETAActivationSectionProps {
  displayRows: IConfigActivationRow[];
  activeTicketTypes: ITicketType[];
  onDataChange: (rows: IConfigActivationRow[]) => void;
}

const ETAActivationSection = ({
  displayRows,
  activeTicketTypes,
  onDataChange,
}: ETAActivationSectionProps) => {
  const { classes } = useStyles();

  // Create a read-only config for the panel (no New button)
  const readonlyConfig = {
    ...ETA_ACTIVATION_CONFIG,
    title: 'ETA Activation',
    subtitle: 'Control ETA visibility and notification behaviour on tickets',
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
      minWidth: 110,
      align: 'center' as const,
      format: (_v: unknown, row: IConfigActivationRow) => mkActiveChip(row.activation),
    },
    {
      id: 'shortDescription',
      label: 'Short Description',
      minWidth: 180,
      format: (_v: unknown, row: IConfigActivationRow) => (
        <Typography sx={{ fontSize: '0.78rem', color: 'text.primary' }}>
          {row.shortDescription ? stripRichText(row.shortDescription) : '—'}
        </Typography>
      ),
    },
    {
      id: 'internalNote',
      label: 'Internal note',
      minWidth: 180,
      format: (_v: unknown, row: IConfigActivationRow) => (
        <Typography sx={{ fontSize: '0.78rem', color: 'text.primary' }}>
          {row.internalNote ? stripRichText(row.internalNote) : '—'}
        </Typography>
      ),
    },
  ];

  // Per the spec for the ETA Activation section:
  //   - SLAs (ticket type):  Not allowed
  //   - Activation:          N/A
  //   - Short Description:   Not allowed
  //   - Internal note:       Allowed  — skip
  //
  // The Alert is the only signal — no per-field red borders for duplicates.
  // See validateActivationRowDuplicate in ../shared/textUtils for the rule
  // details.
  const summaryValidator = useCallback(
    (form: Record<string, unknown>, _all: unknown[], editingRow: Record<string, unknown> | null) =>
      validateActivationRowDuplicate(
        {
          ticketTypeId: Number(form.ticketTypeId ?? 0),
          shortDescription: String(form.shortDescription ?? ''),
        },
        displayRows as unknown as Parameters<typeof validateActivationRowDuplicate>[1],
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

export { ETAActivationSection };
