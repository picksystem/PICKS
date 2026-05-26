export type TSActiveView = 'project' | 'serviceLine' | 'application' | 'queue' | 'resource';

import { IConfigTimesheetProjectEntry } from '@serviceops/interfaces';

export interface TimesheetProjectsSectionProps {
  data?: IConfigTimesheetProjectEntry[];
  onDataChange?: (data: IConfigTimesheetProjectEntry[]) => void;
}
