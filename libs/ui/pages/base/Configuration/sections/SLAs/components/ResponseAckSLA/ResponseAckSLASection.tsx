import { useCallback } from 'react';
import { useStyles } from '../../styles';
import { GenericPanel } from '@serviceops/genericpanel';
import { RESPONSE_ACK_SLA_CONFIG, responseAckSLAColumns } from '../shared/SLAsPanelConfig';
import { validateSlaRowDuplicate } from '../shared/textUtils';
import type { IConfigResponseAckSLARow } from '@serviceops/interfaces';

interface ResponseAckSLASectionProps {
  displayRows: IConfigResponseAckSLARow[];
  onDataChange: (rows: IConfigResponseAckSLARow[]) => void;
}

const ResponseAckSLASection = ({ displayRows, onDataChange }: ResponseAckSLASectionProps) => {
  const { classes } = useStyles();

  // Per the spec for the Response / Acknowledgement SLA section:
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
        config={RESPONSE_ACK_SLA_CONFIG}
        data={displayRows as unknown as Record<string, unknown>[]}
        onSave={onDataChange as unknown as (data: unknown[]) => void}
        customColumns={responseAckSLAColumns() as unknown as never}
        variant='plain'
        defaultExpanded={false}
        summaryValidator={summaryValidator as unknown as never}
      />
    </div>
  );
};

export { ResponseAckSLASection };
