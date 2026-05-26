import { IConfigApprovalConsultantRole } from '@serviceops/interfaces';
import { ConsultantRolesSectionProps } from './ConsultantRolesSection.types';
import { TABLE_CONFIG } from './ConsultantRolesSection.config';
import { GenericPanel } from '../../../Categorization/components/shared';

export const ConsultantRolesSection = ({ data, onDataChange }: ConsultantRolesSectionProps) => {
  const handleSave = (next: IConfigApprovalConsultantRole[]) => {
    onDataChange?.(next);
  };

  return (
    <GenericPanel config={TABLE_CONFIG.consultantRoles} data={data || []} onSave={handleSave} />
  );
};
