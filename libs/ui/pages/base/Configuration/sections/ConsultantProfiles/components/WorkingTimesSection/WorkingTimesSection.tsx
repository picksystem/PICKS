import { IConfigConsultantWorkingTime } from '@serviceops/interfaces';
import { GenericPanel } from '@serviceops/genericpanel';
import { WORKING_TIMES_CONFIG } from '../ConsultantProfiles.config';

export interface WorkingTimesSectionProps {
  data?: IConfigConsultantWorkingTime[];
  onDataChange?: (data: IConfigConsultantWorkingTime[]) => void;
}

export const WorkingTimesSection = ({ data, onDataChange }: WorkingTimesSectionProps) => {
  const handleSave = (next: IConfigConsultantWorkingTime[]) => {
    onDataChange?.(next);
  };

  return <GenericPanel config={WORKING_TIMES_CONFIG} data={data || []} onSave={handleSave} />;
};
