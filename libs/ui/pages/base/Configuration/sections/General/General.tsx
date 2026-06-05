import { Box } from '@serviceops/component';
import { AdminControlsSection } from './components/AdminControls/AdminControlsSection';
import { ApprovedEstimatesSection } from './components/ApprovedEstimates/ApprovedEstimatesSection';
import { useStyles } from './styles';
import { useConfiguration } from '../../hooks/useConfiguration';
import { ConfigurationSection } from '@serviceops/configsection';
import { useState, useEffect, useCallback } from 'react';
import { IConfigGeneral, IConfigApprovedEstimateRow } from '@serviceops/interfaces';
import { useSharedTicketTypes } from '../../hooks/useSharedTicketTypes';

const DEFAULT_GENERAL: IConfigGeneral = {
  system: {
    systemName: '',
    systemDescription: '',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    language: 'en',
  },
  generalAdminControls: {
    activateDefaultApprovedHours: false,
    timeEntriesEnabled: false,
    changeDisplayName: {
      approved_estimates: false,
      estimated_hours: true,
    },
  },
  defaultApprovedEstimates: {
    rows: [],
  },
};

const General = () => {
  const { classes } = useStyles();
  const { general: apiGeneral, saveSection } = useConfiguration();
  const { ticketTypes } = useSharedTicketTypes();

  const [form, setForm] = useState<IConfigGeneral>(DEFAULT_GENERAL);

  useEffect(() => {
    if (apiGeneral) setForm({ ...DEFAULT_GENERAL, ...apiGeneral });
  }, [apiGeneral]);

  const update = useCallback(
    <K extends keyof IConfigGeneral>(key: K, value: IConfigGeneral[K]) => {
      setForm((prev) => {
        const next = { ...prev, [key]: value };
        saveSection('general', next);
        return next;
      });
    },
    [saveSection],
  );

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
        const newForm = { ...prev, defaultApprovedEstimates: { rows: transformedRows } };
        // Save to API immediately
        saveSection('general', newForm);
        return newForm;
      });
    },
    [ticketTypes, saveSection],
  );

  const displayRows: IConfigApprovedEstimateRow[] = form.defaultApprovedEstimates?.rows ?? [];

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
