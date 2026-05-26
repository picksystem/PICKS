import { IConfigAssociatedUserProfile } from '@serviceops/interfaces';
import { GenericPanel } from '@serviceops/pages/base/Configuration/shared/GenericPanel/GenericPanel';
import { USER_PROFILES_CONFIG } from '../ConsultantProfiles.config';

export interface UserProfilesSectionProps {
  data?: IConfigAssociatedUserProfile[];
  onDataChange?: (data: IConfigAssociatedUserProfile[]) => void;
}

export const UserProfilesSection = ({ data, onDataChange }: UserProfilesSectionProps) => {
  const handleSave = (next: IConfigAssociatedUserProfile[]) => {
    onDataChange?.(next);
  };

  return <GenericPanel config={USER_PROFILES_CONFIG} data={data || []} onSave={handleSave} />;
};
