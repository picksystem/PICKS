import { IConfigConsultantTimesheetProject } from '@serviceops/interfaces';
import { GenericPanel } from '@serviceops/genericpanel';
import { TIMESHEET_PROJECTS_CONFIG } from '../ConsultantProfiles.config';

export interface TimesheetProjectsSectionProps {
  data?: IConfigConsultantTimesheetProject[];
  onDataChange?: (data: IConfigConsultantTimesheetProject[]) => void;
}

export const TimesheetProjectsSection = ({ data, onDataChange }: TimesheetProjectsSectionProps) => {
  const handleSave = (next: IConfigConsultantTimesheetProject[]) => {
    onDataChange?.(next);
  };

  return <GenericPanel config={TIMESHEET_PROJECTS_CONFIG} data={data || []} onSave={handleSave} />;
};
