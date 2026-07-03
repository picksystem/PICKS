import { useState, useEffect, useCallback } from 'react';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import {
  DEFAULT_CONFIGURATION_DATA,
  IConfigUserWorkLocation,
  IConfigFieldConfiguration,
} from '@serviceops/interfaces';
import { GenericAccordion } from '@serviceops/genericaccordion';
import { GenericPanel } from '@serviceops/genericpanel';
import { GenericToolbar } from '@serviceops/generictoolbar';
import { useNotification } from '@serviceops/hooks';
import { FieldConfigurationsSection } from '../UserManagementSection/components';
import type { IConfigField } from '../UserManagementSection/components/FieldConfigurations/FieldConfigurationsSection.types';
import {
  useGetConfigurationQuery,
  useUpdateConfigurationSectionMutation,
} from '@serviceops/services';
import { WORK_LOCATIONS_TABLE, workLocationColumns } from './shared/workLocations.config';

const ACCENT = '#0369a1';

type ActiveView = 'workLocations' | 'workingTimes';

const VIEW_CONFIG: Record<ActiveView, { label: string; icon: React.ReactNode }> = {
  workLocations: {
    label: 'Work Locations',
    icon: <LocationOnIcon sx={{ fontSize: '1rem' }} />,
  },
  workingTimes: {
    label: 'Working times',
    icon: <AccessTimeIcon sx={{ fontSize: '1rem' }} />,
  },
};

const WorkLocationsAccordion = () => {
  const { success, error: showError } = useNotification();
  const [activeView, setActiveView] = useState<ActiveView>('workLocations');

  const [rows, setRows] = useState<IConfigUserWorkLocation[]>([]);
  const [fieldConfigurations, setFieldConfigurations] = useState<IConfigField[]>([]);

  const { data: configData, isLoading } = useGetConfigurationQuery();
  const [updateSection] = useUpdateConfigurationSectionMutation();

  const apiWorkLocations = configData?.data?.userManagement?.workLocations?.workLocations;
  const apiFieldConfigurations = configData?.data?.userManagement?.workLocations?.workingTimes;

  useEffect(() => {
    if (apiWorkLocations !== undefined) {
      setRows(apiWorkLocations);
    }
  }, [apiWorkLocations]);

  useEffect(() => {
    if (apiFieldConfigurations !== undefined) {
      setFieldConfigurations(apiFieldConfigurations as IConfigField[]);
    }
  }, [apiFieldConfigurations]);

  const handleSave = useCallback(
    async (next: unknown[]) => {
      const newRows = next as IConfigUserWorkLocation[];
      setRows(newRows);
      const current =
        configData?.data?.userManagement ?? DEFAULT_CONFIGURATION_DATA.userManagement;
      await updateSection({
        section: 'userManagement',
        value: {
          ...current,
          workLocations: { ...current.workLocations, workLocations: newRows },
        },
      }).unwrap();
    },
    [configData, updateSection],
  );

  const persistFieldConfigurations = useCallback(
    (next: IConfigField[]) => {
      const current =
        configData?.data?.userManagement ?? DEFAULT_CONFIGURATION_DATA.userManagement;
      return updateSection({
        section: 'userManagement',
        value: {
          ...current,
          workLocations: {
            ...current.workLocations,
            workingTimes: next as IConfigFieldConfiguration[],
          },
        },
      }).unwrap();
    },
    [configData, updateSection],
  );

  const handleFieldConfigurationsDataChange = useCallback(async (next: IConfigField[]) => {
    setFieldConfigurations(next);
  }, []);

  const handleFieldConfigurationsCreate = useCallback(
    async (data: Omit<IConfigField, 'id'>) => {
      try {
        const next = [...fieldConfigurations, { ...data, id: `${Date.now()}` }];
        setFieldConfigurations(next);
        await persistFieldConfigurations(next);
        success('Working time created successfully');
      } catch {
        showError('Failed to create working time');
      }
    },
    [fieldConfigurations, persistFieldConfigurations, success, showError],
  );

  const handleFieldConfigurationsUpdate = useCallback(
    async (id: number | string, data: Partial<IConfigField>) => {
      try {
        const next = fieldConfigurations.map((row) =>
          row.id === id ? { ...row, ...data } : row,
        );
        setFieldConfigurations(next);
        await persistFieldConfigurations(next);
        success('Working time updated successfully');
      } catch {
        showError('Failed to update working time');
      }
    },
    [fieldConfigurations, persistFieldConfigurations, success, showError],
  );

  const handleFieldConfigurationsDelete = useCallback(
    async (id: number | string) => {
      try {
        const next = fieldConfigurations.filter((row) => row.id !== id);
        setFieldConfigurations(next);
        await persistFieldConfigurations(next);
        success('Working time deleted successfully');
      } catch {
        showError('Failed to delete working time');
      }
    },
    [fieldConfigurations, persistFieldConfigurations, success, showError],
  );

  const views: ActiveView[] = ['workLocations', 'workingTimes'];

  return (
    <GenericAccordion
      title='Work Locations'
      subtitle='Manage work locations, addresses and their calendar/locale assignments'
      icon={<LocationOnIcon sx={{ fontSize: '1rem', color: '#fff' }} />}
      accent={ACCENT}
      defaultExpanded={false}
    >
      <GenericToolbar
        buttons={views.map((key) => ({
          key,
          label: VIEW_CONFIG[key].label,
          icon: VIEW_CONFIG[key].icon,
          isActive: activeView === key,
          onClick: () => setActiveView(key),
        }))}
      />

      {activeView === 'workLocations' && (
        <GenericPanel
          config={WORK_LOCATIONS_TABLE}
          data={rows as unknown as Record<string, unknown>[]}
          onSave={handleSave}
          customColumns={workLocationColumns as unknown as never}
          variant='standard'
          enableSuccessMessage
        />
      )}
      {activeView === 'workingTimes' && (
        <FieldConfigurationsSection
          data={fieldConfigurations}
          isLoading={isLoading}
          onDataChange={handleFieldConfigurationsDataChange}
          onCreate={handleFieldConfigurationsCreate}
          onUpdate={handleFieldConfigurationsUpdate}
          onDelete={handleFieldConfigurationsDelete}
        />
      )}
    </GenericAccordion>
  );
};

export { WorkLocationsAccordion };
