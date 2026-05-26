import { IConfigTimesheetProject } from '@serviceops/interfaces';

export interface FlatAppTSRow extends Omit<IConfigTimesheetProject, 'applicationId'> {
  applicationId: string;
  applicationName: string;
}

export interface AppTimesheetSectionProps {
  data: FlatAppTSRow[];
  onDataChange?: (data: FlatAppTSRow[]) => void;
}
