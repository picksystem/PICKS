import { Box } from '@serviceops/component';
import { AdminControlsSection } from './components/AdminControls/AdminControlsSection';
import { ApprovedEstimatesSection } from './components/ApprovedEstimates/ApprovedEstimatesSection';
import { useStyles } from './styles';
import { useConfiguration } from '../../hooks/useConfiguration';
import { ConfigurationSection } from '@serviceops/pages/base/Configuration/shared/ConfigurationSection/ConfigurationSection';
import { useState, useEffect, useCallback } from 'react';
import { IConfigGeneral, IConfigApprovedEstimateRow } from '@serviceops/interfaces';
import { useDebounce } from '@serviceops/hooks';
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
  const { data: ticketTypes } = useGetTicketTypeQuery();

  const [form, setForm] = useState<IConfigGeneral>(DEFAULT_GENERAL);

  // Debounced form state to prevent excessive API calls
  const debouncedForm = useDebounce(form, 300);

  useEffect(() => {
    if (apiGeneral) setForm({ ...DEFAULT_GENERAL, ...apiGeneral });
  }, [apiGeneral]);

  const update = useCallback(<K extends keyof IConfigGeneral>(key: K, value: IConfigGeneral[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Only save other fields via debounce (not approvedEstimateRows which is saved immediately)
  useEffect(() => {
    // This debounced effect can be used for other general fields if needed
  }, [debouncedForm]);

  const handleDataChange = useCallback(
    (rows: IConfigApprovedEstimateRow[]) => {
      // Transform rows to ensure ticketTypeName is set correctly
      const transformedRows = rows.map((row) => {
        // If ticketTypeId is present but ticketTypeName is not, look it up
        if (row.ticketTypeId && !row.ticketTypeName) {
          const tt = ticketTypes?.find((t) => t.type === String(row.ticketTypeId));
          return {
            ...row,
            ticketTypeName: tt?.displayName || tt?.name || String(row.ticketTypeId),
          };
        }
        return row;
      });

      // Update local form state
      setForm((prev) => {
        const newForm = { ...prev, approvedEstimateRows: transformedRows };
        // Save to API immediately
        saveSection('general', newForm);
        return newForm;
      });
    },
    [ticketTypes, saveSection],
  );

  const displayRows: IConfigApprovedEstimateRow[] = form.approvedEstimateRows ?? [];

  return (
    <Box className={classes.container}>
      <ConfigurationSection loaderMessage='Loading Admin Control Configuration...'>
        <AdminControlsSection form={form} update={update} />
        <ApprovedEstimatesSection displayRows={displayRows} onDataChange={handleDataChange} />
      </ConfigurationSection>
    </Box>
  );
};

export default General;
