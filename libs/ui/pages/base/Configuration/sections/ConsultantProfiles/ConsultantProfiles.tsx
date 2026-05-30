import React, { useEffect } from 'react';
import { Box } from '@serviceops/component';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { IConfigConsultantRole, IConfigAssociatedConsultantProfile } from '@serviceops/interfaces';
import { useStyles } from './styles';
import { useConfiguration } from '../../hooks/useConfiguration';
import { ConfigurationSection } from '@serviceops/configsection';
import { GenericAccordion } from '@serviceops/genericaccordion';
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

        <GenericAccordion
          title='Define Consultant Roles'
          subtitle='Define roles available for consultant assignments'
          icon={<ManageAccountsIcon sx={{ fontSize: '1rem', color: '#fff' }} />}
          accent={CP_ACCENT}
          className={classes.sectionAccordion}
        >
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
        </GenericAccordion>
      </ConfigurationSection>
    </Box>
  );
};

export default ConsultantProfiles;
