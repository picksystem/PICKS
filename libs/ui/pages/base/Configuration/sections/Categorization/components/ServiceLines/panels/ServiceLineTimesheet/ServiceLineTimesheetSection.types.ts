import { IConfigTimesheetProject } from '@serviceops/interfaces';

export interface FlatServiceLineTSRow extends Omit<IConfigTimesheetProject, 'serviceLineId'> {
  serviceLineId: string;
  serviceLineName: string;
}

export interface ServiceLineTimesheetSectionProps {
  data: FlatServiceLineTSRow[];
  onDataChange?: (data: FlatServiceLineTSRow[]) => void;
}
