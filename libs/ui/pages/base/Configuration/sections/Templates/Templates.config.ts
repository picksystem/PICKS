import FileCopyIcon from '@mui/icons-material/FileCopy';
import CommentIcon from '@mui/icons-material/Comment';
import { BoolFormKey, TemplateForm, TemplateTableConfig } from './Templates.types';

export const TEMPLATE_TABLES: TemplateTableConfig[] = [
  {
    id: 'ticketUpdate',
    title: 'Ticket Update Template',
    subtitle: 'Define reusable templates for ticket status updates and customer notifications',
    accent: '#4f46e5',
    gradientEnd: '#7c3aed',
    icon: FileCopyIcon,
    idPrefix: 'tut',
    defaultExpanded: true,
  },
  {
    id: 'comment',
    title: 'Comment Template',
    subtitle: 'Define reusable comment templates for internal notes and customer replies',
    accent: '#0891b2',
    gradientEnd: '#0e7490',
    icon: CommentIcon,
    idPrefix: 'ct',
    boolFields: [
      { key: 'internalNote', label: 'Internal Note', hint: 'Visible to agents only' },
      {
        key: 'notifyAssigneesOnly',
        label: 'Notify Assignees Only',
        hint: 'Limit email notifications',
      },
      { key: 'selfNote', label: 'Self Note', hint: 'Only visible to you' },
      {
        key: 'appendToResolution',
        label: 'Append to Resolution',
        hint: 'Add content to resolution notes',
      },
    ],
  },
  {
    id: 'internalNote',
    title: 'Internal Note Template',
    subtitle: 'Define reusable internal note templates with customer-visible comment options',
    accent: '#059669',
    gradientEnd: '#047857',
    icon: CommentIcon,
    idPrefix: 'int',
    boolFields: [
      {
        key: 'internalNote',
        label: 'Comment (Customer Visible)',
        hint: 'Comment visible to the customer',
      },
      {
        key: 'notifyAssigneesOnly',
        label: 'Notify Assignees Only',
        hint: 'Limit email notifications',
      },
      { key: 'selfNote', label: 'Self Note', hint: 'Only visible to you' },
      {
        key: 'appendToResolution',
        label: 'Append to Resolution',
        hint: 'Add content to resolution notes',
      },
    ],
  },
];

export const DEFAULT_BOOL_FIELDS: { key: BoolFormKey; label: string; hint: string }[] = [
  { key: 'internalNote', label: 'Internal Note', hint: 'Visible to agents only' },
  { key: 'notifyAssigneesOnly', label: 'Notify Assignees Only', hint: 'Limit email notifications' },
  { key: 'selfNote', label: 'Self Note', hint: 'Only visible to you' },
  {
    key: 'appendToResolution',
    label: 'Append to Resolution',
    hint: 'Add content to resolution notes',
  },
];

export const EMPTY_FORM: TemplateForm = {
  name: '',
  description: '',
  active: true,
  ticketStatus: '',
  subjectLine: '',
  commentDescription: '',
  internalNote: false,
  notifyAssigneesOnly: false,
  selfNote: false,
  appendToResolution: false,
};
