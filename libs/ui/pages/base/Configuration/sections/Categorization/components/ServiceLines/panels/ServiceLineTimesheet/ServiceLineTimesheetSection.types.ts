import { IConfigTimesheetProject } from '@serviceops/interfaces';

export interface FlatServiceLineTSRow extends Omit<IConfigTimesheetProject, 'serviceLineId'> {
  serviceLineId: string;
  serviceLineName: string;
}

export interface ServiceLineTimesheetSectionProps {
  data: FlatServiceLineTSRow[];
  onDataChange?: (data: FlatServiceLineTSRow[]) => void;
  /**
   * Drop-down options for the "Service Line" field. Sourced from
   * `useConfiguration().categorization.serviceLines` and mapped to
   * `{ value: name, label: name }`. Lifted to the parent so the same
   * sorted/deduped list feeds the toolbar that selects the sub-panel
   * service line as well as the dialog's search.
   */
  serviceLineOptions?: { value: string; label: string }[];
  /**
   * Drop-down options for the "Project name" field. Sourced from the
   * deduplicated union of project names across all service lines'
   * timesheet rows.
   */
  projectOptions?: { value: string; label: string }[];
  /**
   * Mirror hook fired AFTER a timesheet row is created/updated with
   * `useInExpenses === true`. Receives the saved row plus the previous
   * value of `useInExpenses` (so the parent can detect the 0→1
   * transition and create the expense mirror). The parent is
   * responsible for updating the underlying `IConfigServiceLine[]`
   * because it owns the per-SL `expenseProjects` array.
   */
  onTimesheetSave?: (data: {
    row: FlatServiceLineTSRow;
    previousUseInExpenses: boolean;
  }) => void;
  /**
   * Mirror hook fired AFTER a timesheet row is deleted. Receives the
   * row that was just removed so the parent can drop any associated
   * expense mirror row.
   */
  onTimesheetDelete?: (data: { row: FlatServiceLineTSRow }) => void;
}