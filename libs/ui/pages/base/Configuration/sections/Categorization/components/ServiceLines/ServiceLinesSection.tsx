import { useState, useEffect } from 'react';
import LinearScaleIcon from '@mui/icons-material/LinearScale';
import ChecklistIcon from '@mui/icons-material/Checklist';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import {
  IConfigServiceLine,
  IConfigBusinessCategory,
  IConfigServiceLineTicketType,
} from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';
import { GenericToolbar } from '@serviceops/pages/base/Configuration/shared/GenericToolbar/GenericToolbar';
import { GenericPanel } from '@serviceops/pages/base/Configuration/shared/GenericPanel/GenericPanel';
import { GenericAccordion } from '@serviceops/pages/base/Configuration/shared/GenericAccordion/GenericAccordion';
import { CATEG_ACCENT, TABLE_CONFIG } from '../shared';
import {
  ServiceLineApprovalsSection,
  ServiceLineTimesheetSection,
  ServiceLineExpenseSection,
  ServiceLineTicketTypeSection,
} from './panels';
import { ServiceLineActiveView } from './ServiceLinesSection.types';

interface ServiceLinesSectionProps {
  data?: IConfigServiceLine[];
  businessCategories?: IConfigBusinessCategory[];
  onDataChange?: (data: IConfigServiceLine[]) => void;
}

const VIEW_BUTTONS: { key: ServiceLineActiveView; label: string; icon: React.ReactNode }[] = [
  {
    key: 'servicelines',
    label: 'Service Lines',
    icon: <LinearScaleIcon sx={{ fontSize: '1rem' }} />,
  },
  {
    key: 'approvals',
    label: 'Service Line Approvals',
    icon: <ChecklistIcon sx={{ fontSize: '1rem' }} />,
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
    key: 'ticketTypes',
    label: 'Enable / Disable Ticket Types',
    icon: <ToggleOnIcon sx={{ fontSize: '1rem' }} />,
  },
];

export const ServiceLinesSection = ({ data, onDataChange }: ServiceLinesSectionProps) => {
  const { classes } = useStyles();
  const { categorization: apiCat, saveSection } = useConfiguration();
  const [activeView, setActiveView] = useState<ServiceLineActiveView>('servicelines');
  const [rows, setRows] = useState<IConfigServiceLine[]>([]);

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (apiCat?.serviceLines) {
      setRows(apiCat.serviceLines);
    }
  }, [data, apiCat]);

  const handleSave = (next: IConfigServiceLine[]) => {
    setRows(next);
    if (onDataChange) {
      onDataChange(next);
    } else {
      saveSection('categorization', {
        businessCategories: apiCat?.businessCategories ?? [],
        serviceLines: next,
        applications: apiCat?.applications ?? [],
        queues: apiCat?.queues ?? [],
        applicationCategories: apiCat?.applicationCategories ?? [],
        applicationSubCategories: apiCat?.applicationSubCategories ?? [],
        applicationNumberSequences: apiCat?.applicationNumberSequences ?? [],
      });
    }
  };

  const allApprovals =
    rows?.flatMap((sl) =>
      (sl.approvals || []).map((ap) => ({ ...ap, serviceLineId: sl.id, serviceLineName: sl.name })),
    ) || [];

  const allTimesheets =
    rows?.flatMap((sl) =>
      (sl.timesheetProjects || []).map((ts) => ({
        ...ts,
        serviceLineId: sl.id,
        serviceLineName: sl.name,
      })),
    ) || [];

  const allExpenses =
    rows?.flatMap((sl) =>
      (sl.expenseProjects || []).map((ex) => ({
        ...ex,
        serviceLineId: sl.id,
        serviceLineName: sl.name,
      })),
    ) || [];

  const handleSubPanelSave = (
    field: 'approvals' | 'timesheetProjects' | 'expenseProjects',
    updatedItems: { serviceLineId?: string }[],
  ) => {
    const updated = rows.map((sl) => ({
      ...sl,
      [field]: updatedItems.filter((item) => item.serviceLineId === sl.id),
    }));
    handleSave(updated);
  };

  const handleTicketTypeToggle = (
    ticketTypeKey: string,
    enabled: boolean,
    ttId: string | number,
  ) => {
    const updated = rows.map((sl) => {
      const existingActivations = sl.ticketTypeActivations || [];
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

      return { ...sl, ticketTypeActivations: newActivations };
    });
    handleSave(updated);
  };

  return (
    <GenericAccordion
      title='Service Lines'
      subtitle='Configure service lines with associated approvals, timesheets, and expenses'
      icon={<LinearScaleIcon sx={{ fontSize: '1rem' }} />}
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
      {activeView === 'servicelines' && (
        <GenericPanel config={TABLE_CONFIG.serviceLine} data={rows} onSave={handleSave} />
      )}
      {activeView === 'approvals' && (
        <ServiceLineApprovalsSection
          data={allApprovals}
          onDataChange={(next) => handleSubPanelSave('approvals', next)}
        />
      )}
      {activeView === 'timesheet' && (
        <ServiceLineTimesheetSection
          data={allTimesheets}
          onDataChange={(next) => handleSubPanelSave('timesheetProjects', next)}
        />
      )}
      {activeView === 'expenses' && (
        <ServiceLineExpenseSection
          data={allExpenses}
          onDataChange={(next) => handleSubPanelSave('expenseProjects', next)}
        />
      )}
      {activeView === 'ticketTypes' && (
        <ServiceLineTicketTypeSection rows={rows} onTicketTypeToggle={handleTicketTypeToggle} />
      )}
    </GenericAccordion>
  );
};
