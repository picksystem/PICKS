import React from 'react';
import { IConfigApprovalConsultantRole } from '@serviceops/interfaces';
import { GenericPanel, TABLE_CONFIG } from '../shared';

interface ConsultantRolesSectionProps {
  data?: IConfigApprovalConsultantRole[];
  onDataChange?: (data: IConfigApprovalConsultantRole[]) => void;
}

export const ConsultantRolesSection = ({ data, onDataChange }: ConsultantRolesSectionProps) => {
  const handleSave = (next: IConfigApprovalConsultantRole[]) => {
    onDataChange?.(next);
  };

  return (
    <GenericPanel config={TABLE_CONFIG.consultantRoles} data={data || []} onSave={handleSave} />
  );
};
