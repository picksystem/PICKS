import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { Column } from '@serviceops/component';
import { mkCell } from '@serviceops/configutils';
import type { TableConfig } from '@serviceops/genericpanel';
import type { IConfigProjectJournal } from '@serviceops/interfaces';

export const ACCENT = '#0369a1';

export const PROJECT_JOURNALS_ICON = <ReceiptLongIcon sx={{ fontSize: '1.1rem' }} />;

// ── Column Definitions ─────────────────────────────────────────────────────────

export const projectJournalColumns: Column<IConfigProjectJournal>[] = [
  { id: 'journalId', label: 'Journal ID', minWidth: 120, format: mkCell(true) },
  { id: 'transactionType', label: 'Transaction Type', minWidth: 150, format: mkCell() },
  { id: 'createdDateTime', label: 'Created Date and Time', minWidth: 170, format: mkCell() },
  { id: 'createdBy', label: 'Created By', minWidth: 130, format: mkCell() },
  { id: 'postingDate', label: 'Posting Date', minWidth: 130, format: mkCell() },
  { id: 'postedBy', label: 'Posted By', minWidth: 130, format: mkCell() },
  { id: 'status', label: 'Status', minWidth: 120, format: mkCell() },
  { id: 'approvedBy', label: 'Approved By', minWidth: 130, format: mkCell() },
  { id: 'approvedDateTime', label: 'Approved Date and Time', minWidth: 170, format: mkCell() },
];

// ── Table Config ───────────────────────────────────────────────────────────────

export const PROJECT_JOURNALS_TABLE_CONFIG: TableConfig = {
  title: 'Project Journals',
  subtitle: 'Track project journal transactions and their approval status',
  accent: ACCENT,
  icon: PROJECT_JOURNALS_ICON,
  entity: 'Project Journal',
  fields: [
    { name: 'journalId', label: 'Journal ID', required: true, bold: true },
    { name: 'transactionType', label: 'Transaction Type' },
    { name: 'createdDateTime', label: 'Created Date and Time', type: 'datetime' },
    { name: 'createdBy', label: 'Created By' },
    { name: 'postingDate', label: 'Posting Date', type: 'date' },
    { name: 'postedBy', label: 'Posted By' },
    { name: 'status', label: 'Status' },
    { name: 'approvedBy', label: 'Approved By' },
    { name: 'approvedDateTime', label: 'Approved Date and Time', type: 'datetime' },
  ],
};
