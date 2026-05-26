import React, { useEffect } from 'react';
import { Box, Typography } from '@serviceops/component';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { IConfigConsultantRole, IConfigAssociatedConsultantProfile } from '@serviceops/interfaces';
import { useStyles } from './styles';
import { useConfiguration } from '../../hooks/useConfiguration';
import { ConfigurationSection } from '@serviceops/pages/base/Configuration/shared/ConfigurationSection/ConfigurationSection';
import { ConsultantProfilesSection, ConsultantRolesSection } from './components';

const CP_ACCENT = '#0369a1';

const ConsultantProfiles = () => {
  const { classes } = useStyles();
  const { consultantProfiles: api, saveSection } = useConfiguration();

  const [consultantRoles, setConsultantRoles] = React.useState<IConfigConsultantRole[]>([]);
  const [assocConsProfiles, setAssocConsProfiles] = React.useState<
    IConfigAssociatedConsultantProfile[]
  >([]);

  useEffect(() => {
    if (api) {
      setConsultantRoles(api.consultantRoles ?? []);
      setAssocConsProfiles(api.associatedConsultantProfiles ?? []);
    }
  }, [api]);

  return (
    <Box className={classes.container}>
      <ConfigurationSection loaderMessage='Loading Consultant Profiles Configuration...'>
        <ConsultantProfilesSection
          onProfilesChange={(next) =>
            saveSection('consultantProfiles', {
              profiles: next,
              associatedUserProfiles: api?.associatedUserProfiles ?? [],
              workingTimes: api?.workingTimes ?? [],
              workingShifts: api?.workingShifts ?? [],
              timesheetProjects: api?.timesheetProjects ?? [],
              expenseProjects: api?.expenseProjects ?? [],
              consultantRoles: api?.consultantRoles ?? [],
              associatedConsultantProfiles: api?.associatedConsultantProfiles ?? [],
            })
          }
        />

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
                  bgcolor: CP_ACCENT,
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
            <ConsultantRolesSection
              rolesData={consultantRoles}
              assocProfilesData={assocConsProfiles}
              onRolesChange={(next) => {
                setConsultantRoles(next);
                saveSection('consultantProfiles', {
                  profiles: api?.profiles ?? [],
                  associatedUserProfiles: api?.associatedUserProfiles ?? [],
                  workingTimes: api?.workingTimes ?? [],
                  workingShifts: api?.workingShifts ?? [],
                  timesheetProjects: api?.timesheetProjects ?? [],
                  expenseProjects: api?.expenseProjects ?? [],
                  consultantRoles: next,
                  associatedConsultantProfiles: api?.associatedConsultantProfiles ?? [],
                });
              }}
              onAssocProfilesChange={(next) => {
                setAssocConsProfiles(next);
                saveSection('consultantProfiles', {
                  profiles: api?.profiles ?? [],
                  associatedUserProfiles: api?.associatedUserProfiles ?? [],
                  workingTimes: api?.workingTimes ?? [],
                  workingShifts: api?.workingShifts ?? [],
                  timesheetProjects: api?.timesheetProjects ?? [],
                  expenseProjects: api?.expenseProjects ?? [],
                  consultantRoles: api?.consultantRoles ?? [],
                  associatedConsultantProfiles: next,
                });
              }}
            />
          </AccordionDetails>
        </Accordion>
      </ConfigurationSection>
    </Box>
  );
};

export default ConsultantProfiles;
