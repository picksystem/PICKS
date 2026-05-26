import { IConfigApprovalConsultantRole } from '@serviceops/interfaces';
import { ConsultantRolesSectionProps } from './ConsultantRolesSection.types';
import { GenericPanel } from '../../../Categorization/components/shared';
import { TABLE_CONFIG } from '../ApprovalsSection.config';

export const ConsultantRolesSection = ({ data, onDataChange }: ConsultantRolesSectionProps) => {
  const handleSave = (next: IConfigApprovalConsultantRole[]) => {
    onDataChange?.(next);
  };

  return (
    <GenericPanel config={TABLE_CONFIG.consultantRoles} data={data || []} onSave={handleSave} />
  );
};
