import { Box } from '@serviceops/component';
import { AdminControlsSection } from './components/AdminControls/AdminControlsSection';
import { ApprovedEstimatesSection } from './components/ApprovedEstimates/ApprovedEstimatesSection';
import { useStyles } from './styles';
import { useConfiguration } from '../../hooks/useConfiguration';
import { ConfigurationSection } from '@serviceops/pages/base/Configuration/shared/ConfigurationSection/ConfigurationSection';
import { useState, useEffect } from 'react';
import { IConfigGeneral, IConfigApprovedEstimateRow } from '@serviceops/interfaces';

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

  const [form, setForm] = useState<IConfigGeneral>(DEFAULT_GENERAL);

  useEffect(() => {
    if (apiGeneral) setForm({ ...DEFAULT_GENERAL, ...apiGeneral });
  }, [apiGeneral]);

  const update = <K extends keyof IConfigGeneral>(key: K, value: IConfigGeneral[K]) => {
    const next = { ...form, [key]: value };
    setForm(next);
    saveSection('general', next);
  };

  const saveRows = (rows: IConfigApprovedEstimateRow[]) => {
    const next = { ...form, approvedEstimateRows: rows };
    setForm(next);
    saveSection('general', next);
  };

  return (
    <Box className={classes.container}>
      <ConfigurationSection loaderMessage='Loading Admin Control Configuration...'>
        <AdminControlsSection form={form} update={update} />
        <ApprovedEstimatesSection form={form} saveRows={saveRows} />
      </ConfigurationSection>
    </Box>
  );
};

export default General;
