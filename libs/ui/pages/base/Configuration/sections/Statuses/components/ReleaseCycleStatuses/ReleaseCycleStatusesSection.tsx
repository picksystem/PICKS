import { useState, useEffect } from 'react';
import { IConfigStatusLevel } from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';
import { GenericPanel } from '@serviceops/pages/base/Configuration/shared/GenericPanel/GenericPanel';
import { RELEASE_CYCLE_STATUSES_CONFIG, releaseStatusColumns } from '../../Statuses.config';

interface ReleaseCycleStatusesSectionProps {
  activeTicketTypeColumns: Array<{ key: string; label: string }>;
}

const ReleaseCycleStatusesSection = ({
  activeTicketTypeColumns,
}: ReleaseCycleStatusesSectionProps) => {
  const { classes } = useStyles();
  const { releaseStatuses: apiReleaseStatuses, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigStatusLevel[]>([]);

  useEffect(() => {
    if (!apiReleaseStatuses) return;
    if (apiReleaseStatuses.items && apiReleaseStatuses.items.length > 0) {
      setRows(apiReleaseStatuses.items as IConfigStatusLevel[]);
    }
  }, [apiReleaseStatuses]);

  const handleSave = async (next: IConfigStatusLevel[]) => {
    setRows(next);
    await saveSection('releaseStatuses', { items: next });
  };

  return (
    <div className={classes.sectionAccordion}>
      <GenericPanel
        config={RELEASE_CYCLE_STATUSES_CONFIG}
        data={rows}
        onSave={handleSave}
        customColumns={releaseStatusColumns(activeTicketTypeColumns) as any}
        variant='plain'
        defaultExpanded={false}
        enableSuccessMessage
      />
    </div>
  );
};

export { ReleaseCycleStatusesSection };
