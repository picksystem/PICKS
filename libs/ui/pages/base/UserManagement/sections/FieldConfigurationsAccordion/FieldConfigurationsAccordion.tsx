import { useCallback, useEffect, useState } from 'react';
import EditNoteIcon from '@mui/icons-material/EditNote';
import EventNoteIcon from '@mui/icons-material/EventNote';
import UpdateIcon from '@mui/icons-material/Update';
import CloseIcon from '@mui/icons-material/Close';
import { Dialog, DialogContent, IconButton } from '@mui/material';
import { darken } from '@mui/material/styles';
import { Box, Button, Tooltip, Typography } from '@serviceops/component';
import { GenericAccordion } from '@serviceops/genericaccordion';
import { GenericToolbar } from '@serviceops/generictoolbar';
import { useNotification } from '@serviceops/hooks';
import { useStyles } from '../UserManagementSection/styles';
import { FieldConfigurationsSection } from '../UserManagementSection/components';
import {
  WorkingTimesSection,
  TimesheetPeriodsSection,
  UpdateTimesheetPeriodsSection,
} from '../UserManagementSection/components/FieldConfigurations';
import {
  COMPOSED_WORKING_TIME_CONFIG,
  TIMESHEET_PERIOD_ENTRY_CONFIG,
  UPDATE_TIMESHEET_PERIOD_ENTRY_CONFIG,
} from '../UserManagementSection/components/FieldConfigurations/shared/userConfig.config';
import type { IConfigField } from '../UserManagementSection/components/FieldConfigurations/FieldConfigurationsSection.types';
import { IConfigFieldConfiguration, DEFAULT_CONFIGURATION_DATA } from '@serviceops/interfaces';
import {
  useGetConfigurationQuery,
  useUpdateConfigurationSectionMutation,
} from '@serviceops/services';

const ACCENT = '#0369a1';

type SubView = 'composedWorkingTimes' | 'timesheetPeriods' | 'updateTimesheetPeriods';

// Header content (icon/title/subtitle/accent) for each sub-view dialog,
// matching the gradient banner used by every Configuration form dialog
// (see ConfigFormDialog in @serviceops/configdialogs / HolidayCalendarsSection).
// Reuses the same TableConfig already driving the sub-view's own GenericPanel,
// so the dialog header and the data table underneath always agree.
const VIEW_DIALOG_CONFIG: Record<
  SubView,
  { title: string; subtitle?: string; accent: string; icon: React.ReactNode }
> = {
  composedWorkingTimes: COMPOSED_WORKING_TIME_CONFIG,
  timesheetPeriods: TIMESHEET_PERIOD_ENTRY_CONFIG,
  updateTimesheetPeriods: UPDATE_TIMESHEET_PERIOD_ENTRY_CONFIG,
};

const VIEW_BUTTONS: { key: SubView; label: string; icon: React.ReactNode }[] = [
  {
    key: 'composedWorkingTimes',
    label: 'Compose Working Times',
    icon: <EditNoteIcon sx={{ fontSize: '1rem' }} />,
  },
  {
    key: 'timesheetPeriods',
    label: 'Timesheet Periods',
    icon: <EventNoteIcon sx={{ fontSize: '1rem' }} />,
  },
  {
    key: 'updateTimesheetPeriods',
    label: 'Update Timesheet Periods',
    icon: <UpdateIcon sx={{ fontSize: '1rem' }} />,
  },
];

const FieldConfigurationsAccordion = () => {
  const { classes } = useStyles();
  const { success, error: showError } = useNotification();
  const [fieldConfigurations, setFieldConfigurations] = useState<IConfigField[]>([]);
  const [activeDialog, setActiveDialog] = useState<SubView | null>(null);

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

  return (
    <GenericAccordion
      title='Working Times'
      subtitle='Manage working time fields, composed schedules, and timesheet periods'
      icon={<EditNoteIcon sx={{ fontSize: '1rem', color: '#fff' }} />}
      accent={ACCENT}
      className={classes.sectionAccordion}
      defaultExpanded={false}
    >
      {/* Compose Working Times/Timesheet Periods/Update Timesheet Periods open
          as a dialog over the Working Times table (matching the Holiday
          Calendar/Working Calendars sections' Bank Holidays/Working Times/etc.
          sub-view dialogs) instead of swapping the inline accordion body. */}
      <GenericToolbar className={classes.actionToolbar}>
        <Box className={classes.toolbarButtons}>
          {VIEW_BUTTONS.map((btn) => (
            <Tooltip key={btn.key} title={btn.label}>
              <Button
                size='small'
                variant={activeDialog === btn.key ? 'contained' : 'outlined'}
                startIcon={btn.icon}
                onClick={() => setActiveDialog(btn.key)}
                sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
              >
                {btn.label}
              </Button>
            </Tooltip>
          ))}
        </Box>
      </GenericToolbar>

      <FieldConfigurationsSection
        data={fieldConfigurations}
        isLoading={isLoading}
        onDataChange={handleDataChange}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />

      <Dialog
        open={activeDialog !== null}
        onClose={() => setActiveDialog(null)}
        maxWidth='xl'
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden', maxHeight: '90vh' } }}
      >
        {activeDialog &&
          (() => {
            const dlgConfig = VIEW_DIALOG_CONFIG[activeDialog];
            return (
              <Box
                sx={{
                  px: 3,
                  py: 2.5,
                  background: `linear-gradient(135deg, ${darken(dlgConfig.accent, 0.18)} 0%, ${dlgConfig.accent} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1.75,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: 1.5,
                      bgcolor: 'rgba(255,255,255,0.18)',
                      border: '1.5px solid rgba(255,255,255,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Box
                      sx={{
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {dlgConfig.icon}
                    </Box>
                  </Box>
                  <Box>
                    <Typography
                      sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff', lineHeight: 1.2 }}
                    >
                      {dlgConfig.title}
                    </Typography>
                    {dlgConfig.subtitle && (
                      <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', mt: 0.3 }}>
                        {dlgConfig.subtitle}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <IconButton onClick={() => setActiveDialog(null)} sx={{ color: '#fff' }}>
                  <CloseIcon />
                </IconButton>
              </Box>
            );
          })()}
        <DialogContent sx={{ p: 2.5, overflowY: 'auto' }}>
          {activeDialog === 'composedWorkingTimes' && <WorkingTimesSection hideHeader />}
          {activeDialog === 'timesheetPeriods' && <TimesheetPeriodsSection hideHeader />}
          {activeDialog === 'updateTimesheetPeriods' && <UpdateTimesheetPeriodsSection hideHeader />}
        </DialogContent>
      </Dialog>
    </GenericAccordion>
  );
};

export { FieldConfigurationsAccordion };
