import { useState, useEffect } from 'react';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import ChecklistIcon from '@mui/icons-material/Checklist';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import { IConfigApplicationQueue } from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import { useConfiguration } from '@serviceops/confighooks';
import { GenericToolbar } from '@serviceops/generictoolbar';
import { GenericPanel } from '@serviceops/genericpanel';
import { GenericAccordion } from '@serviceops/genericaccordion';
import { CATEG_ACCENT, TABLE_CONFIG } from '../shared';
import {
  QueueApprovalsSection,
  QueueTimesheetSection,
  QueueExpenseSection,
  QueueTicketTypeSection,
} from './panels';
import { ApplicationQueueActiveView } from './ApplicationQueuesSection.types';

export interface ApplicationQueuesSectionProps {
  data?: IConfigApplicationQueue[];
  onDataChange?: (data: IConfigApplicationQueue[]) => void;
}

const VIEW_BUTTONS: { key: ApplicationQueueActiveView; label: string; icon: React.ReactNode }[] = [
  {
    key: 'queues',
    label: 'Application Queues',
    icon: <HeadsetMicIcon sx={{ fontSize: '1rem' }} />,
  },
  {
    key: 'approvals',
    label: 'Queue Approvals',
    icon: <ChecklistIcon sx={{ fontSize: '1rem' }} />,
  },
  {
    key: 'ticketTypes',
    label: 'Enable / Disable Ticket Types',
    icon: <ToggleOnIcon sx={{ fontSize: '1rem' }} />,
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
];

export const ApplicationQueuesSection = ({ data, onDataChange }: ApplicationQueuesSectionProps) => {
  const { classes } = useStyles();
  const { categorization: apiCat, saveSection } = useConfiguration();
  const [activeView, setActiveView] = useState<ApplicationQueueActiveView>('queues');
  const [rows, setRows] = useState<IConfigApplicationQueue[]>([]);

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (apiCat?.queues) {
      setRows(apiCat.queues);
    }
  }, [data, apiCat]);

  const handleSave = (next: IConfigApplicationQueue[]) => {
    setRows(next);
    if (onDataChange) {
      onDataChange(next);
    } else {
      saveSection('categorization', {
        businessCategories: apiCat?.businessCategories ?? [],
        serviceLines: apiCat?.serviceLines ?? [],
        applications: apiCat?.applications ?? [],
        queues: next,
        applicationCategories: apiCat?.applicationCategories ?? [],
        applicationSubCategories: apiCat?.applicationSubCategories ?? [],
        applicationNumberSequences: apiCat?.applicationNumberSequences ?? [],
      });
    }
  };

  const allApprovals =
    rows?.flatMap((q) =>
      (q.approvals || []).map((ap) => ({ ...ap, queueId: q.id, queueName: q.name })),
    ) || [];

  const allTimesheets =
    rows?.flatMap((q) =>
      (q.timesheetProjects || []).map((ts) => ({
        ...ts,
        queueId: q.id,
        queueName: q.name,
      })),
    ) || [];

  const allExpenses =
    rows?.flatMap((q) =>
      (q.expenseProjects || []).map((ex) => ({
        ...ex,
        queueId: q.id,
        queueName: q.name,
      })),
    ) || [];

  const handleSubPanelSave = (
    field: 'approvals' | 'timesheetProjects' | 'expenseProjects',
    updatedItems: { queueId?: string }[],
  ) => {
    const updated = rows.map((q) => ({
      ...q,
      [field]: updatedItems.filter((item) => item.queueId === q.id),
    }));
    handleSave(updated);
  };

  const handleTicketTypeToggle = (
    ticketTypeKey: string,
    enabled: boolean,
    ttId: string | number,
  ) => {
    const updated = rows.map((q) => {
      const existingActivations = q.ticketTypeActivations || [];
      const existingIndex = existingActivations.findIndex((ta) => ta.ticketTypeId === ttId);

      let newActivations;
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

      return { ...q, ticketTypeActivations: newActivations };
    });
    handleSave(updated);
  };

  return (
    <GenericAccordion
      title='Application Queues'
      subtitle='Configure queues with associated approvals, timesheets, and expenses'
      icon={<HeadsetMicIcon sx={{ fontSize: '1rem' }} />}
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
      {activeView === 'queues' && (
        <GenericPanel config={TABLE_CONFIG.applicationQueue} data={rows} onSave={handleSave} />
      )}
      {activeView === 'approvals' && (
        <QueueApprovalsSection
          data={allApprovals}
          onDataChange={(next) => handleSubPanelSave('approvals', next)}
        />
      )}
      {activeView === 'ticketTypes' && (
        <QueueTicketTypeSection rows={rows} onTicketTypeToggle={handleTicketTypeToggle} />
      )}
      {activeView === 'timesheet' && (
        <QueueTimesheetSection
          data={allTimesheets}
          onDataChange={(next) => handleSubPanelSave('timesheetProjects', next)}
        />
      )}
      {activeView === 'expenses' && (
        <QueueExpenseSection
          data={allExpenses}
          onDataChange={(next) => handleSubPanelSave('expenseProjects', next)}
        />
      )}
    </GenericAccordion>
  );
};
