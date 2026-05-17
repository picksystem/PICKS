import { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Accordion, Paper } from '@serviceops/component';
import { AccordionSummary, AccordionDetails } from '@mui/material';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import PersonIcon from '@mui/icons-material/Person';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import {
  IConfigApprovalRecord,
  IConfigApprovalAssocUserProfile,
  IConfigApprovalConsultantRole,
  IConfigApprovalWorkingTime,
} from '@serviceops/interfaces';

import { useConfiguration } from '../../hooks/useConfiguration';
import { ConfigFormDialog, ConfigDeleteDialog } from '../../dialogs/ConfigDialogs/ConfigDialogs';

import { useStyles } from './styles';
import ConfigPanel, { TableConfigs } from './components/SharedComponents';
import { colorPalette } from './styles/Approvals.styles.shared';

// ── Types ─────────────────────────────────────────────
type ActivePanel = 'approvalRecords' | 'userProfile' | 'consultantRoles' | 'workingTimes';

const EMPTY_RECORD = {
  consultant: '',
  application: '',
  consultantRole: '',
  slaWorkingTimeCalendar: '',
  slaExceptionGroup: '',
  leadConsultant: '',
  manager: '',
};

// ── Component ─────────────────────────────────────────
const Approvals = () => {
  const { classes } = useStyles();
  const { approvals: api, saveSection } = useConfiguration();
  const [activePanel, setActivePanel] = useState<ActivePanel>('approvalRecords');
  const [records, setRecords] = useState<IConfigApprovalRecord[]>([]);
  const [assocUsers, setAssocUsers] = useState<IConfigApprovalAssocUserProfile[]>([]);
  const [consultantRoles, setConsultantRoles] = useState<IConfigApprovalConsultantRole[]>([]);
  const [workingTimes, setWorkingTimes] = useState<IConfigApprovalWorkingTime[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<IConfigApprovalRecord | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_RECORD);
  const selectedRecord = records.find((r) => r.id === selectedId) ?? null;

  // ── Load API ────────────────────────────────────────
  useEffect(() => {
    if (!api) return;

    setRecords(api.records ?? []);
    setAssocUsers(api.assocUserProfiles ?? []);
    setConsultantRoles(api.consultantRoles ?? []);
    setWorkingTimes(api.workingTimes ?? []);
  }, [api]);

  // ── Save ────────────────────────────────────────────
  const saveAll = (overrides: any = {}) => {
    saveSection('approvals', {
      records: overrides.records ?? records,
      assocUserProfiles: overrides.assocUsers ?? assocUsers,
      consultantRoles: overrides.consultantRoles ?? consultantRoles,
      workingTimes: overrides.workingTimes ?? workingTimes,
    });
  };

  // ── Submit ──────────────────────────────────────────
  const handleSubmit = () => {
    if (!form.consultant.trim()) return;
    let next: IConfigApprovalRecord[];
    if (editingRecord) {
      next = records.map((r) => (r.id === editingRecord.id ? { ...editingRecord, ...form } : r));
      setSelectedId(editingRecord.id);
    } else {
      const newRecord: IConfigApprovalRecord = {
        id: `ar_${Date.now()}`,
        ...form,
      };
      next = [...records, newRecord];
      setSelectedId(newRecord.id);
    }

    setRecords(next);
    saveAll({ records: next });
    setEditOpen(false);
    setEditingRecord(null);
  };

  // ── Delete ──────────────────────────────────────────
  const handleDelete = () => {
    if (!selectedRecord) return;
    const next = records.filter((r) => r.id !== selectedRecord.id);
    setRecords(next);
    saveAll({ records: next });
    setSelectedId(null);
    setDeleteOpen(false);
  };

  // ── PANEL CONFIG ────────────────────────────────────
  const PANELS = [
    {
      key: 'approvalRecords',
      label: 'Approval Records',
      color: colorPalette.main,
    },
    {
      key: 'userProfile',
      label: 'Associated User Profiles',
      color: colorPalette.aup,
    },
    {
      key: 'consultantRoles',
      label: 'Consultant Roles',
      color: colorPalette.cr,
    },
    {
      key: 'workingTimes',
      label: 'Working Times',
      color: colorPalette.wt,
    },
  ] as const;

  const renderPanel = () => {
    switch (activePanel) {
      case 'approvalRecords':
        return (
          <ConfigPanel<IConfigApprovalRecord>
            config={{
              accent: colorPalette.main,
              icon: <HowToRegIcon sx={{ color: '#020d3140', fontSize: '1rem' }} />,
              title: 'Approval Records',
              tableName: 'approvalRecords',
            }}
            data={records}
            selectedId={selectedId}
            onSelectId={setSelectedId}
            onSave={() => {}}
            fields={TableConfigs.approvalRecords.fields}
            deleteEntityName={TableConfigs.approvalRecords.deleteEntityName}
            deleteItemNameField={
              TableConfigs.approvalRecords.deleteItemNameField as keyof IConfigApprovalRecord
            }
          />
        );

      case 'userProfile':
        return (
          <ConfigPanel<IConfigApprovalAssocUserProfile>
            config={{
              accent: colorPalette.aup,
              icon: <PersonIcon sx={{ color: colorPalette.aup, fontSize: '1rem' }} />,
              title: 'Associated User Profiles',
              tableName: 'assocUserProfiles',
            }}
            data={assocUsers}
            selectedId={undefined}
            onSelectId={() => {}}
            onSave={(next) => {
              setAssocUsers(next);
              saveAll({ assocUsers: next });
            }}
            fields={TableConfigs.assocUserProfiles.fields}
            deleteEntityName={TableConfigs.assocUserProfiles.deleteEntityName}
            deleteItemNameField={TableConfigs.assocUserProfiles.deleteItemNameField as any}
          />
        );

      case 'consultantRoles':
        return (
          <ConfigPanel<IConfigApprovalConsultantRole>
            config={{
              accent: colorPalette.cr,
              icon: <ManageAccountsIcon sx={{ color: colorPalette.cr, fontSize: '1rem' }} />,
              title: 'Consultant Roles',
              tableName: 'consultantRoles',
            }}
            data={consultantRoles}
            selectedId={undefined}
            onSelectId={() => {}}
            onSave={(next) => {
              setConsultantRoles(next);
              saveAll({ consultantRoles: next });
            }}
            fields={TableConfigs.consultantRoles.fields}
            deleteEntityName={TableConfigs.consultantRoles.deleteEntityName}
            deleteItemNameField={TableConfigs.consultantRoles.deleteItemNameField as any}
          />
        );

      case 'workingTimes':
        return (
          <ConfigPanel<IConfigApprovalWorkingTime>
            config={{
              accent: colorPalette.wt,
              icon: <AccessTimeIcon sx={{ color: colorPalette.wt, fontSize: '1rem' }} />,
              title: 'Working Times',
              tableName: 'workingTimes',
            }}
            data={workingTimes}
            selectedId={undefined}
            onSelectId={() => {}}
            onSave={(next) => {
              setWorkingTimes(next);
              saveAll({ workingTimes: next });
            }}
            fields={TableConfigs.workingTimes.fields}
            deleteEntityName={TableConfigs.workingTimes.deleteEntityName}
            deleteItemNameField={TableConfigs.workingTimes.deleteItemNameField as any}
          />
        );
    }
  };

  // ── UI ──────────────────────────────────────────────
  return (
    <Box className={classes.container}>
      <Accordion
        elevation={0}
        title='Approvals'
        description='Configure approval workflows, roles, and working schedules'
        icon={<HowToRegIcon />}
        defaultExpanded
      >
        <AccordionDetails>
          <Box className={classes.toolbarButtons} mb={2}>
            {PANELS.map((p) => {
              const isActive = activePanel === p.key;

              return (
                <Button
                  key={p.key}
                  onClick={() => setActivePanel(p.key)}
                  sx={{
                    fontSize: '13px',
                    bgcolor: isActive ? p.color : 'transparent',
                    color: isActive ? '#fff' : p.color,
                  }}
                >
                  {p.label}
                </Button>
              );
            })}
          </Box>

          {renderPanel()}
        </AccordionDetails>
      </Accordion>

      {/* Dialogs remain unchanged */}
      <ConfigFormDialog
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditingRecord(null);
        }}
        onSubmit={handleSubmit}
        isEdit={!!editingRecord}
        icon={<HowToRegIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={colorPalette.main}
        title={editingRecord ? 'Edit Approval Record' : 'New Approval Record'}
        subtitle='Configure consultant, application, and SLA settings'
        submitDisabled={!form.consultant.trim()}
        submitLabel={editingRecord ? 'Save Changes' : 'Add'}
        maxWidth='sm'
      >
        <TextField
          label='Consultant'
          size='small'
          fullWidth
          value={form.consultant}
          onChange={(e) => setForm((p) => ({ ...p, consultant: e.target.value }))}
        />
      </ConfigFormDialog>

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Approval Record'
        itemName={selectedRecord?.consultant ?? ''}
      />
    </Box>
  );
};

export default Approvals;
