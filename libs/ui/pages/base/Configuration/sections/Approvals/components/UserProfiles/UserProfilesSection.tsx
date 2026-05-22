import { IConfigApprovalAssocUserProfile } from '@serviceops/interfaces';
import { TABLE_CONFIG, GenericPanel } from '../shared';

interface UserProfilesSectionProps {
  data?: IConfigApprovalAssocUserProfile[];
  onDataChange?: (data: IConfigApprovalAssocUserProfile[]) => void;
}

export const UserProfilesSection = ({ data, onDataChange }: UserProfilesSectionProps) => {
  const handleSave = (next: IConfigApprovalAssocUserProfile[]) => {
    onDataChange?.(next);
  };

  return <GenericPanel config={TABLE_CONFIG.userProfile} data={data || []} onSave={handleSave} />;
};
