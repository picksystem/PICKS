import { Box } from '@serviceops/component';
import { AdminControlsSection } from './components/AdminControls/AdminControlsSection';
import { ApprovedEstimatesSection } from './components/ApprovedEstimates/ApprovedEstimatesSection';
import { useStyles } from './styles';
import { useConfiguration } from '../../hooks/useConfiguration';
import { ConfigurationSection } from '@serviceops/pages/base/Configuration/shared/ConfigurationSection/ConfigurationSection';
import { useState, useEffect } from 'react';
import { IConfigGeneral, IConfigApprovedEstimateRow, ITicketType } from '@serviceops/interfaces';
import { useGetTicketTypeQuery } from '@serviceops/services';

const DEFAULT_GENERAL: IConfigGeneral = {
  systemName: '',
  systemDescription: '',
  timezone: 'UTC',
  dateFormat: 'MM/DD/YYYY',
  language: 'en',
  timeEntriesEnabled: false,
  activateDefaultApprovedHours: false,
  timeEntriesDisplayName: 'estimated_hours',
  approvedEstimateRows: [],
};

const General = () => {
  const { classes } = useStyles();
  const { general: apiGeneral, saveSection } = useConfiguration();
  const { data: ticketTypesData } = useGetTicketTypeQuery();

  const activeTicketTypes: ITicketType[] =
    ticketTypesData && ticketTypesData.length > 0 ? ticketTypesData.filter((t) => t.isActive) : [];

  const [form, setForm] = useState<IConfigGeneral>(DEFAULT_GENERAL);

  useEffect(() => {
    if (apiGeneral) setForm({ ...DEFAULT_GENERAL, ...apiGeneral });
  }, [apiGeneral]);

  const update = <K extends keyof IConfigGeneral>(key: K, value: IConfigGeneral[K]) => {
    const next = { ...form, [key]: value };
    setForm(next);
    saveSection('general', next);
  };

  const handleDataChange = (rows: IConfigApprovedEstimateRow[]) => {
    const next = { ...form, approvedEstimateRows: rows };
    setForm(next);
    saveSection('general', next);
  };

  const displayRows: IConfigApprovedEstimateRow[] = form.approvedEstimateRows ?? [];

  return (
    <Box className={classes.container}>
      <ConfigurationSection loaderMessage='Loading Admin Control Configuration...'>
        <AdminControlsSection form={form} update={update} />
        <ApprovedEstimatesSection
          displayRows={displayRows}
          activeTicketTypes={activeTicketTypes}
          onDataChange={handleDataChange}
        />
      </ConfigurationSection>
    </Box>
  );
};

export default General;
