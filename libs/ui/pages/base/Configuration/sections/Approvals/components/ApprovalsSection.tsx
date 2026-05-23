import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button } from '@serviceops/component';
import { Accordion, AccordionSummary, AccordionDetails, alpha } from '@mui/material';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  IConfigApprovalRecord,
  IConfigApprovalAssocUserProfile,
  IConfigApprovalConsultantRole,
  IConfigApprovalWorkingTime,
} from '@serviceops/interfaces';
import { useStyles } from '../styles';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';
import { ActiveView, TABLE_CONFIG, ACCENT_RECORDS } from './shared';
import {
  ApprovalRecordsSection,
  UserProfilesSection,
  ConsultantRolesSection,
  ApprovalWorkingTimesSection,
} from './index';

interface ApprovalsSectionProps {
  records?: IConfigApprovalRecord[];
  assocUserProfiles?: IConfigApprovalAssocUserProfile[];
  consultantRoles?: IConfigApprovalConsultantRole[];
  workingTimes?: IConfigApprovalWorkingTime[];
  onDataChange?: (
    key: string,
    value:
      | IConfigApprovalRecord[]
      | IConfigApprovalAssocUserProfile[]
      | IConfigApprovalConsultantRole[]
      | IConfigApprovalWorkingTime[],
  ) => void;
}

const ApprovalsSection = ({
  records: externalRecords,
  assocUserProfiles: externalAssocUsers,
  consultantRoles: externalConsultantRoles,
  workingTimes: externalWorkingTimes,
  onDataChange,
}: ApprovalsSectionProps) => {
  const { classes } = useStyles();
  const { approvals: api, saveSection } = useConfiguration();

  const [activeView, setActiveView] = useState<ActiveView>('records');
  const [records, setRecords] = useState<IConfigApprovalRecord[]>([]);
  const [assocUsers, setAssocUsers] = useState<IConfigApprovalAssocUserProfile[]>([]);
  const [consultantRoles, setConsultantRoles] = useState<IConfigApprovalConsultantRole[]>([]);
  const [workingTimes, setWorkingTimes] = useState<IConfigApprovalWorkingTime[]>([]);

  useEffect(() => {
    if (externalRecords !== undefined) {
      setRecords(externalRecords);
    } else if (api?.records) {
      setRecords(api.records);
    }
  }, [externalRecords, api]);

  useEffect(() => {
    if (externalAssocUsers !== undefined) {
      setAssocUsers(externalAssocUsers);
    } else if (api?.assocUserProfiles) {
      setAssocUsers(api.assocUserProfiles);
    }
  }, [externalAssocUsers, api]);

  useEffect(() => {
    if (externalConsultantRoles !== undefined) {
      setConsultantRoles(externalConsultantRoles);
    } else if (api?.consultantRoles) {
      setConsultantRoles(api.consultantRoles);
    }
  }, [externalConsultantRoles, api]);

  useEffect(() => {
    if (externalWorkingTimes !== undefined) {
      setWorkingTimes(externalWorkingTimes);
    } else if (api?.workingTimes) {
      setWorkingTimes(api.workingTimes);
    }
  }, [externalWorkingTimes, api]);

  const saveAll = (key: string, value: any) => {
    if (onDataChange) {
      onDataChange(key, value);
    } else {
      saveSection('approvals', {
        records,
        assocUserProfiles: assocUsers,
        consultantRoles,
        workingTimes,
        [key === 'assocUserProfiles' ? 'assocUserProfiles' : key]: value,
      });
    }
  };

  const views: ActiveView[] = ['records', 'userProfile', 'consultantRoles', 'workingTimes'];

  return (
    <Accordion defaultExpanded className={classes.sectionAccordion} elevation={0}>
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#2d5ebb' }} />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: ACCENT_RECORDS,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HowToRegIcon sx={{ color: '#fff', fontSize: '1rem' }} />
          </Box>

          <Box>
            <Typography className={classes.sectionTitle}>Approvals</Typography>

            <Typography className={classes.sectionSubtitle}>
              Configure approval workflows, roles, and working schedules
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 2 }}>
        <Paper variant='outlined' className={classes.actionToolbar}>
          <Box className={classes.toolbarButtons} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {views.map((key) => {
              const config = TABLE_CONFIG[key];
              return (
                <Button
                  key={key}
                  size='small'
                  variant={activeView === key ? 'contained' : 'outlined'}
                  startIcon={config.icon}
                  onClick={() => setActiveView(key)}
                  sx={{
                    textTransform: 'none',
                    bgcolor: activeView === key ? '#2d5ebb' : undefined,
                    color: activeView === key ? '#fff' : '#2d5ebb',
                  }}
                >
                  {config.title}
                </Button>
              );
            })}
          </Box>
        </Paper>

        {activeView === 'records' && (
          <ApprovalRecordsSection
            data={records}
            onDataChange={(next) => {
              setRecords(next);
              saveAll('records', next);
            }}
          />
        )}
        {activeView === 'userProfile' && (
          <UserProfilesSection
            data={assocUsers}
            onDataChange={(next) => {
              setAssocUsers(next);
              saveAll('assocUserProfiles', next);
            }}
          />
        )}
        {activeView === 'consultantRoles' && (
          <ConsultantRolesSection
            data={consultantRoles}
            onDataChange={(next) => {
              setConsultantRoles(next);
              saveAll('consultantRoles', next);
            }}
          />
        )}
        {activeView === 'workingTimes' && (
          <ApprovalWorkingTimesSection
            data={workingTimes}
            onDataChange={(next) => {
              setWorkingTimes(next);
              saveAll('workingTimes', next);
            }}
          />
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export { ApprovalsSection };
