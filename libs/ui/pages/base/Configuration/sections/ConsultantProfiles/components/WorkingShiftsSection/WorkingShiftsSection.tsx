import { IConfigConsultantWorkingShift } from '@serviceops/interfaces';
import { GenericPanel } from '@serviceops/pages/base/Configuration/shared/GenericPanel/GenericPanel';
import { WORKING_SHIFTS_CONFIG } from '../ConsultantProfiles.config';

export interface WorkingShiftsSectionProps {
  data?: IConfigConsultantWorkingShift[];
  onDataChange?: (data: IConfigConsultantWorkingShift[]) => void;
}

export const WorkingShiftsSection = ({ data, onDataChange }: WorkingShiftsSectionProps) => {
  const handleSave = (next: IConfigConsultantWorkingShift[]) => {
    onDataChange?.(next);
  };

  return <GenericPanel config={WORKING_SHIFTS_CONFIG} data={data || []} onSave={handleSave} />;
};
