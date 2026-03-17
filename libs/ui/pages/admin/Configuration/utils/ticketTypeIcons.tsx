import React from 'react';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import BugReportIcon from '@mui/icons-material/BugReport';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ComputerIcon from '@mui/icons-material/Computer';
import StorageIcon from '@mui/icons-material/Storage';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import GroupIcon from '@mui/icons-material/Group';
import SecurityIcon from '@mui/icons-material/Security';
import DashboardIcon from '@mui/icons-material/Dashboard';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import EventNoteIcon from '@mui/icons-material/EventNote';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SettingsIcon from '@mui/icons-material/Settings';
import ApiIcon from '@mui/icons-material/Api';
import AssignmentIcon from '@mui/icons-material/Assignment';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import LockIcon from '@mui/icons-material/Lock';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import TimelineIcon from '@mui/icons-material/Timeline';
import HubIcon from '@mui/icons-material/Hub';
import DnsIcon from '@mui/icons-material/Dns';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
import PublishedWithChangesIcon from '@mui/icons-material/PublishedWithChanges';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import GppGoodIcon from '@mui/icons-material/GppGood';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import DevicesIcon from '@mui/icons-material/Devices';
import RouterIcon from '@mui/icons-material/Router';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import BackupIcon from '@mui/icons-material/Backup';
import SpeedIcon from '@mui/icons-material/Speed';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import ArticleIcon from '@mui/icons-material/Article';
import PolicyIcon from '@mui/icons-material/Policy';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import BadgeIcon from '@mui/icons-material/Badge';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TuneIcon from '@mui/icons-material/Tune';
import EngineeringIcon from '@mui/icons-material/Engineering';
import ConstructionIcon from '@mui/icons-material/Construction';
import WebhookIcon from '@mui/icons-material/Webhook';
import CodeIcon from '@mui/icons-material/Code';
import LayersIcon from '@mui/icons-material/Layers';
import AppsIcon from '@mui/icons-material/Apps';
import CategoryIcon from '@mui/icons-material/Category';
import LowPriorityIcon from '@mui/icons-material/LowPriority';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import FlagIcon from '@mui/icons-material/Flag';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

export interface TicketIconOption {
  key: string;
  label: string;
  category: string;
  icon: React.ReactElement;
}

export const TICKET_ICON_OPTIONS: TicketIconOption[] = [
  // ── Incidents & Alerts ────────────────────────────
  {
    key: 'warning_amber',
    label: 'Incident Alert',
    category: 'Incidents & Alerts',
    icon: <WarningAmberIcon />,
  },
  {
    key: 'report_problem',
    label: 'Report Problem',
    category: 'Incidents & Alerts',
    icon: <ReportProblemIcon />,
  },
  {
    key: 'error_outline',
    label: 'Error / Fault',
    category: 'Incidents & Alerts',
    icon: <ErrorOutlineIcon />,
  },
  {
    key: 'notifications_active',
    label: 'Active Alert',
    category: 'Incidents & Alerts',
    icon: <NotificationsActiveIcon />,
  },
  {
    key: 'priority_high',
    label: 'High Priority',
    category: 'Incidents & Alerts',
    icon: <PriorityHighIcon />,
  },
  { key: 'flag', label: 'Flagged Issue', category: 'Incidents & Alerts', icon: <FlagIcon /> },
  {
    key: 'assignment_late',
    label: 'Overdue / SLA Breach',
    category: 'Incidents & Alerts',
    icon: <AssignmentLateIcon />,
  },

  // ── Service Desk & Requests ───────────────────────
  {
    key: 'support_agent',
    label: 'Service Desk',
    category: 'Service Desk & Requests',
    icon: <SupportAgentIcon />,
  },
  {
    key: 'headset_mic',
    label: 'Help Desk Agent',
    category: 'Service Desk & Requests',
    icon: <HeadsetMicIcon />,
  },
  {
    key: 'shopping_cart',
    label: 'Service Catalog',
    category: 'Service Desk & Requests',
    icon: <ShoppingCartIcon />,
  },
  {
    key: 'assignment',
    label: 'Work Order',
    category: 'Service Desk & Requests',
    icon: <AssignmentIcon />,
  },
  {
    key: 'receipt_long',
    label: 'Ticket / Record',
    category: 'Service Desk & Requests',
    icon: <ReceiptLongIcon />,
  },
  {
    key: 'low_priority',
    label: 'Low Priority Request',
    category: 'Service Desk & Requests',
    icon: <LowPriorityIcon />,
  },
  {
    key: 'category',
    label: 'Service Category',
    category: 'Service Desk & Requests',
    icon: <CategoryIcon />,
  },

  // ── Change & Release ──────────────────────────────
  {
    key: 'change_circle',
    label: 'Change Request',
    category: 'Change & Release',
    icon: <ChangeCircleIcon />,
  },
  {
    key: 'published_with_changes',
    label: 'Published Change',
    category: 'Change & Release',
    icon: <PublishedWithChangesIcon />,
  },
  {
    key: 'rocket_launch',
    label: 'Release / Deploy',
    category: 'Change & Release',
    icon: <RocketLaunchIcon />,
  },
  {
    key: 'cloud_upload',
    label: 'Cloud Deploy',
    category: 'Change & Release',
    icon: <CloudUploadIcon />,
  },
  {
    key: 'autorenew',
    label: 'Recurring / Rollback',
    category: 'Change & Release',
    icon: <AutorenewIcon />,
  },

  // ── Problem & Root Cause ──────────────────────────
  {
    key: 'bug_report',
    label: 'Problem / Bug',
    category: 'Problem Management',
    icon: <BugReportIcon />,
  },
  {
    key: 'monitor_heart',
    label: 'Service Health',
    category: 'Problem Management',
    icon: <MonitorHeartIcon />,
  },
  {
    key: 'manage_history',
    label: 'Root Cause History',
    category: 'Problem Management',
    icon: <ManageHistoryIcon />,
  },
  { key: 'speed', label: 'Performance Issue', category: 'Problem Management', icon: <SpeedIcon /> },

  // ── Tasks & Workflow ──────────────────────────────
  { key: 'task_alt', label: 'Task', category: 'Tasks & Workflow', icon: <TaskAltIcon /> },
  {
    key: 'check_circle',
    label: 'Approval / Completed',
    category: 'Tasks & Workflow',
    icon: <CheckCircleIcon />,
  },
  { key: 'thumb_up', label: 'Approved', category: 'Tasks & Workflow', icon: <ThumbUpIcon /> },
  {
    key: 'account_tree',
    label: 'Workflow / Process',
    category: 'Tasks & Workflow',
    icon: <AccountTreeIcon />,
  },
  {
    key: 'timeline',
    label: 'Project Timeline',
    category: 'Tasks & Workflow',
    icon: <TimelineIcon />,
  },
  { key: 'layers', label: 'Layered Process', category: 'Tasks & Workflow', icon: <LayersIcon /> },

  // ── Knowledge & Reporting ─────────────────────────
  {
    key: 'menu_book',
    label: 'Knowledge Base',
    category: 'Knowledge & Reporting',
    icon: <MenuBookIcon />,
  },
  {
    key: 'library_books',
    label: 'Document Library',
    category: 'Knowledge & Reporting',
    icon: <LibraryBooksIcon />,
  },
  {
    key: 'article',
    label: 'Article / FAQ',
    category: 'Knowledge & Reporting',
    icon: <ArticleIcon />,
  },
  {
    key: 'analytics',
    label: 'Analytics / Reports',
    category: 'Knowledge & Reporting',
    icon: <AnalyticsIcon />,
  },
  {
    key: 'assessment',
    label: 'Assessment / Audit',
    category: 'Knowledge & Reporting',
    icon: <AssessmentIcon />,
  },
  {
    key: 'event_note',
    label: 'Event Log',
    category: 'Knowledge & Reporting',
    icon: <EventNoteIcon />,
  },
  {
    key: 'dashboard',
    label: 'Dashboard',
    category: 'Knowledge & Reporting',
    icon: <DashboardIcon />,
  },

  // ── Infrastructure & Assets ───────────────────────
  {
    key: 'computer',
    label: 'Hardware Asset',
    category: 'Infrastructure & Assets',
    icon: <ComputerIcon />,
  },
  {
    key: 'devices',
    label: 'End-User Devices',
    category: 'Infrastructure & Assets',
    icon: <DevicesIcon />,
  },
  {
    key: 'storage',
    label: 'Database / CMDB',
    category: 'Infrastructure & Assets',
    icon: <StorageIcon />,
  },
  {
    key: 'inventory_2',
    label: 'Inventory',
    category: 'Infrastructure & Assets',
    icon: <Inventory2Icon />,
  },
  { key: 'dns', label: 'DNS / Server', category: 'Infrastructure & Assets', icon: <DnsIcon /> },
  {
    key: 'router',
    label: 'Network / Router',
    category: 'Infrastructure & Assets',
    icon: <RouterIcon />,
  },
  { key: 'hub', label: 'Network Hub', category: 'Infrastructure & Assets', icon: <HubIcon /> },
  {
    key: 'cloud_queue',
    label: 'Cloud Resource',
    category: 'Infrastructure & Assets',
    icon: <CloudQueueIcon />,
  },
  {
    key: 'cloud_sync',
    label: 'Cloud Sync',
    category: 'Infrastructure & Assets',
    icon: <CloudSyncIcon />,
  },
  { key: 'backup', label: 'Backup', category: 'Infrastructure & Assets', icon: <BackupIcon /> },

  // ── Security & Compliance ─────────────────────────
  { key: 'security', label: 'Security', category: 'Security & Compliance', icon: <SecurityIcon /> },
  { key: 'lock', label: 'Access Control', category: 'Security & Compliance', icon: <LockIcon /> },
  {
    key: 'verified_user',
    label: 'Compliance / Audit',
    category: 'Security & Compliance',
    icon: <VerifiedUserIcon />,
  },
  {
    key: 'gpp_good',
    label: 'Policy Compliant',
    category: 'Security & Compliance',
    icon: <GppGoodIcon />,
  },
  {
    key: 'policy',
    label: 'Policy / Governance',
    category: 'Security & Compliance',
    icon: <PolicyIcon />,
  },
  {
    key: 'admin_panel_settings',
    label: 'Admin / Privilege',
    category: 'Security & Compliance',
    icon: <AdminPanelSettingsIcon />,
  },

  // ── People & Operations ───────────────────────────
  { key: 'group', label: 'Team / Group', category: 'People & Operations', icon: <GroupIcon /> },
  {
    key: 'people_alt',
    label: 'HR / Stakeholders',
    category: 'People & Operations',
    icon: <PeopleAltIcon />,
  },
  {
    key: 'manage_accounts',
    label: 'Manage Accounts',
    category: 'People & Operations',
    icon: <ManageAccountsIcon />,
  },
  { key: 'badge', label: 'Employee / Badge', category: 'People & Operations', icon: <BadgeIcon /> },
  {
    key: 'schedule',
    label: 'SLA / Schedule',
    category: 'People & Operations',
    icon: <ScheduleIcon />,
  },
  {
    key: 'access_time',
    label: 'Time Tracking',
    category: 'People & Operations',
    icon: <AccessTimeIcon />,
  },
  {
    key: 'calendar_month',
    label: 'Calendar / Planning',
    category: 'People & Operations',
    icon: <CalendarMonthIcon />,
  },

  // ── Configuration & Integration ───────────────────
  {
    key: 'settings',
    label: 'Configuration',
    category: 'Config & Integration',
    icon: <SettingsIcon />,
  },
  {
    key: 'tune',
    label: 'Fine Tune / Parameters',
    category: 'Config & Integration',
    icon: <TuneIcon />,
  },
  {
    key: 'build_circle',
    label: 'Maintenance',
    category: 'Config & Integration',
    icon: <BuildCircleIcon />,
  },
  {
    key: 'engineering',
    label: 'Engineering',
    category: 'Config & Integration',
    icon: <EngineeringIcon />,
  },
  {
    key: 'construction',
    label: 'Under Construction',
    category: 'Config & Integration',
    icon: <ConstructionIcon />,
  },
  {
    key: 'miscellaneous_services',
    label: 'Misc. Services',
    category: 'Config & Integration',
    icon: <MiscellaneousServicesIcon />,
  },
  { key: 'api', label: 'API / REST', category: 'Config & Integration', icon: <ApiIcon /> },
  {
    key: 'webhook',
    label: 'Webhook / Trigger',
    category: 'Config & Integration',
    icon: <WebhookIcon />,
  },
  {
    key: 'integration_instructions',
    label: 'Integration Guide',
    category: 'Config & Integration',
    icon: <IntegrationInstructionsIcon />,
  },
  { key: 'code', label: 'Custom Script', category: 'Config & Integration', icon: <CodeIcon /> },
  { key: 'apps', label: 'Applications', category: 'Config & Integration', icon: <AppsIcon /> },
];

// ─────────────────────────────────────────────────────────────
// TAG / PRIORITY OPTIONS
// ─────────────────────────────────────────────────────────────
export interface TicketTagOption {
  value: string;
  label: string;
  color: string;
}

export const TICKET_TAG_OPTIONS: TicketTagOption[] = [
  { value: 'Critical', label: 'Critical', color: '#ef4444' }, // red
  { value: 'Major', label: 'Major', color: '#f97316' }, // orange
  { value: 'Planned', label: 'Planned', color: '#eab308' }, // yellow
  { value: 'Low', label: 'Low', color: '#22c55e' }, // green
  { value: 'Root Cause', label: 'Root Cause', color: '#14b8a6' }, // teal
  { value: 'Standard', label: 'Standard', color: '#3b82f6' }, // blue
  { value: 'Routine', label: 'Routine', color: '#6366f1' }, // indigo
  { value: 'Advisory', label: 'Advisory', color: '#a855f7' }, // purple
  { value: 'Grouped', label: 'Grouped', color: '#ec4899' }, // pink
  { value: 'Informational', label: 'Informational', color: '#64748b' }, // slate
];

/** Default tags for built-in ticket types */
export const DEFAULT_TYPE_TAGS: Record<string, string> = {
  incident: 'Critical',
  service_request: 'Standard',
  change_request: 'Planned',
  problem_request: 'Root Cause',
  task: 'Routine',
  ticket_template: 'Grouped',
};

export function getTagOption(value: string): TicketTagOption | undefined {
  return TICKET_TAG_OPTIONS.find((t) => t.value === value);
}

const TAG_STORAGE_KEY = 'picks_ticket_type_tags';

export function loadTagMap(): Record<string, string> {
  try {
    const stored = localStorage.getItem(TAG_STORAGE_KEY);
    const base: Record<string, string> = stored ? JSON.parse(stored) : {};
    return { ...DEFAULT_TYPE_TAGS, ...base };
  } catch {
    return { ...DEFAULT_TYPE_TAGS };
  }
}

export function saveTagMap(map: Record<string, string>): void {
  try {
    localStorage.setItem(TAG_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

/** Default icons matching ServiceNow ITSM conventions */
export const DEFAULT_TYPE_ICONS: Record<string, string> = {
  incident: 'warning_amber',
  service_request: 'support_agent',
  change_request: 'change_circle',
  problem_request: 'bug_report',
  task: 'task_alt',
  ticket_template: 'receipt_long',
};

export const TYPE_COLORS: Record<string, string> = {
  incident: '#ef4444',
  service_request: '#3b82f6',
  change_request: '#f59e0b',
  problem_request: '#8b5cf6',
  task: '#10b981',
  ticket_template: '#6366f1',
};

export const TYPE_GRADIENTS: Record<string, string> = {
  incident: 'linear-gradient(135deg, #d32f2f 0%, #ef5350 100%)',
  service_request: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
  change_request: 'linear-gradient(135deg, #e65100 0%, #fb8c00 100%)',
  problem_request: 'linear-gradient(135deg, #4527a0 0%, #7b1fa2 100%)',
  task: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
  ticket_template: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
};

export function getIconOption(key: string): TicketIconOption | undefined {
  return TICKET_ICON_OPTIONS.find((o) => o.key === key);
}

export function getIconComponent(key: string, sx?: object): React.ReactElement {
  const opt = getIconOption(key);
  if (!opt) return <WarningAmberIcon sx={sx} />;
  return React.cloneElement(opt.icon as React.ReactElement<{ sx?: object }>, { sx });
}

export function getTypeColor(type: string): string {
  return TYPE_COLORS[type] || '#64748b';
}

export function getTypeGradient(type: string): string {
  return TYPE_GRADIENTS[type] || 'linear-gradient(135deg, #475569 0%, #64748b 100%)';
}

const STORAGE_KEY = 'picks_ticket_type_icons';

export function loadIconMap(): Record<string, string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const base: Record<string, string> = stored ? JSON.parse(stored) : {};
    return { ...DEFAULT_TYPE_ICONS, ...base };
  } catch {
    return { ...DEFAULT_TYPE_ICONS };
  }
}

export function saveIconMap(map: Record<string, string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}
