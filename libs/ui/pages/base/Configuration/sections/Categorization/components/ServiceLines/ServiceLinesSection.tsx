import React, { useState, useEffect, useCallback, useMemo } from 'react';
import LinearScaleIcon from '@mui/icons-material/LinearScale';
import ChecklistIcon from '@mui/icons-material/Checklist';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import {
  IConfigServiceLine,
  IConfigBusinessCategory,
  IConfigServiceLineTicketType,
  IConfigExpenseProject,
} from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import { useConfiguration } from '@serviceops/confighooks';
import { GenericToolbar } from '@serviceops/generictoolbar';
import { GenericPanel } from '@serviceops/genericpanel';
import { GenericAccordion } from '@serviceops/genericaccordion';
import { ConfigDeleteDialog } from '@serviceops/configdialogs';
import { ServiceLineFormDialog } from '@serviceops/pages/base/Configuration/dialogs/ServiceLineFormDialog';
import { CATEG_ACCENT, SERVICE_LINE_MAIN_CONFIG } from '../shared';
import {
  ServiceLineApprovalsSection,
  ServiceLineTimesheetSection,
  ServiceLineExpenseSection,
  ServiceLineTicketTypeSection,
} from './panels';
import { ServiceLineActiveView } from './ServiceLinesSection.types';
import { useSharedUsers } from '../../../../hooks/useSharedUsers';
import type { Column } from '@serviceops/component';
import { mkCell, mkDescCell } from '@serviceops/configutils';

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
  const { options: userOptions } = useSharedUsers();
  const [activeView, setActiveView] = useState<ServiceLineActiveView>('servicelines');
  const [rows, setRows] = useState<IConfigServiceLine[]>([]);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigServiceLine | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (apiCat?.serviceLines) {
      setRows(apiCat.serviceLines);
    }
  }, [data, apiCat]);

  const handleSave = useCallback(
    (next: IConfigServiceLine[]) => {
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
    },
    [onDataChange, apiCat, saveSection],
  );

  // Drop-down options for the "Service line manager" field. Sourced from
  // User Management → All Users; value and label are the user's full name
  // (firstName + ' ' + lastName). subtitle is the user's email and shows
  // as the secondary line in the popover, mirroring the User Management
  // data table. We store the full name so the data table can render the
  // name directly via its plain `mkCell` renderer. (If two users share a
  // name, both resolve to the same stored value; acceptable for this
  // internal team directory.)
  const managerOptions = useMemo(() => {
    const seen = new Set<string>();
    const options: { value: string; label: string; subtitle?: string }[] = [];
    userOptions.forEach((u) => {
      const name = String(u.name ?? '').trim();
      if (!name) return;
      const key = name.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      options.push({
        value: name,
        label: name,
        subtitle: u.email || undefined,
      });
    });
    options.sort((a, b) => a.label.localeCompare(b.label));
    return options;
  }, [userOptions]);

  // Drop-down options for the "Business Category" field. Sourced from the
  // existing business categories list. value and label are the category
  // name; deduplicated case-insensitively and sorted alphabetically.
  const businessCategoryOptions = useMemo(() => {
    const cats = apiCat?.businessCategories ?? [];
    const seen = new Set<string>();
    const options: { value: string; label: string }[] = [];
    cats.forEach((c) => {
      const name = String(c?.name ?? '').trim();
      if (!name) return;
      const key = name.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      options.push({ value: name, label: name });
    });
    options.sort((a, b) => a.label.localeCompare(b.label));
    return options;
  }, [apiCat?.businessCategories]);

  // Column definitions for the data table. Mirrors the Business Categories
  // table layout: bold cells for the primary identifiers, description-style
  // rendering for the multi-line text fields, and a plain render for
  // `manager` (which already stores the full name).
  const serviceLineColumns: Column<IConfigServiceLine>[] = useMemo(
    () => [
      {
        id: 'businessCategoryName',
        label: 'Business Category',
        minWidth: 160,
        format: mkCell(true),
      },
      { id: 'name', label: 'Service Line Name', minWidth: 180, format: mkCell(true) },
      { id: 'shortDescription', label: 'Short Description', minWidth: 180, format: mkCell() },
      { id: 'description', label: 'Description', minWidth: 220, format: mkDescCell },
      { id: 'manager', label: 'Service Line Manager', minWidth: 160, format: mkCell() },
      { id: 'internalNote', label: 'Internal note', minWidth: 200, format: mkDescCell },
    ],
    [],
  );

  const handleNewClick = useCallback(() => {
    setEditingRow(null);
    setDialogOpen(true);
  }, []);

  const handleEditClick = useCallback(() => {
    const selected = rows.find((r) => r.id === selectedRowId);
    if (selected) {
      setEditingRow(selected);
      setDialogOpen(true);
    }
  }, [rows, selectedRowId]);

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
    setEditingRow(null);
  }, []);

  const handleDialogSave = useCallback(
    (form: Partial<IConfigServiceLine>) => {
      const myId = editingRow?.id;
      const next: IConfigServiceLine[] = myId
        ? rows.map((r) => (r.id === myId ? { ...r, ...form, id: r.id } : r))
        : [
            ...rows,
            {
              id: `${Date.now()}`,
              businessCategoryId: '',
              businessCategoryName: form.businessCategoryName ?? '',
              name: form.name ?? '',
              description: form.description ?? '',
              manager: form.manager ?? '',
              shortDescription: form.shortDescription,
              internalNote: form.internalNote,
              timesheetProjects: [],
              expenseProjects: [],
              approvals: [],
              ticketTypeActivations: [],
            } as IConfigServiceLine,
          ];
      handleSave(next);
      handleDialogClose();
    },
    [rows, editingRow, handleSave, handleDialogClose],
  );

  const handleDeleteClick = useCallback(() => {
    setDeleteOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedRowId) return;
    try {
      const next = rows.filter((r) => r.id !== selectedRowId);
      handleSave(next);
      setSelectedRowId(null);
    } catch {
      // Errors already surface via saveSection; just close the dialog.
    } finally {
      setDeleteOpen(false);
    }
  }, [selectedRowId, rows, handleSave]);

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

  // Drop-down options for the "Service Line" field used by the
  // ServiceLineTimesheetFormDialog. Mirrors the same dedup + sort that
  // ServiceLineApprovalsSection applies.
  const serviceLineOptions = useMemo(() => {
    const seen = new Set<string>();
    const options: { value: string; label: string }[] = [];
    rows.forEach((sl) => {
      const name = String(sl?.name ?? '').trim();
      if (!name) return;
      const key = name.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      options.push({ value: name, label: name });
    });
    options.sort((a, b) => a.label.localeCompare(b.label));
    return options;
  }, [rows]);

  // Drop-down options for the "Project name" field. Deduplicated union
  // of every project name across all service lines' timesheet rows, in
  // alphabetical order. Sourced from `allTimesheets` so it stays in sync
  // as the user adds/edits/deletes rows.
  const projectOptions = useMemo(() => {
    const seen = new Set<string>();
    const options: { value: string; label: string }[] = [];
    allTimesheets.forEach((ts) => {
      const name = String(ts?.project ?? '').trim();
      if (!name) return;
      const key = name.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      options.push({ value: name, label: name });
    });
    options.sort((a, b) => a.label.localeCompare(b.label));
    return options;
  }, [allTimesheets]);

  // Mirror handler fired by the timesheet sub-panel. When the row's
  // useInExpenses toggle transitions 0→1 we add a mirror row to the
  // same service line's expenseProjects; on 1→0 we remove it.
  const handleTimesheetSaveWithMirror = useCallback(
    (data: {
      row: {
        id: string;
        serviceLineId: string;
        serviceLineName: string;
        project: string;
        application?: string;
        fromDate: string;
        toDate: string;
        activate: boolean;
        useInExpenses?: boolean;
        internalNote?: string;
      };
      previousUseInExpenses: boolean;
    }) => {
      const { row, previousUseInExpenses } = data;
      const nowOn = row.useInExpenses === true;
      if (nowOn === previousUseInExpenses) return;
      const targetSlId = row.serviceLineId;
      if (!targetSlId) return;

      const updated = rows.map((sl) => {
        if (sl.id !== targetSlId) return sl;
        const existing = sl.expenseProjects || [];
        if (nowOn) {
          // Add the mirror row. Use a deterministic id (TS row id) so
          // the mirror is trivially identifiable and updateable in the
          // future.
          const mirrorId = `mirror-${row.id}`;
          if (existing.some((e) => e.id === mirrorId)) return sl;
          return {
            ...sl,
            expenseProjects: [
              ...existing,
              {
                id: mirrorId,
                project: row.project,
                application: row.application,
                fromDate: row.fromDate,
                toDate: row.toDate,
                activate: row.activate,
                maxAmountPerDay: 0,
                // internalNote intentionally not mirrored (expense rows
                // don't have a rich text field per the spec).
              } as IConfigExpenseProject,
            ],
          };
        }
        // Remove the mirror row.
        return {
          ...sl,
          expenseProjects: existing.filter((e) => e.id !== `mirror-${row.id}`),
        };
      });
      handleSave(updated);
    },
    [rows, handleSave],
  );

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

  // Mirror handler fired when a timesheet row is deleted. Drops the
  // corresponding mirror row from the same service line's
  // expenseProjects (id derived as `mirror-${ts.id}`).
  const handleTimesheetDeleteWithMirror = useCallback(
    (data: { row: { id: string; serviceLineId: string } }) => {
      const targetSlId = data.row.serviceLineId;
      if (!targetSlId) return;
      const updated = rows.map((sl) =>
        sl.id !== targetSlId
          ? sl
          : {
              ...sl,
              expenseProjects: (sl.expenseProjects || []).filter(
                (e) => e.id !== `mirror-${data.row.id}`,
              ),
            },
      );
      handleSave(updated);
    },
    [rows, handleSave],
  );

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

  const selectedRow = rows.find((r) => r.id === selectedRowId) ?? null;

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
        <>
          <GenericPanel
            config={SERVICE_LINE_MAIN_CONFIG}
            data={rows as unknown as Record<string, unknown>[]}
            onSave={handleSave as (data: unknown[]) => void}
            customColumns={serviceLineColumns as unknown as undefined}
            variant='standard'
            selectedRowId={selectedRowId}
            onRowSelect={setSelectedRowId}
            onNewClick={handleNewClick}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
          />

          <ServiceLineFormDialog
            open={dialogOpen}
            editing={editingRow}
            existingServiceLines={rows}
            businessCategoryOptions={businessCategoryOptions}
            managerOptions={managerOptions}
            onClose={handleDialogClose}
            onSave={handleDialogSave}
            subtitle={SERVICE_LINE_MAIN_CONFIG.subtitle}
          />

          <ConfigDeleteDialog
            open={deleteOpen}
            onClose={() => setDeleteOpen(false)}
            onConfirm={handleConfirmDelete}
            entityName='Service Line'
            itemName={selectedRow?.name ?? ''}
          />
        </>
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
          serviceLineOptions={serviceLineOptions}
          projectOptions={projectOptions}
          onTimesheetSave={handleTimesheetSaveWithMirror}
          onTimesheetDelete={handleTimesheetDeleteWithMirror}
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
