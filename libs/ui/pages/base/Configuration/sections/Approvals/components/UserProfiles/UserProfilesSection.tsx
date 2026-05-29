import { IConfigApprovalAssocUserProfile } from '@serviceops/interfaces';
import { GenericPanel } from '../../../Categorization/components/shared';
import { UserProfilesSectionProps } from './UserProfilesSection.types';
import { TABLE_CONFIG } from '../ApprovalsSection.config';

export const UserProfilesSection = ({ data, onDataChange }: UserProfilesSectionProps) => {
  const handleSave = (next: IConfigApprovalAssocUserProfile[]) => {
    onDataChange?.(next);
  };

  return (
    <GenericPanel
      config={TABLE_CONFIG.userProfile}
      data={data || []}
      onSave={handleSave}
      variant='standard'
      enableSuccessMessage
    />
  );
};
