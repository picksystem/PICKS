import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button } from '@serviceops/component';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import UpdateIcon from '@mui/icons-material/Update';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import GroupIcon from '@mui/icons-material/Group';
import {
  IConfigConsultantProfile,
  IConfigAssociatedUserProfile,
  IConfigConsultantWorkingTime,
  IConfigConsultantWorkingShift,
  IConfigConsultantTimesheetProject,
  IConfigConsultantExpenseProject,
  IConfigConsultantRole,
  IConfigAssociatedConsultantProfile,
} from '@serviceops/interfaces';
import { useStyles } from './styles';
import { useConfiguration } from '../../hooks/useConfiguration';
import { ConfigurationSection } from '@serviceops/pages/base/Configuration/shared/ConfigurationSection/ConfigurationSection';
import {
  ConsultantProfilesSection,
  UserProfilesPanel,
  WorkingTimesPanel,
  WorkingShiftsPanel,
  TimesheetProjectsPanel,
  ExpenseProjectsPanel,
  ConsultantRolesSection,
} from './components';

const ACCENT_CP = '#0369a1';
const ACCENT_CR = '#0369a1';

type ActivePanel =
  | 'none'
  | 'userProfile'
  | 'workingTimes'
  | 'workingShift'
  | 'timesheet'
  | 'expense';

const ConsultantProfiles = () => {
  const { classes } = useStyles();
  const { consultantProfiles: api, categorization: apiCat, saveSection } = useConfiguration();
  const applications = apiCat?.applications ?? [];

  const [profiles, setProfiles] = useState<IConfigConsultantProfile[]>([]);
  const [assocUsers, setAssocUsers] = useState<IConfigAssociatedUserProfile[]>([]);
  const [wTimes, setWTimes] = useState<IConfigConsultantWorkingTime[]>([]);
  const [wShifts, setWShifts] = useState<IConfigConsultantWorkingShift[]>([]);
  const [tsProjects, setTsProjects] = useState<IConfigConsultantTimesheetProject[]>([]);
  const [exProjects, setExProjects] = useState<IConfigConsultantExpenseProject[]>([]);
  const [consultantRoles, setConsultantRoles] = useState<IConfigConsultantRole[]>([]);
  const [assocConsProfiles, setAssocConsProfiles] = useState<IConfigAssociatedConsultantProfile[]>(
    [],
  );

  useEffect(() => {
    if (api) {
      setProfiles(api.profiles ?? []);
      setAssocUsers(api.associatedUserProfiles ?? []);
      setWTimes(api.workingTimes ?? []);
      setWShifts(api.workingShifts ?? []);
      setTsProjects(api.timesheetProjects ?? []);
      setExProjects(api.expenseProjects ?? []);
      setConsultantRoles(api.consultantRoles ?? []);
      setAssocConsProfiles(api.associatedConsultantProfiles ?? []);
    }
  }, [api]);

  const saveAll = (overrides: {
    profiles?: IConfigConsultantProfile[];
    associatedUserProfiles?: IConfigAssociatedUserProfile[];
    workingTimes?: IConfigConsultantWorkingTime[];
    workingShifts?: IConfigConsultantWorkingShift[];
    timesheetProjects?: IConfigConsultantTimesheetProject[];
    expenseProjects?: IConfigConsultantExpenseProject[];
    consultantRoles?: IConfigConsultantRole[];
    associatedConsultantProfiles?: IConfigAssociatedConsultantProfile[];
  }) => {
    saveSection('consultantProfiles', {
      profiles: overrides.profiles ?? profiles,
      associatedUserProfiles: overrides.associatedUserProfiles ?? assocUsers,
      workingTimes: overrides.workingTimes ?? wTimes,
      workingShifts: overrides.workingShifts ?? wShifts,
      timesheetProjects: overrides.timesheetProjects ?? tsProjects,
      expenseProjects: overrides.expenseProjects ?? exProjects,
      consultantRoles: overrides.consultantRoles ?? consultantRoles,
      associatedConsultantProfiles: overrides.associatedConsultantProfiles ?? assocConsProfiles,
    });
  };

  const [activePanel, setActivePanel] = useState<ActivePanel>('none');
  const [crSubPanel, setCrSubPanel] = useState<'roles' | 'assocProfiles'>('roles');
  const panelActive = activePanel !== 'none';
  const togglePanel = (p: ActivePanel) => setActivePanel((prev) => (prev === p ? 'none' : p));

  return (
    <Box className={classes.container}>
      <ConfigurationSection loaderMessage='Loading Consultant Profiles Configuration...'>
        <Accordion defaultExpanded className={classes.sectionAccordion} elevation={0}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: '#2d5ebb' }} />}
            sx={{ pr: 2 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1.5,
                  bgcolor: ACCENT_CP,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <BusinessCenterIcon sx={{ color: '#fff', fontSize: '1rem' }} />
              </Box>
              <Box>
                <Typography className={classes.sectionTitle}>Consultant Profiles</Typography>
                <Typography className={classes.sectionSubtitle}>
                  Manage consultant profiles, roles, and calendar assignments
                </Typography>
              </Box>
            </Box>
          </AccordionSummary>

          <AccordionDetails sx={{ p: 2 }}>
            <Paper variant='outlined' className={classes.actionToolbar}>
              <Box className={classes.toolbarButtons} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                <Button
                  size='small'
                  startIcon={<BusinessCenterIcon />}
                  variant={!panelActive ? 'contained' : 'outlined'}
                  onClick={() => setActivePanel('none')}
                  sx={{
                    textTransform: 'none',
                    bgcolor: !panelActive ? '#2d5ebb' : undefined,
                    color: !panelActive ? '#fff' : '#2d5ebb',
                  }}
                >
                  Consultant Profiles
                </Button>

                <Button
                  size='small'
                  startIcon={<PersonIcon />}
                  variant={activePanel === 'userProfile' ? 'contained' : 'outlined'}
                  onClick={() => togglePanel('userProfile')}
                  sx={{
                    textTransform: 'none',
                    bgcolor: activePanel === 'userProfile' ? '#2d5ebb' : undefined,
                    color: activePanel === 'userProfile' ? '#fff' : '#2d5ebb',
                  }}
                >
                  User Profiles
                </Button>

                <Button
                  size='small'
                  startIcon={<AccessTimeIcon />}
                  variant={activePanel === 'workingTimes' ? 'contained' : 'outlined'}
                  onClick={() => togglePanel('workingTimes')}
                  sx={{
                    textTransform: 'none',
                    bgcolor: activePanel === 'workingTimes' ? '#2d5ebb' : undefined,
                    color: activePanel === 'workingTimes' ? '#fff' : '#2d5ebb',
                  }}
                >
                  Working Times
                </Button>

                <Button
                  size='small'
                  startIcon={<UpdateIcon />}
                  variant={activePanel === 'workingShift' ? 'contained' : 'outlined'}
                  onClick={() => togglePanel('workingShift')}
                  sx={{
                    textTransform: 'none',
                    bgcolor: activePanel === 'workingShift' ? '#2d5ebb' : undefined,
                    color: activePanel === 'workingShift' ? '#fff' : '#2d5ebb',
                  }}
                >
                  Working Shifts
                </Button>

                <Button
                  size='small'
                  startIcon={<ReceiptLongIcon />}
                  variant={activePanel === 'timesheet' ? 'contained' : 'outlined'}
                  onClick={() => togglePanel('timesheet')}
                  sx={{
                    textTransform: 'none',
                    bgcolor: activePanel === 'timesheet' ? '#2d5ebb' : undefined,
                    color: activePanel === 'timesheet' ? '#fff' : '#2d5ebb',
                  }}
                >
                  Timesheet Projects
                </Button>

                <Button
                  size='small'
                  startIcon={<AttachMoneyIcon />}
                  variant={activePanel === 'expense' ? 'contained' : 'outlined'}
                  onClick={() => togglePanel('expense')}
                  sx={{
                    textTransform: 'none',
                    bgcolor: activePanel === 'expense' ? '#2d5ebb' : undefined,
                    color: activePanel === 'expense' ? '#fff' : '#2d5ebb',
                  }}
                >
                  Expense Projects
                </Button>
              </Box>
            </Paper>

            {!panelActive && (
              <ConsultantProfilesSection
                profiles={profiles}
                onProfilesChange={(next) => saveAll({ profiles: next })}
              />
            )}

            {activePanel === 'userProfile' && (
              <UserProfilesPanel
                data={assocUsers}
                onSave={(next) => {
                  setAssocUsers(next);
                  saveAll({ associatedUserProfiles: next });
                }}
              />
            )}
            {activePanel === 'workingTimes' && (
              <WorkingTimesPanel
                data={wTimes}
                onSave={(next) => {
                  setWTimes(next);
                  saveAll({ workingTimes: next });
                }}
              />
            )}
            {activePanel === 'workingShift' && (
              <WorkingShiftsPanel
                data={wShifts}
                onSave={(next) => {
                  setWShifts(next);
                  saveAll({ workingShifts: next });
                }}
              />
            )}
            {activePanel === 'timesheet' && (
              <TimesheetProjectsPanel
                data={tsProjects}
                onSave={(next) => {
                  setTsProjects(next);
                  saveAll({ timesheetProjects: next });
                }}
              />
            )}
            {activePanel === 'expense' && (
              <ExpenseProjectsPanel
                data={exProjects}
                onSave={(next) => {
                  setExProjects(next);
                  saveAll({ expenseProjects: next });
                }}
              />
            )}
          </AccordionDetails>
        </Accordion>

        <Accordion className={classes.sectionAccordion} elevation={0}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: '#2d5ebb' }} />}
            sx={{ pr: 2 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1.5,
                  bgcolor: ACCENT_CR,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <ManageAccountsIcon sx={{ color: '#fff', fontSize: '1rem' }} />
              </Box>
              <Box>
                <Typography className={classes.sectionTitle}>Define Consultant Roles</Typography>
                <Typography className={classes.sectionSubtitle}>
                  Define roles available for consultant assignments
                </Typography>
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 2 }}>
            <Paper variant='outlined' className={classes.actionToolbar}>
              <Box className={classes.toolbarButtons}>
                <Button
                  size='small'
                  startIcon={<ManageAccountsIcon />}
                  variant={crSubPanel === 'roles' ? 'contained' : 'outlined'}
                  onClick={() => setCrSubPanel('roles')}
                  sx={{
                    textTransform: 'none',
                    bgcolor: crSubPanel === 'roles' ? '#2d5ebb' : undefined,
                    color: crSubPanel === 'roles' ? '#fff' : '#2d5ebb',
                  }}
                >
                  Consultant Roles
                </Button>

                <Button
                  size='small'
                  startIcon={<GroupIcon />}
                  variant={crSubPanel === 'assocProfiles' ? 'contained' : 'outlined'}
                  onClick={() => setCrSubPanel('assocProfiles')}
                  sx={{
                    textTransform: 'none',
                    bgcolor: crSubPanel === 'assocProfiles' ? '#2d5ebb' : undefined,
                    color: crSubPanel === 'assocProfiles' ? '#fff' : '#2d5ebb',
                  }}
                >
                  Associated Consultant Profiles
                </Button>
              </Box>
            </Paper>

            <ConsultantRolesSection
              roles={consultantRoles}
              assocConsProfiles={assocConsProfiles}
              applications={applications}
              onSaveRoles={(next) => {
                setConsultantRoles(next);
                saveAll({ consultantRoles: next });
              }}
              onSaveAssocConsProfiles={(next) => {
                setAssocConsProfiles(next);
                saveAll({ associatedConsultantProfiles: next });
              }}
              activeSubPanel={crSubPanel}
              onSubPanelChange={setCrSubPanel}
            />
          </AccordionDetails>
        </Accordion>
      </ConfigurationSection>
    </Box>
  );
};

export default ConsultantProfiles;
