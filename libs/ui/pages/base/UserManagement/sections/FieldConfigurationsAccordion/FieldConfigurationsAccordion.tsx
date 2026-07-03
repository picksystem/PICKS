import { useEffect, useState, useCallback } from 'react';
import EditNoteIcon from '@mui/icons-material/EditNote';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventNoteIcon from '@mui/icons-material/EventNote';
import UpdateIcon from '@mui/icons-material/Update';
import { GenericAccordion } from '@serviceops/genericaccordion';
import { useNotification } from '@serviceops/hooks';
import { FieldConfigurationsSection } from '../UserManagementSection/components';
import {
  WorkingTimesSection,
  TimesheetPeriodsSection,
  UpdateTimesheetPeriodsSection,
} from '../UserManagementSection/components/FieldConfigurations';
import type { IConfigField } from '../UserManagementSection/components/FieldConfigurations/FieldConfigurationsSection.types';
import { IConfigFieldConfiguration, DEFAULT_CONFIGURATION_DATA } from '@serviceops/interfaces';
import {
  useGetConfigurationQuery,
  useUpdateConfigurationSectionMutation,
} from '@serviceops/services';
import { GenericToolbar } from '@serviceops/generictoolbar';

const ACCENT = '#0369a1';

type ActiveView =
  | 'fieldConfigurations'
  | 'workingTimes'
  | 'timesheetPeriods'
  | 'updateTimesheetPeriods';

const VIEW_CONFIG: Record<ActiveView, { label: string; icon: React.ReactNode }> = {
  fieldConfigurations: {
    label: 'Working Times',
    icon: <AccessTimeIcon sx={{ fontSize: '1rem' }} />,
  },
  workingTimes: {
    label: 'Compose Working Times',
    icon: <EditNoteIcon sx={{ fontSize: '1rem' }} />,
  },
  timesheetPeriods: {
    label: 'Timesheet periods',
    icon: <EventNoteIcon sx={{ fontSize: '1rem' }} />,
  },
  updateTimesheetPeriods: {
    label: 'Update timesheet periods',
    icon: <UpdateIcon sx={{ fontSize: '1rem' }} />,
  },
};

const FieldConfigurationsAccordion = () => {
  const { success, error: showError } = useNotification();
  const [fieldConfigurations, setFieldConfigurations] = useState<IConfigField[]>([]);
  const [activeView, setActiveView] = useState<ActiveView>('fieldConfigurations');

  const { data: configData, isLoading } = useGetConfigurationQuery();
  const [updateSection] = useUpdateConfigurationSectionMutation();

  const apiFieldConfigurations = configData?.data?.userManagement?.workingTimes?.workingTimes;

  useEffect(() => {
    if (apiFieldConfigurations !== undefined) {
      setFieldConfigurations(apiFieldConfigurations as IConfigField[]);
    }
  }, [apiFieldConfigurations]);

  const persist = useCallback(
    (next: IConfigField[]) => {
      const current = configData?.data?.userManagement ?? DEFAULT_CONFIGURATION_DATA.userManagement;
      return updateSection({
        section: 'userManagement',
        value: {
          ...current,
          workingTimes: {
            ...current.workingTimes,
            workingTimes: next as IConfigFieldConfiguration[],
          },
        },
      }).unwrap();
    },
    [configData, updateSection],
  );

  const handleDataChange = useCallback(async (next: IConfigField[]) => {
    setFieldConfigurations(next);
  }, []);

  const handleCreate = useCallback(
    async (data: Omit<IConfigField, 'id'>) => {
      try {
        const next = [...fieldConfigurations, { ...data, id: `${Date.now()}` }];
        setFieldConfigurations(next);
        await persist(next);
        success('Field Configuration created successfully');
      } catch {
        showError('Failed to create Field Configuration');
      }
    },
    [fieldConfigurations, persist, success, showError],
  );

  const handleUpdate = useCallback(
    async (id: number | string, data: Partial<IConfigField>) => {
      try {
        const next = fieldConfigurations.map((row) => (row.id === id ? { ...row, ...data } : row));
        setFieldConfigurations(next);
        await persist(next);
        success('Field Configuration updated successfully');
      } catch {
        showError('Failed to update Field Configuration');
      }
    },
    [fieldConfigurations, persist, success, showError],
  );

  const handleDelete = useCallback(
    async (id: number | string) => {
      try {
        const next = fieldConfigurations.filter((row) => row.id !== id);
        setFieldConfigurations(next);
        await persist(next);
        success('Field Configuration deleted successfully');
      } catch {
        showError('Failed to delete Field Configuration');
      }
    },
    [fieldConfigurations, persist, success, showError],
  );

  const views: ActiveView[] = [
    'fieldConfigurations',
    'workingTimes',
    'timesheetPeriods',
    'updateTimesheetPeriods',
  ];

  return (
    <GenericAccordion
      title='Working Times'
      subtitle='Manage working time fields, composed schedules, and timesheet periods'
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
      {activeView === 'timesheetPeriods' && <TimesheetPeriodsSection />}
      {activeView === 'updateTimesheetPeriods' && <UpdateTimesheetPeriodsSection />}
    </GenericAccordion>
  );
};

export { FieldConfigurationsAccordion };
