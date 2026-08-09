import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Tabs,
  Tab,
  Divider,
  Button,
} from '@serviceops/component';
import {
  ListItemButton,
  InputBase,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Clear as ClearIcon, Search as SearchIcon } from '@mui/icons-material';
import { useConfiguration } from '@serviceops/confighooks';
import type { IConfigurationData } from '@serviceops/interfaces';

/* ------------------------------------------------------------------ */
/*  Shape of one configurable item shown in the picker                   */
/* ------------------------------------------------------------------ */

type ConfigSectionKey = keyof IConfigurationData;

interface ConfigItem {
  section: string;
  sectionKey: ConfigSectionKey;
  label: string;
  value: string;
  path: string;
  secondary?: string;
}

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
  }
  const dae = pluck(data, 'defaultApprovedEstimates');
  if (dae) {
    const hours = pluck(dae, 'defaultApprovedEstimateHours');
    items.push({
      section: 'Default Approved Estimates',
      sectionKey: 'general',
      label: 'Default Approved Estimate Hours',
      value: hours !== null ? String(hours) : 'Not set',
      secondary: 'Default hours',
      path: 'General > Default Approved Estimates > Default Approved Estimate Hours',
    });
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

function extractStatusItems(
  data: any,
  sectionName: string,
  sectionKey: ConfigSectionKey,
): ConfigItem[] {
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
  const tmplMap: { name: string; key: string; sectionKey: ConfigSectionKey }[] = [
    { name: 'Ticket Update', key: 'ticketUpdateTemplates', sectionKey: 'ticketUpdateTemplates' },
    { name: 'Comment', key: 'commentTemplates', sectionKey: 'commentTemplates' },
    { name: 'Internal Note', key: 'internalNoteTemplates', sectionKey: 'internalNoteTemplates' },
    { name: 'Resolution', key: 'resolutionTemplates', sectionKey: 'resolutionTemplates' },
    { name: 'Time Entry', key: 'timeEntryTemplates', sectionKey: 'timeEntryTemplates' },
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
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface ConfigPathPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (label: string, value: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Static section map                                                  */
/* ------------------------------------------------------------------ */

const ALL_SECTIONS: { key: ConfigSectionKey; label: string }[] = [
  { key: 'general', label: 'General' },
  { key: 'priorities', label: 'Priorities' },
  { key: 'statuses', label: 'Statuses' },
  { key: 'releaseStatuses', label: 'Release Statuses' },
  { key: 'slas', label: 'SLAs' },
  { key: 'categorization', label: 'Categorization' },
  { key: 'consultantProfiles', label: 'Consultant Profiles' },
  { key: 'approvals', label: 'Approvals' },
  { key: 'ticketUpdateTemplates', label: 'Templates' },
  { key: 'reasonCodes', label: 'Reason Codes' },
  { key: 'timesheets', label: 'Timesheets' },
  { key: 'expenses', label: 'Expenses' },
  { key: 'calendars', label: 'Calendars' },
  { key: 'userConfig', label: 'Work Locations' },
  { key: 'userManagement', label: 'User Management' },
  { key: 'clientsAndProjects', label: 'Clients & Projects' },
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
  userManagement: '#6d28d9',
  clientsAndProjects: '#0891b2',
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
  userManagement: 'UM',
  clientsAndProjects: 'CL',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const ConfigPathPicker = ({ open, onClose, onSelect }: ConfigPathPickerProps) => {
  const configData = useConfiguration().data;
  const [search, setSearch] = useState('');
  const [activeSection, setActiveSection] = useState<ConfigSectionKey>('general');

  const allItems = useMemo<ConfigItem[]>(() => {
    if (!configData) return [];
    const items: ConfigItem[] = [];
    items.push(...extractGeneralItems(configData.general));
    items.push(...extractPriorityItems(configData.priorities));
    items.push(...extractStatusItems(configData.statuses, 'Statuses', 'statuses'));
    items.push(
      ...extractStatusItems(configData.releaseStatuses, 'Release Statuses', 'releaseStatuses'),
    );
    items.push(...extractSLAItems(configData.slas));
    items.push(...extractCategorizationItems(configData.categorization));
    items.push(...extractProfileItems(configData.consultantProfiles));
    items.push(...extractApprovalItems(configData.approvals));
    items.push(...extractTemplateItems(configData));
    items.push(...extractReasonCodeItems(configData.reasonCodes));
    items.push(...extractTimesheetItems(configData.timesheets));
    items.push(...extractExpenseItems(configData.expenses));
    items.push(...extractCalendarItems(configData.calendars));
    items.push(...extractWorkLocationItems(configData.userConfig));
    return items;
  }, [configData]);

  const filteredItems = useMemo(() => {
    let items = allItems.filter((item) => item.sectionKey === activeSection);
    const q = search.trim().toLowerCase();
    if (q)
      items = items.filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          item.value.toLowerCase().includes(q) ||
          item.section.toLowerCase().includes(q),
      );
    return items;
  }, [allItems, activeSection, search]);

  const globalSearchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return null;
    return allItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.value.toLowerCase().includes(q) ||
        item.section.toLowerCase().includes(q),
    );
  }, [allItems, search]);

  const handleSelect = (item: ConfigItem) => {
    onSelect(item.path, item.path);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
      PaperProps={{ sx: { zIndex: 1500 } }}
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

        {globalSearchResults && (
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
            {globalSearchResults.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center', color: 'text.disabled' }}>No results found</Box>
            ) : (
              <List dense disablePadding>
                {globalSearchResults.map((item, idx) => (
                  <ListItem key={`${item.sectionKey}-${item.label}-${idx}`} disablePadding>
                    <ListItemButton
                      onClick={() => handleSelect(item)}
                      sx={{ py: 1, px: 2, '&:hover': { bgcolor: 'rgba(124,58,237,0.08)' } }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Chip
                          label={SECTION_ICONS[item.sectionKey] || item.section.charAt(0)}
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
                        secondary={item.section}
                        primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500 }}
                        secondaryTypographyProps={{ fontSize: '0.75rem' }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}

        {!globalSearchResults && (
          <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden', mt: 0.5 }}>
            <Box
              sx={{
                width: 180,
                borderRight: '1px solid',
                borderColor: 'divider',
                overflowY: 'auto',
                flexShrink: 0,
              }}
            >
              <Tabs
                orientation='vertical'
                value={ALL_SECTIONS.findIndex((s) => s.key === activeSection)}
                onChange={(_, v) => setActiveSection(ALL_SECTIONS[v].key)}
                variant='scrollable'
                scrollButtons='auto'
                sx={{
                  '& .MuiTab-root': {
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    textTransform: 'none',
                    fontSize: '0.78rem',
                    minHeight: 40,
                    py: 1,
                    px: 1.5,
                  },
                  '& .Mui-selected': { color: '#7c3aed', fontWeight: 600 },
                  '& .MuiTabs-indicator': { backgroundColor: '#7c3aed', width: 3 },
                }}
              >
                {ALL_SECTIONS.map((s) => (
                  <Tab key={s.key} label={s.label} />
                ))}
              </Tabs>
            </Box>
            <Box sx={{ flex: 1, overflowY: 'auto', mx: 1.5, mb: 1 }}>
              {filteredItems.length === 0 ? (
                <Box
                  sx={{ p: 3, textAlign: 'center', color: 'text.disabled', fontSize: '0.85rem' }}
                >
                  No items in this section
                </Box>
              ) : (
                <List dense disablePadding>
                  {filteredItems.map((item, idx) => (
                    <ListItem key={`${item.sectionKey}-${item.label}-${idx}`} disablePadding>
                      <ListItemButton
                        onClick={() => handleSelect(item)}
                        sx={{
                          py: 1,
                          px: 2,
                          '&:hover': { bgcolor: 'rgba(124,58,237,0.08)' },
                          borderBottom: idx < filteredItems.length - 1 ? '1px solid' : 'none',
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
                          secondary={item.secondary ? item.value : item.section}
                          primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500 }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              )}
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
