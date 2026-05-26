import { IConfigApprovalAssocUserProfile } from '@serviceops/interfaces';
import { UserProfilesSectionProps } from './UserProfilesSection.types';
import { TABLE_CONFIG } from './UserProfilesSection.config';
import { GenericPanel } from '../../../Categorization/components/shared';

export const UserProfilesSection = ({ data, onDataChange }: UserProfilesSectionProps) => {
  const handleSave = (next: IConfigApprovalAssocUserProfile[]) => {
    onDataChange?.(next);
  };

  return <GenericPanel config={TABLE_CONFIG.userProfile} data={data || []} onSave={handleSave} />;
};
