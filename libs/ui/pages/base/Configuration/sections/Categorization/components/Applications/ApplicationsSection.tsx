import { useState, useEffect } from 'react';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import CodeIcon from '@mui/icons-material/Code';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import AppsIcon from '@mui/icons-material/Apps';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import {
  IConfigApplication,
  IConfigServiceLine,
  IConfigServiceLineTicketType,
} from '@serviceops/interfaces';
import { GenericToolbar } from '@serviceops/pages/base/Configuration/shared/GenericToolbar/GenericToolbar';
import { GenericPanel } from '@serviceops/pages/base/Configuration/shared/GenericPanel/GenericPanel';
import {
  AppApprovalsSection,
  AppTimesheetSection,
  AppExpensesSection,
  AppSupportLinesSection,
  AppBillingCodesSection,
  AppTicketTypeSection,
  AppStickyNoteSection,
} from './panels';
import { CATEG_ACCENT, TABLE_CONFIG } from '../shared';
import { ApplicationActiveView } from './ApplicationsSection.types';
import { useStyles } from '../../styles';
import { GenericAccordion } from '@serviceops/pages/base/Configuration/shared/GenericAccordion/GenericAccordion';

export interface ApplicationsSectionProps {
  data?: IConfigApplication[];
  serviceLines?: IConfigServiceLine[];
  onDataChange?: (data: IConfigApplication[]) => void;
}

const VIEW_BUTTONS: { key: ApplicationActiveView; label: string; icon: React.ReactNode }[] = [
  {
    key: 'applications',
    label: 'Applications',
    icon: <AppsIcon sx={{ fontSize: '1rem' }} />,
  },
  {
    key: 'approvals',
    label: 'Application Approvals',
    icon: <HowToRegIcon sx={{ fontSize: '1rem' }} />,
  },
  {
    key: 'timesheet',
    label: 'Add Timesheet Projects',
    icon: <AccessTimeIcon sx={{ fontSize: '1rem' }} />,
  },
  {
    key: 'expenses',
    label: 'Add Expenses Projects',
    icon: <ReceiptLongIcon sx={{ fontSize: '1rem' }} />,
  },
  {
    key: 'supportLines',
    label: 'Support Lines / Queues',
    icon: <HeadsetMicIcon sx={{ fontSize: '1rem' }} />,
  },
  {
    key: 'billingCodes',
    label: 'Billing Codes',
    icon: <CodeIcon sx={{ fontSize: '1rem' }} />,
  },
  {
    key: 'ticketTypes',
    label: 'Enable / Disable Ticket Types',
    icon: <ToggleOnIcon sx={{ fontSize: '1rem' }} />,
  },
  {
    key: 'stickyNote',
    label: 'Sticky Note',
    icon: <StickyNote2Icon sx={{ fontSize: '1rem' }} />,
  },
];

export const ApplicationsSection = ({ data, onDataChange }: ApplicationsSectionProps) => {
  const { classes } = useStyles();
  const [activeView, setActiveView] = useState<ApplicationActiveView>('applications');
  const [rows, setRows] = useState<IConfigApplication[]>([]);

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    }
  }, [data]);

  const handleSave = (next: IConfigApplication[]) => {
    setRows(next);
    if (onDataChange) {
      onDataChange(next);
    }
  };

  const allApprovals =
    rows?.flatMap((app) =>
      (app.approvals || []).map((ap) => ({
        ...ap,
        applicationId: app.id,
        applicationName: app.name,
      })),
    ) || [];

  const allTimesheets =
    rows?.flatMap((app) =>
      (app.timesheetProjects || []).map((ts) => ({
        ...ts,
        applicationId: app.id,
        applicationName: app.name,
      })),
    ) || [];

  const allExpenses =
    rows?.flatMap((app) =>
      (app.expenseProjects || []).map((ex) => ({
        ...ex,
        applicationId: app.id,
        applicationName: app.name,
      })),
    ) || [];

  const allSupportLines =
    rows?.flatMap((app) =>
      (app.supportLines || []).map((sl) => ({
        ...sl,
        applicationId: app.id,
        applicationName: app.name,
      })),
    ) || [];

  const allBillingCodes =
    rows?.flatMap((app) =>
      (app.billingCodes || []).map((bc) => ({
        ...bc,
        applicationId: app.id,
        applicationName: app.name,
      })),
    ) || [];

  const handleSubPanelSave = (
    field: 'approvals' | 'timesheetProjects' | 'expenseProjects' | 'supportLines' | 'billingCodes',
    updatedItems: { applicationId?: string }[],
  ) => {
    const updated = rows.map((app) => ({
      ...app,
      [field]: updatedItems.filter((item) => item.applicationId === app.id),
    }));
    handleSave(updated);
  };

  const handleTicketTypeToggle = (
    ticketTypeKey: string,
    enabled: boolean,
    ttId: string | number,
  ) => {
    const updated = rows.map((app) => {
      const existingActivations = app.ticketTypeActivations || [];
      const existingIndex = existingActivations.findIndex((ta) => ta.ticketTypeId === ttId);

      let newActivations: IConfigServiceLineTicketType[];
      if (existingIndex >= 0) {
        newActivations = existingActivations.map((ta, idx) =>
          idx === existingIndex ? { ...ta, enabled } : ta,
        );
      } else {
        newActivations = [
          ...existingActivations,
          { ticketTypeId: ttId as number, ticketTypeName: ticketTypeKey, enabled },
        ];
      }

      return { ...app, ticketTypeActivations: newActivations };
    });
    handleSave(updated);
  };

  const handleStickyNoteChange = (stickyNote: string) => {
    const updated = rows.map((app, idx) => (idx === 0 ? { ...app, stickyNote } : app));
    handleSave(updated);
  };

  return (
    <GenericAccordion
      title='Applications'
      subtitle='Manage applications linked to service lines and configure their specific settings'
      icon={<AppsIcon sx={{ fontSize: '1rem' }} />}
      accent={CATEG_ACCENT}
      className={classes.sectionAccordion}
      defaultExpanded={false}
    >
      <GenericToolbar
        buttons={VIEW_BUTTONS.map((btn) => ({
          key: btn.key,
          label: btn.label,
          icon: btn.icon,
          isActive: activeView === btn.key,
          onClick: () => setActiveView(btn.key),
        }))}
      />
      {activeView === 'applications' && (
        <GenericPanel config={TABLE_CONFIG.application} data={rows} onSave={handleSave} />
      )}
      {activeView === 'approvals' && (
        <AppApprovalsSection
          data={allApprovals}
          onDataChange={(next) => handleSubPanelSave('approvals', next)}
        />
      )}
      {activeView === 'timesheet' && (
        <AppTimesheetSection
          data={allTimesheets}
          onDataChange={(next) => handleSubPanelSave('timesheetProjects', next)}
        />
      )}
      {activeView === 'expenses' && (
        <AppExpensesSection
          data={allExpenses}
          onDataChange={(next) => handleSubPanelSave('expenseProjects', next)}
        />
      )}
      {activeView === 'supportLines' && (
        <AppSupportLinesSection
          data={allSupportLines}
          onDataChange={(next) => handleSubPanelSave('supportLines', next)}
        />
      )}
      {activeView === 'billingCodes' && (
        <AppBillingCodesSection
          data={allBillingCodes}
          onDataChange={(next) => handleSubPanelSave('billingCodes', next)}
        />
      )}
      {activeView === 'ticketTypes' && (
        <AppTicketTypeSection rows={rows} onTicketTypeToggle={handleTicketTypeToggle} />
      )}
      {activeView === 'stickyNote' && (
        <AppStickyNoteSection rows={rows} onStickyNoteChange={handleStickyNoteChange} />
      )}
    </GenericAccordion>
  );
};
