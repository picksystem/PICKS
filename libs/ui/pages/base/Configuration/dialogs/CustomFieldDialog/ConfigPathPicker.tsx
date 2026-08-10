import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Divider,
  Button,
  Chip,
  InputBase,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Clear as ClearIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { useConfiguration } from '@serviceops/confighooks';
import type { IConfigurationData } from '@serviceops/interfaces';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type SectionKey = keyof IConfigurationData;

type ConfigItem = {
  section: string;
  sectionKey: SectionKey;
  label: string;
  value: string;
  path: string;
  secondary?: string;
  id?: string;
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function pluck(data: any, ...keys: string[]): any {
  for (const k of keys) {
    if (data && data[k] !== undefined) return data[k];
  }
  return undefined;
}

/* ------------------------------------------------------------------ */
/*  Section extractors — all accept `any` from configuration data       */
/* ------------------------------------------------------------------ */

function extractGeneralItems(data: any): ConfigItem[] {
  const items: ConfigItem[] = [];
  const gac = pluck(data, 'generalAdminControls', 'adminControls');
  if (gac) {
    items.push({
      section: 'General Admin Controls',
      sectionKey: 'general',
      label: 'Activate Default Approved Hours',
      value: gac.activateDefaultApprovedHours ? 'Yes' : 'No',
      path: 'General > General Admin Controls > Activate Default Approved Hours',
    });
    if (gac.timeEntriesEnabled !== undefined)
      items.push({
        section: 'General Admin Controls',
        sectionKey: 'general',
        label: 'Time Entries Enabled',
        value: gac.timeEntriesEnabled ? 'Yes' : 'No',
        path: 'General > General Admin Controls > Time Entries Enabled',
      });
    if (gac.autoAssignOnReopen !== undefined)
      items.push({
        section: 'General Admin Controls',
        sectionKey: 'general',
        label: 'Auto Assign On Reopen',
        value: gac.autoAssignOnReopen ? 'Yes' : 'No',
        path: 'General > General Admin Controls > Auto Assign On Reopen',
      });
    if (gac.autoAssignOnReopenConsultantName)
      items.push({
        section: 'General Admin Controls',
        sectionKey: 'general',
        label: 'Auto Assign Consultant',
        value: gac.autoAssignOnReopenConsultantName,
        secondary: 'Consultant for auto-assign',
        path: 'General > General Admin Controls > Auto Assign Consultant',
      });
    if (gac.changeDisplayName) {
      items.push({
        section: 'General Admin Controls',
        sectionKey: 'general',
        label: 'Change Display Name - Approved estimates (hrs)',
        value: gac.changeDisplayName.approved_estimates ? 'Yes' : 'No',
        path: 'General > General Admin Controls > Change Display Name - Approved estimates (hrs)',
      });
      items.push({
        section: 'General Admin Controls',
        sectionKey: 'general',
        label: 'Change Display Name - Estimated hours',
        value: gac.changeDisplayName.estimated_hours ? 'Yes' : 'No',
        path: 'General > General Admin Controls > Change Display Name - Estimated hours',
      });
    }
  }
  const daeRows = data.defaultApprovedEstimates?.rows ?? [];
  if (daeRows.length > 0) {
    const uniqueTicketTypes = [
      ...new Set(daeRows.map((r: any) => r.ticketTypeName).filter(Boolean)),
    ];
    const uniqueServiceLines = [...new Set(daeRows.map((r: any) => r.serviceLine).filter(Boolean))];
    const uniqueApplications = [...new Set(daeRows.map((r: any) => r.application).filter(Boolean))];
    const uniqueQueues = [...new Set(daeRows.map((r: any) => r.queue).filter(Boolean))];
    const uniqueHours = [...new Set(daeRows.map((r: any) => `${r.hours}h`).filter(Boolean))];
    const uniqueActivations = [
      ...new Set(daeRows.map((r: any) => (r.isActive ? 'Active' : 'Inactive'))),
    ];
    const uniqueInternalNotes = [
      ...new Set(daeRows.map((r: any) => r.shortDescription).filter(Boolean)),
    ];

    items.push({
      section: 'Default Approved Estimates',
      sectionKey: 'general',
      label: 'Ticket Type',
      value: uniqueTicketTypes.join(', '),
      path: 'General > Default Approved Estimates > Ticket Type',
    });
    items.push({
      section: 'Default Approved Estimates',
      sectionKey: 'general',
      label: 'Service Line',
      value: uniqueServiceLines.join(', '),
      path: 'General > Default Approved Estimates > Service Line',
    });
    items.push({
      section: 'Default Approved Estimates',
      sectionKey: 'general',
      label: 'Application',
      value: uniqueApplications.join(', '),
      path: 'General > Default Approved Estimates > Application',
    });
    items.push({
      section: 'Default Approved Estimates',
      sectionKey: 'general',
      label: 'Queue',
      value: uniqueQueues.join(', '),
      path: 'General > Default Approved Estimates > Queue',
    });
    items.push({
      section: 'Default Approved Estimates',
      sectionKey: 'general',
      label: 'Default Hours',
      value: uniqueHours.join(', '),
      path: 'General > Default Approved Estimates > Default Hours',
    });
    items.push({
      section: 'Default Approved Estimates',
      sectionKey: 'general',
      label: 'Activation',
      value: uniqueActivations.join(', '),
      path: 'General > Default Approved Estimates > Activation',
    });
    if (uniqueInternalNotes.length > 0) {
      items.push({
        section: 'Default Approved Estimates',
        sectionKey: 'general',
        label: 'Internal Note',
        value: uniqueInternalNotes.join(', '),
        path: 'General > Default Approved Estimates > Internal Note',
      });
    }
  }
  const sys = data.system;
  if (sys) {
    items.push({
      section: 'System',
      sectionKey: 'general',
      label: 'System Name',
      value: sys.systemName || '',
      path: 'General > System > System Name',
    });
    items.push({
      section: 'System',
      sectionKey: 'general',
      label: 'Timezone',
      value: sys.timezone || '',
      path: 'General > System > Timezone',
    });
    items.push({
      section: 'System',
      sectionKey: 'general',
      label: 'Date Format',
      value: sys.dateFormat || '',
      path: 'General > System > Date Format',
    });
    items.push({
      section: 'System',
      sectionKey: 'general',
      label: 'Language',
      value: sys.language || '',
      path: 'General > System > Language',
    });
  }
  return items;
}

function extractPriorityItems(data: any): ConfigItem[] {
  const items: ConfigItem[] = [];
  const matrices = (data as any)?.matrices || {};
  for (const [level, matrix] of Object.entries(matrices)) {
    if (level === '__simple__') continue;
    const m = matrix as any;
    items.push({
      section: `Priorities - ${level}`,
      sectionKey: 'priorities',
      label: `Priority Matrix: ${level}`,
      value: `${m?.urgencyLevels?.length ?? 0} urgency x ${m?.impactLevels?.length ?? 0} impact`,
      secondary: m?.reasonCodeId ? 'Has reason code' : 'No reason code',
      path: `Priorities > ${level} > Priority Matrix`,
    });
  }
  return items;
}

function extractStatusItems(data: any, sectionName: string, sectionKey: SectionKey): ConfigItem[] {
  const arr = (data as any)?.items || [];
  return arr.map((s: any) => ({
    section: sectionName,
    sectionKey,
    label: s.name,
    value: s.name,
    secondary: [s.statusType, s.color].filter(Boolean).join(', ') || '',
    path: `${sectionName} > ${s.name}`,
  }));
}

function extractSLAItems(data: any): ConfigItem[] {
  const items: ConfigItem[] = [];
  const ac = pluck(data, 'adminControls');
  if (ac)
    items.push({
      section: 'SLA Admin Controls',
      sectionKey: 'slas',
      label: 'Default SLA Hours',
      value: ac.defaultSlaHours ? `${ac.defaultSlaHours}h` : 'Not set',
      path: 'SLAs > Admin Controls > Default SLA Hours',
    });
  for (const sla of (data as any)?.items || [])
    items.push({
      section: 'SLAs',
      sectionKey: 'slas',
      label: sla.name,
      value: sla.name,
      secondary: sla.description || 'SLA',
      path: `SLAs > ${sla.name}`,
    });
  return items;
}

function extractCategorizationItems(data: any): ConfigItem[] {
  const items: ConfigItem[] = [];
  for (const bc of data.businessCategories || [])
    items.push({
      section: 'Business Categories',
      sectionKey: 'categorization',
      label: bc.name,
      value: bc.name,
      path: `Categorization > Business Categories > ${bc.name}`,
    });
  for (const sl of data.serviceLines || [])
    items.push({
      section: 'Service Lines',
      sectionKey: 'categorization',
      label: sl.name,
      value: sl.name,
      secondary: `${sl.businessCategoryName}`,
      path: `Categorization > ${sl.businessCategoryName} > Service Lines > ${sl.name}`,
    });
  for (const app of data.applications || [])
    items.push({
      section: 'Applications',
      sectionKey: 'categorization',
      label: app.name,
      value: app.name,
      secondary: `${app.serviceLineName}`,
      path: `Categorization > ${app.serviceLineName} > Applications > ${app.name}`,
    });
  for (const q of data.queues || [])
    items.push({
      section: 'Queues',
      sectionKey: 'categorization',
      label: q.name,
      value: q.name,
      secondary: `${q.applicationName}`,
      path: `Categorization > ${q.applicationName} > Queues > ${q.name}`,
    });
  for (const cat of data.applicationCategories || [])
    items.push({
      section: 'Application Categories',
      sectionKey: 'categorization',
      label: cat.categoryName,
      value: cat.categoryName,
      secondary: `${cat.applicationName}`,
      path: `Categorization > ${cat.applicationName} > Application Categories > ${cat.categoryName}`,
    });
  for (const sub of data.applicationSubCategories || [])
    items.push({
      section: 'Application Sub Categories',
      sectionKey: 'categorization',
      label: sub.subCategoryName,
      value: sub.subCategoryName,
      secondary: `${sub.applicationCategoryName}`,
      path: `Categorization > ${sub.applicationCategoryName} > Application Sub Categories > ${sub.subCategoryName}`,
    });
  return items;
}

function extractReasonCodeItems(data: any): ConfigItem[] {
  const items: ConfigItem[] = [];
  const map: [string, string][] = [
    ['priorityChangeReasonCodes', 'Priority Change'],
    ['roleChangeReasonCodes', 'Role Change'],
    ['resolutionReasonCodes', 'Resolution'],
    ['cancellationReasonCodes', 'Cancellation'],
    ['reopenReasonCodes', 'Reopen'],
    ['conversionReasonCodes', 'Conversion'],
    ['timesheetConversionReasonCodes', 'Timesheet Conversion'],
    ['timesheetCancellationReasonCodes', 'Timesheet Cancellation'],
  ];
  for (const [key, label] of map) {
    const arr = data[key];
    if (Array.isArray(arr))
      for (const r of arr)
        items.push({
          section: `Reason Codes - ${label}`,
          sectionKey: 'reasonCodes',
          label: r.reason,
          value: r.reason,
          secondary: label,
          path: `Reason Codes > ${label} > ${r.reason}`,
        });
  }
  return items;
}

function extractTemplateItems(data: any): ConfigItem[] {
  const items: ConfigItem[] = [];
  const tmplMap: { name: string; key: string; sectionKey: SectionKey }[] = [
    { name: 'Ticket Update', key: 'ticketUpdateTemplates', sectionKey: 'ticketUpdateTemplates' },
    { name: 'Comment', key: 'commentTemplates', sectionKey: 'ticketUpdateTemplates' },
    { name: 'Internal Note', key: 'internalNoteTemplates', sectionKey: 'ticketUpdateTemplates' },
    { name: 'Resolution', key: 'resolutionTemplates', sectionKey: 'ticketUpdateTemplates' },
    { name: 'Time Entry', key: 'timeEntryTemplates', sectionKey: 'ticketUpdateTemplates' },
  ];
  for (const { name, key, sectionKey } of tmplMap) {
    const templates = (data[key] as any)?.templates || [];
    for (const t of templates)
      items.push({
        section: `Templates - ${name}`,
        sectionKey,
        label: t.name,
        value: t.name,
        secondary: `${name} Template`,
        path: `Templates > ${name} > ${t.name}`,
      });
  }
  return items;
}

function extractApprovalItems(data: any): ConfigItem[] {
  const arr = (data as any)?.records || [];
  return arr.map((a: any) => ({
    section: 'Approvals',
    sectionKey: 'approvals',
    label: a.name || `Approval #${a.id}`,
    value: a.name || `Approval #${a.id}`,
    secondary: a.approvalType || 'Approval',
    path: `Approvals > ${a.name || `Approval #${a.id}`}`,
  }));
}

function extractProfileItems(data: any): ConfigItem[] {
  const arr = (data as any)?.profiles || [];
  return arr.map((p: any) => ({
    section: 'Consultant Profiles',
    sectionKey: 'consultantProfiles',
    label: p.consultantName,
    value: p.consultantName,
    secondary: 'Profile',
    path: `Consultant Profiles > ${p.consultantName}`,
  }));
}

function extractTimesheetItems(data: any): ConfigItem[] {
  return (data.timesheetPeriods || []).map((p: any) => ({
    section: 'Timesheet Periods',
    sectionKey: 'timesheets',
    label: p.periodName,
    value: p.periodName,
    secondary: 'Period',
    path: `Timesheet Periods > ${p.periodName}`,
  }));
}

function extractExpenseItems(data: any): ConfigItem[] {
  return (data.expenseCategories || []).map((c: any) => ({
    section: 'Expense Categories',
    sectionKey: 'expenses',
    label: c.categoryName,
    value: c.categoryName,
    secondary: 'Expense',
    path: `Expense Categories > ${c.categoryName}`,
  }));
}

function extractCalendarItems(data: any): ConfigItem[] {
  const items: ConfigItem[] = [];
  for (const cal of data.workingCalendars || [])
    items.push({
      section: 'Working Calendars',
      sectionKey: 'calendars',
      label: cal.calendarName,
      value: cal.calendarName,
      secondary: 'Working',
      path: `Calendars > Working > ${cal.calendarName}`,
    });
  for (const hc of data.holidayCalendars || [])
    items.push({
      section: 'Holiday Calendars',
      sectionKey: 'calendars',
      label: hc.calendarName,
      value: hc.calendarName,
      secondary: 'Holiday',
      path: `Calendars > Holiday > ${hc.calendarName}`,
    });
  return items;
}

function extractWorkLocationItems(data: any): ConfigItem[] {
  return (data.workLocations || []).map((wl: any) => ({
    section: 'Work Locations',
    sectionKey: 'userConfig',
    label: wl.workLocation,
    value: wl.workLocation,
    secondary: wl.city || 'Work Location',
    path: `User Config > Work Locations > ${wl.workLocation}`,
  }));
}

/* ------------------------------------------------------------------ */
/*  Static section metadata                                           */
/* ------------------------------------------------------------------ */

const ALL_SECTIONS: { key: SectionKey; label: string; icon: string; color: string }[] = [
  { key: 'general', label: 'General', icon: 'G', color: '#1976d2' },
  { key: 'priorities', label: 'Priorities', icon: 'P', color: '#7c3aed' },
  { key: 'statuses', label: 'Statuses', icon: 'S', color: '#16a34a' },
  { key: 'releaseStatuses', label: 'Release Stat...', icon: 'R', color: '#059669' },
  { key: 'slas', label: 'SLAs', icon: 'T', color: '#d97706' },
  { key: 'categorization', label: 'Categorization', icon: 'C', color: '#0891b2' },
  { key: 'consultantProfiles', label: 'Consultant...', icon: 'CP', color: '#be185d' },
  { key: 'approvals', label: 'Approvals', icon: 'A', color: '#b45309' },
  { key: 'ticketUpdateTemplates', label: 'Templates', icon: 'TP', color: '#4f46e5' },
  { key: 'reasonCodes', label: 'Reason Cod...', icon: 'RC', color: '#dc2626' },
  { key: 'timesheets', label: 'Timesheets', icon: 'TS', color: '#2563eb' },
  { key: 'expenses', label: 'Expenses', icon: 'EX', color: '#059669' },
  { key: 'calendars', label: 'Calendars', icon: 'CA', color: '#d97706' },
  { key: 'userConfig', label: 'Work Locat...', icon: 'WL', color: '#0d9488' },
];

const CATEGORY_COLORS: Record<string, string> = {
  general: '#1976d2',
  priorities: '#7c3aed',
  statuses: '#16a34a',
  releaseStatuses: '#059669',
  slas: '#d97706',
  categorization: '#0891b2',
  consultantProfiles: '#be185d',
  approvals: '#b45309',
  ticketUpdateTemplates: '#4f46e5',
  reasonCodes: '#dc2626',
  timesheets: '#2563eb',
  expenses: '#059669',
  calendars: '#d97706',
  userConfig: '#0d9488',
};

const SECTION_ICONS: Record<string, string> = {
  general: 'G',
  priorities: 'P',
  statuses: 'S',
  releaseStatuses: 'R',
  slas: 'T',
  categorization: 'C',
  consultantProfiles: 'CP',
  approvals: 'A',
  ticketUpdateTemplates: 'TP',
  reasonCodes: 'RC',
  timesheets: 'TS',
  expenses: 'EX',
  calendars: 'CA',
  userConfig: 'WL',
};

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface ConfigPathPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (label: string, value: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Hierarchy builder                                                  */
/* ------------------------------------------------------------------ */

type SubSection = {
  id: string;
  label: string;
  icon: string;
  leaves: ConfigItem[];
};

type PageGroup = {
  key: SectionKey;
  label: string;
  icon: string;
  color: string;
  subsections: SubSection[];
};

function buildGeneralHierarchy(data: IConfigurationData['general']): PageGroup[] {
  const group: PageGroup = {
    key: 'general',
    label: 'General',
    icon: 'G',
    color: '#1976d2',
    subsections: [],
  };

  const gacItems: ConfigItem[] = [];
  const gac = data.generalAdminControls;
  if (gac) {
    gacItems.push({
      section: 'General Admin Controls',
      sectionKey: 'general',
      label: 'Activate Default Approved Hours',
      value: gac.activateDefaultApprovedHours ? 'Yes' : 'No',
      path: 'General > General Admin Controls > Activate Default Approved Hours',
    });
    gacItems.push({
      section: 'General Admin Controls',
      sectionKey: 'general',
      label: 'Time Entries Enabled',
      value: gac.timeEntriesEnabled ? 'Yes' : 'No',
      path: 'General > General Admin Controls > Time Entries Enabled',
    });
    if (gac.autoAssignOnReopen !== undefined) {
      gacItems.push({
        section: 'General Admin Controls',
        sectionKey: 'general',
        label: 'Auto Assign On Reopen',
        value: gac.autoAssignOnReopen ? 'Yes' : 'No',
        path: 'General > General Admin Controls > Auto Assign On Reopen',
      });
    }
    if (gac.autoAssignOnReopenConsultantName) {
      gacItems.push({
        section: 'General Admin Controls',
        sectionKey: 'general',
        label: 'Auto Assign Consultant',
        value: gac.autoAssignOnReopenConsultantName,
        secondary: 'Consultant for auto-assign',
        path: 'General > General Admin Controls > Auto Assign Consultant',
      });
    }
    if (gac.changeDisplayName) {
      gacItems.push({
        section: 'General Admin Controls',
        sectionKey: 'general',
        label: 'Change Display Name - Approved estimates (hrs)',
        value: gac.changeDisplayName.approved_estimates ? 'Yes' : 'No',
        path: 'General > General Admin Controls > Change Display Name - Approved estimates (hrs)',
      });
      gacItems.push({
        section: 'General Admin Controls',
        sectionKey: 'general',
        label: 'Change Display Name - Estimated hours',
        value: gac.changeDisplayName.estimated_hours ? 'Yes' : 'No',
        path: 'General > General Admin Controls > Change Display Name - Estimated hours',
      });
    }
  }
  if (gacItems.length > 0) {
    group.subsections.push({
      id: 'general-admin-controls',
      label: 'General Admin Controls',
      icon: 'G',
      leaves: gacItems,
    });
  }

  const daeItems: ConfigItem[] = [];
  const daeRows = data.defaultApprovedEstimates?.rows ?? [];
  if (daeRows.length > 0) {
    const uniqueTicketTypes = [
      ...new Set(daeRows.map((r: any) => r.ticketTypeName).filter(Boolean)),
    ];
    const uniqueServiceLines = [...new Set(daeRows.map((r: any) => r.serviceLine).filter(Boolean))];
    const uniqueApplications = [...new Set(daeRows.map((r: any) => r.application).filter(Boolean))];
    const uniqueQueues = [...new Set(daeRows.map((r: any) => r.queue).filter(Boolean))];
    const uniqueHours = [...new Set(daeRows.map((r: any) => `${r.hours}h`).filter(Boolean))];
    const uniqueActivations = [
      ...new Set(daeRows.map((r: any) => (r.isActive ? 'Active' : 'Inactive'))),
    ];
    const uniqueInternalNotes = [
      ...new Set(daeRows.map((r: any) => r.shortDescription).filter(Boolean)),
    ];

    daeItems.push({
      section: 'Default Approved Estimates',
      sectionKey: 'general',
      label: 'Ticket Type',
      value: uniqueTicketTypes.join(', '),
      path: 'General > Default Approved Estimates > Ticket Type',
    });
    daeItems.push({
      section: 'Default Approved Estimates',
      sectionKey: 'general',
      label: 'Service Line',
      value: uniqueServiceLines.join(', '),
      path: 'General > Default Approved Estimates > Service Line',
    });
    daeItems.push({
      section: 'Default Approved Estimates',
      sectionKey: 'general',
      label: 'Application',
      value: uniqueApplications.join(', '),
      path: 'General > Default Approved Estimates > Application',
    });
    daeItems.push({
      section: 'Default Approved Estimates',
      sectionKey: 'general',
      label: 'Queue',
      value: uniqueQueues.join(', '),
      path: 'General > Default Approved Estimates > Queue',
    });
    daeItems.push({
      section: 'Default Approved Estimates',
      sectionKey: 'general',
      label: 'Default Hours',
      value: uniqueHours.join(', '),
      path: 'General > Default Approved Estimates > Default Hours',
    });
    daeItems.push({
      section: 'Default Approved Estimates',
      sectionKey: 'general',
      label: 'Activation',
      value: uniqueActivations.join(', '),
      path: 'General > Default Approved Estimates > Activation',
    });
    if (uniqueInternalNotes.length > 0) {
      daeItems.push({
        section: 'Default Approved Estimates',
        sectionKey: 'general',
        label: 'Internal Note',
        value: uniqueInternalNotes.join(', '),
        path: 'General > Default Approved Estimates > Internal Note',
      });
    }
  }
  if (daeItems.length > 0) {
    group.subsections.push({
      id: 'default-approved-estimates',
      label: 'Default Approved Estimates (hours)',
      icon: 'D',
      leaves: daeItems,
    });
  }

  const sysItems: ConfigItem[] = [];
  const sys = data.system;
  if (sys) {
    sysItems.push({
      section: 'System',
      sectionKey: 'general',
      label: 'System Name',
      value: sys.systemName || '',
      path: 'General > System > System Name',
    });
    sysItems.push({
      section: 'System',
      sectionKey: 'general',
      label: 'Timezone',
      value: sys.timezone || '',
      path: 'General > System > Timezone',
    });
    sysItems.push({
      section: 'System',
      sectionKey: 'general',
      label: 'Date Format',
      value: sys.dateFormat || '',
      path: 'General > System > Date Format',
    });
    sysItems.push({
      section: 'System',
      sectionKey: 'general',
      label: 'Language',
      value: sys.language || '',
      path: 'General > System > Language',
    });
  }
  if (sysItems.length > 0) {
    group.subsections.push({
      id: 'system',
      label: 'System',
      icon: 'S',
      leaves: sysItems,
    });
  }

  return [group];
}

function buildPrioritiesHierarchy(data: IConfigurationData['priorities']): PageGroup[] {
  const group: PageGroup = {
    key: 'priorities',
    label: 'Priorities',
    icon: 'P',
    color: '#7c3aed',
    subsections: [],
  };

  const levelLeaves: ConfigItem[] = [];
  for (const lv of data.levels ?? []) {
    levelLeaves.push({
      section: 'Priority Levels',
      sectionKey: 'priorities',
      label: lv.name,
      value: lv.description || '',
      path: `Priorities > Priority Levels > ${lv.name}`,
    });
  }
  if (levelLeaves.length > 0) {
    group.subsections.push({
      id: 'priority-levels',
      label: 'Priority Levels',
      icon: 'PL',
      leaves: levelLeaves,
    });
  }

  const impactLeaves: ConfigItem[] = [];
  for (const lv of data.impactLevels ?? []) {
    impactLeaves.push({
      section: 'Impact Levels',
      sectionKey: 'priorities',
      label: lv.displayName || lv.name,
      value: lv.description || '',
      path: `Priorities > Impact Levels > ${lv.displayName || lv.name}`,
    });
  }
  if (impactLeaves.length > 0) {
    group.subsections.push({
      id: 'impact-levels',
      label: 'Impact Levels',
      icon: 'IL',
      leaves: impactLeaves,
    });
  }

  const urgencyLeaves: ConfigItem[] = [];
  for (const lv of data.urgencyLevels ?? []) {
    urgencyLeaves.push({
      section: 'Urgency Levels',
      sectionKey: 'priorities',
      label: lv.displayName || lv.name,
      value: lv.description || '',
      path: `Priorities > Urgency Levels > ${lv.displayName || lv.name}`,
    });
  }
  if (urgencyLeaves.length > 0) {
    group.subsections.push({
      id: 'urgency-levels',
      label: 'Urgency Levels',
      icon: 'UL',
      leaves: urgencyLeaves,
    });
  }

  return [group];
}

function buildStatusesHierarchy(
  data: IConfigurationData['statuses'],
  label: string,
  key: SectionKey,
  color: string,
): PageGroup[] {
  const leaves: ConfigItem[] = [];
  for (const s of data.items ?? []) {
    leaves.push({
      section: label,
      sectionKey: key,
      label: s.displayName || s.name,
      value: s.description || '',
      secondary: [s.statusType, s.color].filter(Boolean).join(', '),
      path: `Configuration > ${label} > ${s.displayName || s.name}`,
    });
  }
  return [
    {
      key,
      label,
      icon: key === 'statuses' ? 'S' : 'RS',
      color,
      subsections: [
        {
          id: `${key}-items`,
          label,
          icon: key === 'statuses' ? 'S' : 'RS',
          leaves,
        },
      ],
    },
  ];
}

function buildSLAHierarchy(data: IConfigurationData['slas']): PageGroup[] {
  const group: PageGroup = {
    key: 'slas',
    label: 'SLAs',
    icon: 'T',
    color: '#d97706',
    subsections: [],
  };

  const ac = data.adminControls;
  if (ac) {
    group.subsections.push({
      id: 'sla-admin',
      label: 'SLA Admin Controls',
      icon: 'S',
      leaves: [
        {
          section: 'SLA Admin Controls',
          sectionKey: 'slas',
          label: 'Default SLA Hours',
          value: ac.defaultSlaHours ? `${ac.defaultSlaHours}h` : 'Not set',
          path: 'SLAs > Admin Controls > Default SLA Hours',
        },
      ],
    });
  }

  const slaLeaves: ConfigItem[] = [];
  for (const sla of data.items ?? []) {
    slaLeaves.push({
      section: 'SLAs',
      sectionKey: 'slas',
      label: sla.name,
      value: sla.name,
      secondary: sla.description || 'SLA',
      path: `SLAs > ${sla.name}`,
    });
  }
  if (slaLeaves.length > 0) {
    group.subsections.push({
      id: 'sla-list',
      label: 'SLA List',
      icon: 'T',
      leaves: slaLeaves,
    });
  }
  return [group];
}

function buildCategorizationHierarchy(data: IConfigurationData['categorization']): PageGroup[] {
  const group: PageGroup = {
    key: 'categorization',
    label: 'Categorization',
    icon: 'C',
    color: '#0891b2',
    subsections: [],
  };

  const bcLeaves: ConfigItem[] = [];
  for (const bc of data.businessCategories ?? [])
    bcLeaves.push({
      section: 'Business Categories',
      sectionKey: 'categorization',
      label: bc.name,
      value: bc.name,
      path: `Categorization > Business Categories > ${bc.name}`,
    });
  if (bcLeaves.length > 0) {
    group.subsections.push({
      id: 'business-categories',
      label: 'Business Categories',
      icon: 'BC',
      leaves: bcLeaves,
    });
  }

  const slLeaves: ConfigItem[] = [];
  for (const sl of data.serviceLines ?? [])
    slLeaves.push({
      section: 'Service Lines',
      sectionKey: 'categorization',
      label: sl.name,
      value: sl.name,
      secondary: `${sl.businessCategoryName}`,
      path: `Categorization > ${sl.businessCategoryName} > Service Lines > ${sl.name}`,
    });
  if (slLeaves.length > 0) {
    group.subsections.push({
      id: 'service-lines',
      label: 'Service Lines',
      icon: 'SL',
      leaves: slLeaves,
    });
  }

  const appLeaves: ConfigItem[] = [];
  for (const app of data.applications ?? [])
    appLeaves.push({
      section: 'Applications',
      sectionKey: 'categorization',
      label: app.name,
      value: app.name,
      secondary: `${app.serviceLineName}`,
      path: `Categorization > ${app.serviceLineName} > Applications > ${app.name}`,
    });
  if (appLeaves.length > 0) {
    group.subsections.push({
      id: 'applications',
      label: 'Applications',
      icon: 'AP',
      leaves: appLeaves,
    });
  }

  const qLeaves: ConfigItem[] = [];
  for (const q of data.queues ?? [])
    qLeaves.push({
      section: 'Queues',
      sectionKey: 'categorization',
      label: q.name,
      value: q.name,
      secondary: `${q.applicationName}`,
      path: `Categorization > ${q.applicationName} > Queues > ${q.name}`,
    });
  if (qLeaves.length > 0) {
    group.subsections.push({
      id: 'queues',
      label: 'Queues',
      icon: 'Q',
      leaves: qLeaves,
    });
  }
  return [group];
}

function buildSimpleHierarchy(
  items: ConfigItem[],
  key: SectionKey,
  label: string,
  icon: string,
  color: string,
  subLabel: string,
  subId: string,
): PageGroup[] {
  const grouped = new Map<string, ConfigItem[]>();
  for (const item of items) {
    const section = item.section || label;
    const arr = grouped.get(section) || [];
    arr.push(item);
    grouped.set(section, arr);
  }
  const subsections: SubSection[] = [];
  for (const [sectionName, leaves] of grouped) {
    subsections.push({
      id: `${key}-${sectionName.toLowerCase().replace(/\s+/g, '-')}`,
      label: sectionName,
      icon,
      leaves,
    });
  }
  return [
    {
      key,
      label,
      icon,
      color,
      subsections,
    },
  ];
}

function buildAllHierarchies(configData: IConfigurationData): PageGroup[] {
  const groups: PageGroup[] = [];
  groups.push(...buildGeneralHierarchy(configData.general));
  groups.push(...buildPrioritiesHierarchy(configData.priorities));
  groups.push(...buildStatusesHierarchy(configData.statuses, 'Statuses', 'statuses', '#16a34a'));
  groups.push(
    ...buildStatusesHierarchy(
      configData.releaseStatuses,
      'Release Statuses',
      'releaseStatuses',
      '#059669',
    ),
  );
  groups.push(...buildSLAHierarchy(configData.slas));

  const catItems: ConfigItem[] = [];
  catItems.push(...extractCategorizationItems(configData.categorization));
  if (catItems.length > 0) groups.push(...buildCategorizationHierarchy(configData.categorization));

  const profileItems = extractProfileItems(configData.consultantProfiles);
  if (profileItems.length > 0)
    groups.push(
      ...buildSimpleHierarchy(
        profileItems,
        'consultantProfiles',
        'Consultant Profiles',
        'CP',
        '#be185d',
        'Profiles',
        'profiles',
      ),
    );

  const approvalItems = extractApprovalItems(configData.approvals);
  if (approvalItems.length > 0)
    groups.push(
      ...buildSimpleHierarchy(
        approvalItems,
        'approvals',
        'Approvals',
        'A',
        '#b45309',
        'Approvals',
        'approval-list',
      ),
    );

  const templateItems = extractTemplateItems(configData);
  if (templateItems.length > 0)
    groups.push(
      ...buildSimpleHierarchy(
        templateItems,
        'ticketUpdateTemplates',
        'Templates',
        'TP',
        '#4f46e5',
        'Templates',
        'template-list',
      ),
    );

  const rcItems = extractReasonCodeItems(configData.reasonCodes);
  if (rcItems.length > 0)
    groups.push(
      ...buildSimpleHierarchy(
        rcItems,
        'reasonCodes',
        'Reason Codes',
        'RC',
        '#dc2626',
        'Reason Codes',
        'rc-list',
      ),
    );

  const tsItems = extractTimesheetItems(configData.timesheets);
  if (tsItems.length > 0)
    groups.push(
      ...buildSimpleHierarchy(
        tsItems,
        'timesheets',
        'Timesheets',
        'TS',
        '#2563eb',
        'Timesheet Periods',
        'ts-list',
      ),
    );

  const exItems = extractExpenseItems(configData.expenses);
  if (exItems.length > 0)
    groups.push(
      ...buildSimpleHierarchy(
        exItems,
        'expenses',
        'Expenses',
        'EX',
        '#059669',
        'Expense Categories',
        'ex-list',
      ),
    );

  const calItems = extractCalendarItems(configData.calendars);
  if (calItems.length > 0)
    groups.push(
      ...buildSimpleHierarchy(
        calItems,
        'calendars',
        'Calendars',
        'CA',
        '#d97706',
        'Calendars',
        'cal-list',
      ),
    );

  const wlItems = extractWorkLocationItems(configData.userConfig);
  if (wlItems.length > 0)
    groups.push(
      ...buildSimpleHierarchy(
        wlItems,
        'userConfig',
        'Work Locations',
        'WL',
        '#0d9488',
        'Work Locations',
        'wl-list',
      ),
    );

  return groups;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const ConfigPathPicker = ({ open, onClose, onSelect }: ConfigPathPickerProps) => {
  const configData = useConfiguration().data;
  const [search, setSearch] = useState('');
  const [activePageKey, setActivePageKey] = useState<SectionKey | null>('general');
  const [expandedSubs, setExpandedSubs] = useState<string[]>([]);

  const allGroups = useMemo<PageGroup[]>(() => {
    if (!configData) return [];
    return buildAllHierarchies(configData);
  }, [configData]);

  // ── Flat search index ─────────────────────────────────────────

  const searchResults = useMemo<ConfigItem[]>(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    const results: ConfigItem[] = [];
    for (const group of allGroups) {
      for (const sub of group.subsections) {
        for (const leaf of sub.leaves) {
          if (
            leaf.label.toLowerCase().includes(q) ||
            leaf.value.toLowerCase().includes(q) ||
            leaf.path.toLowerCase().includes(q)
          ) {
            results.push(leaf);
          }
        }
      }
    }
    return results;
  }, [allGroups, search]);

  // ── Active page group ─────────────────────────────────────────

  const activeGroup = useMemo<PageGroup | null>(() => {
    if (!activePageKey) return null;
    return allGroups.find((g) => g.key === activePageKey) ?? null;
  }, [allGroups, activePageKey]);

  // ── Handlers ──────────────────────────────────────────────────

  const handleSelectLeaf = (leaf: ConfigItem) => {
    onSelect(leaf.label, leaf.path);
    onClose();
  };

  const handleToggleSub = (subId: string) => {
    setExpandedSubs((prev) =>
      prev.includes(subId) ? prev.filter((id) => id !== subId) : [...prev, subId],
    );
  };

  // ── Auto-expand first subsection when page changes ───────────

  const handlePageChange = (key: SectionKey) => {
    setActivePageKey(key);
    setExpandedSubs([]);
    const group = allGroups.find((g) => g.key === key);
    if (group && group.subsections.length > 0) {
      setExpandedSubs([group.subsections[0].id]);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='xl'
      fullWidth
      PaperProps={{ sx: { zIndex: 1500, maxWidth: 1400 } }}
    >
      <DialogTitle sx={{ pb: 1, pt: 2, px: 2.5 }}>
        <Typography variant='h6' sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
          Select Configuration Value
        </Typography>
        <Typography variant='caption' sx={{ color: 'text.secondary' }}>
          Browse and select from all configuration values across the system
        </Typography>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: 520 }}>
        {/* Search bar */}
        <Box sx={{ px: 2.5, pt: 2, pb: 1 }}>
          <InputBase
            placeholder='Search all configuration values...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            startAdornment={
              <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                {search ? (
                  <IconButton size='small' onClick={() => setSearch('')} sx={{ p: 0.25 }}>
                    <ClearIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  </IconButton>
                ) : (
                  <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                )}
              </Box>
            }
            sx={{
              width: '100%',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              px: 1.5,
              py: 0.75,
              fontSize: '0.875rem',
              bgcolor: 'background.paper',
              '&:focus-within': {
                borderColor: '#7c3aed',
                boxShadow: '0 0 0 2px rgba(124,58,237,0.1)',
              },
            }}
          />
        </Box>

        {/* Global search results */}
        {search.trim().length > 0 && (
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              mx: 2,
              mb: 1,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              bgcolor: 'background.paper',
            }}
          >
            {searchResults.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center', color: 'text.disabled' }}>No results found</Box>
            ) : (
              <List dense disablePadding>
                {searchResults.map((item, idx) => (
                  <ListItem key={`search-${item.sectionKey}-${item.label}-${idx}`} disablePadding>
                    <ListItemButton
                      onClick={() => handleSelectLeaf(item)}
                      sx={{
                        py: 1,
                        px: 2,
                        '&:hover': { bgcolor: 'rgba(124,58,237,0.08)' },
                        borderBottom: idx < searchResults.length - 1 ? '1px solid' : 'none',
                        borderColor: 'divider',
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Chip
                          label={SECTION_ICONS[item.sectionKey] || '?'}
                          size='small'
                          sx={{
                            height: 22,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            bgcolor: CATEGORY_COLORS[item.sectionKey] || '#666',
                            color: '#fff',
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        secondary={item.path}
                        primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500 }}
                        secondaryTypographyProps={{ fontSize: '0.72rem', color: 'text.secondary' }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}

        {/* 3-column hierarchical browse */}
        {!search.trim() && (
          <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden', mt: 0.5 }}>
            {/* Column 1: Pages list */}
            <Box
              sx={{
                width: 160,
                borderRight: '1px solid',
                borderColor: 'divider',
                overflowY: 'auto',
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  px: 1.5,
                  py: 1,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography
                  variant='caption'
                  sx={{
                    fontWeight: 700,
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  Pages
                </Typography>
              </Box>
              {allGroups.map((group) => {
                const isActive = group.key === activePageKey;
                return (
                  <Box
                    key={group.key}
                    onClick={() => handlePageChange(group.key)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      px: 1.5,
                      py: 1.1,
                      cursor: 'pointer',
                      bgcolor: isActive ? 'rgba(124,58,237,0.08)' : 'transparent',
                      borderLeft: isActive ? '3px solid #7c3aed' : '3px solid transparent',
                      '&:hover': {
                        bgcolor: isActive ? 'rgba(124,58,237,0.08)' : 'action.hover',
                      },
                    }}
                  >
                    <Chip
                      label={group.icon}
                      size='small'
                      sx={{
                        height: 22,
                        width: 22,
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        bgcolor: group.color,
                        color: '#fff',
                        '& .MuiChip-label': { px: 0.5 },
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: '0.78rem',
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? '#7c3aed' : 'text.primary',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {group.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            {/* Columns 2 & 3: Subsections + Leaves */}
            <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              {/* Column 2: Accordions */}
              <Box
                sx={{
                  width: 240,
                  borderRight: '1px solid',
                  borderColor: 'divider',
                  overflowY: 'auto',
                  flexShrink: 0,
                }}
              >
                {activeGroup ? (
                  activeGroup.subsections.map((sub) => {
                    const isExpanded = expandedSubs.includes(sub.id);
                    const leafCount = sub.leaves.length;
                    return (
                      <Accordion
                        key={sub.id}
                        expanded={isExpanded}
                        onChange={() => handleToggleSub(sub.id)}
                        disableGutters
                        elevation={0}
                        sx={{
                          '&:before': { display: 'none' },
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon sx={{ fontSize: '1rem' }} />}
                          sx={{
                            minHeight: 42,
                            '& .MuiAccordionSummary-content': { my: 0.5 },
                            '&.Mui-expanded': { minHeight: 42 },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={sub.icon}
                              size='small'
                              sx={{
                                height: 20,
                                fontSize: '0.6rem',
                                fontWeight: 700,
                                bgcolor: 'rgba(124,58,237,0.12)',
                                color: '#7c3aed',
                                '& .MuiChip-label': { px: 0.5 },
                              }}
                            />
                            <Box>
                              <Typography
                                sx={{
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                  lineHeight: 1.2,
                                }}
                              >
                                {sub.label}
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: '0.65rem',
                                  color: 'text.secondary',
                                }}
                              >
                                {leafCount} item{leafCount !== 1 ? 's' : ''}
                              </Typography>
                            </Box>
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails sx={{ py: 0, px: 0 }}>
                          {/* leaf list preview in column 2 */}
                          {isExpanded && (
                            <Box sx={{ px: 1.5, pb: 1.5 }}>
                              {sub.leaves.slice(0, 5).map((leaf) => (
                                <Typography
                                  key={leaf.id || leaf.label}
                                  variant='caption'
                                  sx={{
                                    display: 'block',
                                    fontSize: '0.7rem',
                                    color: 'text.secondary',
                                    py: 0.3,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  &middot; {leaf.label}
                                </Typography>
                              ))}
                              {sub.leaves.length > 5 && (
                                <Typography
                                  variant='caption'
                                  sx={{
                                    fontSize: '0.65rem',
                                    color: '#7c3aed',
                                    display: 'block',
                                    mt: 0.3,
                                  }}
                                >
                                  +{sub.leaves.length - 5} more
                                </Typography>
                              )}
                            </Box>
                          )}
                        </AccordionDetails>
                      </Accordion>
                    );
                  })
                ) : (
                  <Box
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      color: 'text.disabled',
                      fontSize: '0.85rem',
                    }}
                  >
                    Select a page to browse configuration
                  </Box>
                )}
              </Box>

              {/* Column 3: Leaf items */}
              <Box sx={{ flex: 1, overflowY: 'auto', mx: 1, mb: 1 }}>
                {activeGroup ? (
                  activeGroup.subsections
                    .filter((sub) => expandedSubs.includes(sub.id))
                    .map((sub) => (
                      <Box key={sub.id} sx={{ mb: 1 }}>
                        <Typography
                          sx={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: 'text.secondary',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                            px: 1,
                            py: 0.75,
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          {sub.label}
                        </Typography>
                        <List dense disablePadding>
                          {sub.leaves.map((leaf, idx) => (
                            <ListItem key={leaf.label + leaf.value} disablePadding>
                              <ListItemButton
                                onClick={() => handleSelectLeaf(leaf)}
                                sx={{
                                  py: 1,
                                  px: 2,
                                  '&:hover': { bgcolor: 'rgba(124,58,237,0.08)' },
                                  borderBottom: idx < sub.leaves.length - 1 ? '1px solid' : 'none',
                                  borderColor: 'divider',
                                }}
                              >
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                  <Chip
                                    label={sub.icon}
                                    size='small'
                                    sx={{
                                      height: 22,
                                      fontSize: '0.6rem',
                                      fontWeight: 700,
                                      bgcolor: 'rgba(124,58,237,0.12)',
                                      color: '#7c3aed',
                                    }}
                                  />
                                </ListItemIcon>
                                <ListItemText
                                  primary={leaf.label}
                                  secondary={
                                    <Box component='span'>
                                      {leaf.value && (
                                        <Typography
                                          component='span'
                                          sx={{ fontSize: '0.75rem', color: 'text.secondary' }}
                                        >
                                          {leaf.value}
                                        </Typography>
                                      )}
                                      {leaf.secondary && (
                                        <Typography
                                          component='span'
                                          sx={{
                                            fontSize: '0.65rem',
                                            color: 'text.disabled',
                                            ml: 1,
                                          }}
                                        >
                                          {leaf.secondary}
                                        </Typography>
                                      )}
                                    </Box>
                                  }
                                  primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500 }}
                                />
                              </ListItemButton>
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    ))
                ) : (
                  <Box
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      color: 'text.disabled',
                      fontSize: '0.85rem',
                    }}
                  >
                    Select a subsection to view items
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 2.5, py: 1.5 }}>
        <Button onClick={onClose} variant='outlined' sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfigPathPicker;
export type { ConfigPathPickerProps };
