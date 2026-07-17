import { useCallback, useEffect, useRef, useState } from 'react';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { Dialog, DialogContent, IconButton, InputAdornment } from '@mui/material';
import { darken } from '@mui/material/styles';
import {
  DEFAULT_CONFIGURATION_DATA,
  IConfigUserWorkLocation,
  IConfigFieldConfiguration,
} from '@serviceops/interfaces';
import { Box, Button, Divider, TextField, Tooltip, Typography } from '@serviceops/component';
import { GenericAccordion } from '@serviceops/genericaccordion';
import { GenericPanel, type GenericPanelHandle } from '@serviceops/genericpanel';
import { GenericToolbar } from '@serviceops/generictoolbar';
import { useNotification } from '@serviceops/hooks';
import { useStyles } from '../UserManagementSection/styles';
import {
  FieldConfigurationsSection,
  FIELD_CONFIG_TABLE,
} from '../UserManagementSection/components';
import type { IConfigField } from '../UserManagementSection/components/FieldConfigurations/FieldConfigurationsSection.types';
import {
  useGetConfigurationQuery,
  useUpdateConfigurationSectionMutation,
} from '@serviceops/services';
import { WORK_LOCATIONS_TABLE, workLocationColumns } from './shared/workLocations.config';

const ACCENT = '#0369a1';

type SubView = 'workingTimes';

// Header content (icon/title/subtitle/accent) for the sub-view dialog,
// matching the gradient banner used by every Configuration form dialog
// (see ConfigFormDialog in @serviceops/configdialogs / HolidayCalendarsSection
// / FieldConfigurationsAccordion). Reuses the same TableConfig already
// driving the sub-view's own form fields, so the dialog header and the data
// table underneath always agree.
const VIEW_DIALOG_CONFIG: Record<
  SubView,
  { title: string; subtitle?: string; accent: string; icon: React.ReactNode }
> = {
  workingTimes: FIELD_CONFIG_TABLE,
};

const VIEW_BUTTONS: { key: SubView; label: string; icon: React.ReactNode }[] = [
  {
    key: 'workingTimes',
    label: 'Working times',
    icon: <AccessTimeIcon sx={{ fontSize: '1rem' }} />,
  },
];

const WorkLocationsAccordion = () => {
  const { classes } = useStyles();
  const { success, error: showError } = useNotification();
  const [activeDialog, setActiveDialog] = useState<SubView | null>(null);

  const [rows, setRows] = useState<IConfigUserWorkLocation[]>([]);
  const [fieldConfigurations, setFieldConfigurations] = useState<IConfigField[]>([]);
  const [selectedWorkLocationId, setSelectedWorkLocationId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const workLocationsRef = useRef<GenericPanelHandle>(null);

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

  // The "Working times" sub-view button only makes sense in the context of a
  // selected Work Location row, so it stays hidden until a row is selected —
  // mirroring the Holiday Calendar toolbar's Bank Holidays button and
  // FieldConfigurationsAccordion's sub-view buttons. If the selection is
  // cleared while the dialog is open, close it so the user isn't left on a
  // dialog whose trigger button just disappeared.
  useEffect(() => {
    if (!selectedWorkLocationId && activeDialog !== null) {
      setActiveDialog(null);
    }
  }, [selectedWorkLocationId, activeDialog]);

  const handleSave = useCallback(
    async (next: unknown[]) => {
      const newRows = next as IConfigUserWorkLocation[];
      setRows(newRows);
      const current = configData?.data?.userManagement ?? DEFAULT_CONFIGURATION_DATA.userManagement;
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
      const current = configData?.data?.userManagement ?? DEFAULT_CONFIGURATION_DATA.userManagement;
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
        const next = fieldConfigurations.map((row) => (row.id === id ? { ...row, ...data } : row));
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

  // Search box in the custom toolbar (GenericPanel's own is hidden via
  // hideToolbar since New/Edit/Delete/Clear are driven externally) — matches
  // HolidayCalendarsSection/FieldConfigurationsAccordion's "search across
  // every visible field" behavior.
  const filteredRows = search
    ? rows.filter((row) =>
        Object.values(row).some(
          (val) =>
            val !== null &&
            val !== undefined &&
            String(val).toLowerCase().includes(search.toLowerCase()),
        ),
      )
    : rows;

  return (
    <GenericAccordion
      title='Work Locations'
      subtitle='Manage work locations, addresses and their calendar/locale assignments'
      icon={<LocationOnIcon sx={{ fontSize: '1rem', color: '#fff' }} />}
      accent={ACCENT}
      className={classes.sectionAccordion}
      defaultExpanded={false}
    >
      <GenericToolbar className={classes.actionToolbar}>
        <Box className={classes.toolbarButtons}>
          {!selectedWorkLocationId && (
            <Tooltip title='Create new work location'>
              <Button
                size='small'
                variant='contained'
                startIcon={<AddIcon />}
                onClick={() => workLocationsRef.current?.openNew()}
                sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
              >
                Add New Work Location
              </Button>
            </Tooltip>
          )}

          {selectedWorkLocationId && (
            <Tooltip title='Edit selected work location'>
              <Button
                size='small'
                variant='outlined'
                startIcon={<EditIcon />}
                onClick={() => workLocationsRef.current?.openEdit()}
                sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
              >
                Edit
              </Button>
            </Tooltip>
          )}

          {selectedWorkLocationId && (
            <Tooltip title='Delete selected work location'>
              <Button
                size='small'
                variant='outlined'
                color='error'
                startIcon={<DeleteIcon />}
                onClick={() => workLocationsRef.current?.openDelete()}
                sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
              >
                Delete
              </Button>
            </Tooltip>
          )}

          {selectedWorkLocationId && <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />}

          {selectedWorkLocationId &&
            VIEW_BUTTONS.map((btn) => (
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

          {selectedWorkLocationId && <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />}

          {selectedWorkLocationId && (
            <Tooltip title='Clear selection'>
              <Button
                size='small'
                variant='outlined'
                startIcon={<ClearIcon />}
                onClick={() => setSelectedWorkLocationId(null)}
                sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
              >
                Clear
              </Button>
            </Tooltip>
          )}

          {!selectedWorkLocationId && (
            <Box sx={{ ml: 'auto', flexShrink: 0 }}>
              <TextField
                placeholder='Search...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={classes.toolbarSearchField}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>
          )}
        </Box>
      </GenericToolbar>

      <GenericPanel
        ref={workLocationsRef}
        config={WORK_LOCATIONS_TABLE}
        data={filteredRows as unknown as Record<string, unknown>[]}
        onSave={handleSave}
        customColumns={workLocationColumns as unknown as never}
        variant='standard'
        enableSuccessMessage
        hideHeader
        hideToolbar
        selectedRowId={selectedWorkLocationId}
        onRowSelect={setSelectedWorkLocationId}
      />

      {/* Working times opens as a dialog over the Work Locations table
          (matching the Holiday Calendar/FieldConfigurationsAccordion sub-view
          dialogs) instead of swapping the inline accordion body. */}
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
                      <Typography
                        sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', mt: 0.3 }}
                      >
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
          {activeDialog === 'workingTimes' && (
            <FieldConfigurationsSection
              data={fieldConfigurations}
              isLoading={isLoading}
              onDataChange={handleFieldConfigurationsDataChange}
              onCreate={handleFieldConfigurationsCreate}
              onUpdate={handleFieldConfigurationsUpdate}
              onDelete={handleFieldConfigurationsDelete}
            />
          )}
        </DialogContent>
      </Dialog>
    </GenericAccordion>
  );
};

export { WorkLocationsAccordion };
