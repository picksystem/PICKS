import { Box } from '@serviceops/component';
import { AdminControlsSection } from './components/AdminControls/AdminControlsSection';
import { ApprovedEstimatesSection } from './components/ApprovedEstimates/ApprovedEstimatesSection';
import { useStyles } from './styles';
import { useConfiguration } from '../../hooks/useConfiguration';
import { ConfigurationSection } from '@serviceops/pages/base/Configuration/shared/ConfigurationSection/ConfigurationSection';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { IConfigGeneral, IConfigApprovedEstimateRow, ITicketType } from '@serviceops/interfaces';
import { useGetTicketTypeQuery } from '@serviceops/services';
import { useDebounce } from '@serviceops/hooks';

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

  const activeTicketTypes = useMemo<ITicketType[]>(() => {
    return ticketTypesData && ticketTypesData.length > 0
      ? ticketTypesData.filter((t) => t.isActive)
      : [];
  }, [ticketTypesData]);

  const [form, setForm] = useState<IConfigGeneral>(DEFAULT_GENERAL);

  // Debounced form state to prevent excessive API calls
  const debouncedForm = useDebounce(form, 300);

  useEffect(() => {
    if (apiGeneral) setForm({ ...DEFAULT_GENERAL, ...apiGeneral });
  }, [apiGeneral]);

  const update = useCallback(
    <K extends keyof IConfigGeneral>(key: K, value: IConfigGeneral[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // Only save to API when debounced form changes
  useEffect(() => {
    saveSection('general', debouncedForm);
  }, [debouncedForm, saveSection]);

  const handleDataChange = useCallback((rows: IConfigApprovedEstimateRow[]) => {
    setForm((prev) => ({ ...prev, approvedEstimateRows: rows }));
  }, []);

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
