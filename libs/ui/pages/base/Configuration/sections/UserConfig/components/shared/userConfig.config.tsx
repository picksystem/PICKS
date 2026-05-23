import { Column } from '@serviceops/component';
import { mkCell, mkDescCell } from '@serviceops/pages/base/Configuration/utils/cellRenderers';
import type { IConfigWorkLocation } from '@serviceops/interfaces';

// ── Colors ─────────────────────────────────────────────────────────────────────

export const UC_COLORS = {
  workLocation: '#0369a1',
} as const;

// ── Column Definitions ─────────────────────────────────────────────────────────

export const workLocationColumns: Column<IConfigWorkLocation>[] = [
  { id: 'name', label: 'Name', minWidth: 180, format: mkCell(true) },
  { id: 'description', label: 'Description', minWidth: 220, format: mkDescCell },
  { id: 'address', label: 'Address', minWidth: 200, format: mkCell() },
  { id: 'timezone', label: 'Timezone', minWidth: 150, format: mkCell() },
];

// ── Form Config ────────────────────────────────────────────────────────────────

export const UC_FORM_LABELS = {
  workLocation: {
    title: 'Work Location',
    subtitle: 'Define work location with regional and time settings',
    entity: 'Work Location',
    fields: [
      {
        name: 'name',
        label: 'Work Location Name',
        required: true,
        placeholder: 'e.g. London Office',
      },
      {
        name: 'description',
        label: 'Description',
        placeholder: 'Brief description of this location',
      },
      { name: 'address', label: 'Address', placeholder: 'e.g. 123 Main St, London, UK' },
      { name: 'timezone', label: 'Timezone', placeholder: 'e.g. Europe/London' },
    ],
  },
} as const;
