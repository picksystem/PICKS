import { useEffect, useState, useCallback } from 'react';
import EditNoteIcon from '@mui/icons-material/EditNote';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { GenericAccordion } from '@serviceops/genericaccordion';
import { useNotification } from '@serviceops/hooks';
import { FieldConfigurationsSection } from '../UserManagementSection/components';
import { WorkingTimesSection } from '../UserManagementSection/components/FieldConfigurations';
import type { IConfigField } from '../UserManagementSection/components/FieldConfigurations/FieldConfigurationsSection.types';
import type {
  ICreateFieldConfigurationInput,
  IUpdateFieldConfigurationInput,
} from '@serviceops/interfaces';
import {
  useCreateFieldConfigurationMutation,
  useDeleteFieldConfigurationMutation,
  useGetFieldConfigurationsQuery,
  useUpdateFieldConfigurationMutation,
} from '@serviceops/services';
import { GenericToolbar } from '@serviceops/generictoolbar';

const ACCENT = '#0369a1';

type ActiveView = 'fieldConfigurations' | 'workingTimes';

const VIEW_CONFIG: Record<ActiveView, { label: string; icon: React.ReactNode }> = {
  fieldConfigurations: {
    label: 'Field Configurations',
    icon: <EditNoteIcon sx={{ fontSize: '1rem' }} />,
  },
  workingTimes: {
    label: 'Working Times',
    icon: <AccessTimeIcon sx={{ fontSize: '1rem' }} />,
  },
};

const FieldConfigurationsAccordion = () => {
  const { success, error: showError } = useNotification();
  const [fieldConfigurations, setFieldConfigurations] = useState<IConfigField[]>([]);
  const [activeView, setActiveView] = useState<ActiveView>('workingTimes');

  const { data: apiFieldConfigurations, isLoading } = useGetFieldConfigurationsQuery();

  const [createFieldConfiguration] = useCreateFieldConfigurationMutation();
  const [updateFieldConfiguration] = useUpdateFieldConfigurationMutation();
  const [deleteFieldConfiguration] = useDeleteFieldConfigurationMutation();

  useEffect(() => {
    if (apiFieldConfigurations !== undefined) {
      setFieldConfigurations(apiFieldConfigurations);
    }
  }, [apiFieldConfigurations]);

  const handleDataChange = useCallback(async (next: IConfigField[]) => {
    setFieldConfigurations(next);
  }, []);

  const handleCreate = useCallback(
    async (data: ICreateFieldConfigurationInput) => {
      try {
        await createFieldConfiguration(data).unwrap();
        success('Field Configuration created successfully');
      } catch {
        showError('Failed to create Field Configuration');
      }
    },
    [createFieldConfiguration, success, showError],
  );

  const handleUpdate = useCallback(
    async (id: number | string, data: IUpdateFieldConfigurationInput) => {
      try {
        await updateFieldConfiguration({ id, data }).unwrap();
        success('Field Configuration updated successfully');
      } catch {
        showError('Failed to update Field Configuration');
      }
    },
    [updateFieldConfiguration, success, showError],
  );

  const handleDelete = useCallback(
    async (id: number | string) => {
      try {
        await deleteFieldConfiguration(id).unwrap();
        success('Field Configuration deleted successfully');
      } catch {
        showError('Failed to delete Field Configuration');
      }
    },
    [deleteFieldConfiguration, success, showError],
  );

  const views: ActiveView[] = ['fieldConfigurations', 'workingTimes'];

  return (
    <GenericAccordion
      title='Field Configurations'
      subtitle='Define field metadata'
      icon={<EditNoteIcon sx={{ fontSize: '1rem', color: '#fff' }} />}
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

      {activeView === 'fieldConfigurations' && (
        <FieldConfigurationsSection
          data={fieldConfigurations}
          isLoading={isLoading}
          onDataChange={handleDataChange}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
      {activeView === 'workingTimes' && <WorkingTimesSection />}
    </GenericAccordion>
  );
};

export { FieldConfigurationsAccordion };
