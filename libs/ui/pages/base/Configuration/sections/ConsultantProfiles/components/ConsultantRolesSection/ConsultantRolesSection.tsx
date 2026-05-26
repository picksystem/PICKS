import { useState } from 'react';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import LinkIcon from '@mui/icons-material/Link';
import { IConfigConsultantRole, IConfigAssociatedConsultantProfile } from '@serviceops/interfaces';
import { GenericToolbar } from '@serviceops/pages/base/Configuration/shared/GenericToolbar/GenericToolbar';
import { GenericPanel } from '@serviceops/pages/base/Configuration/shared/GenericPanel/GenericPanel';
import {
  CONSULTANT_ROLES_CONFIG,
  ASSOC_CONSULTANT_PROFILES_CONFIG,
} from '../ConsultantProfiles.config';

export type CRSubView = 'roles' | 'assocProfiles';

export interface ConsultantRolesSectionProps {
  rolesData?: IConfigConsultantRole[];
  assocProfilesData?: IConfigAssociatedConsultantProfile[];
  onRolesChange?: (data: IConfigConsultantRole[]) => void;
  onAssocProfilesChange?: (data: IConfigAssociatedConsultantProfile[]) => void;
}

const TOOLBAR_BUTTONS: { key: CRSubView; label: string; icon: React.ReactNode }[] = [
  { key: 'roles', label: 'Consultant Roles', icon: <GroupAddIcon sx={{ fontSize: '1rem' }} /> },
  {
    key: 'assocProfiles',
    label: 'Associated Profiles',
    icon: <LinkIcon sx={{ fontSize: '1rem' }} />,
  },
];

export const ConsultantRolesSection = ({
  rolesData,
  assocProfilesData,
  onRolesChange,
  onAssocProfilesChange,
}: ConsultantRolesSectionProps) => {
  const [activeView, setActiveView] = useState<CRSubView>('roles');

  return (
    <>
      <GenericToolbar
        buttons={TOOLBAR_BUTTONS.map((btn) => ({
          key: btn.key,
          label: btn.label,
          icon: btn.icon,
          isActive: activeView === btn.key,
          onClick: () => setActiveView(btn.key as CRSubView),
        }))}
      />

      {activeView === 'roles' && (
        <GenericPanel
          config={CONSULTANT_ROLES_CONFIG}
          data={rolesData || []}
          onSave={(next) => onRolesChange?.(next as IConfigConsultantRole[])}
          variant='standard'
        />
      )}

      {activeView === 'assocProfiles' && (
        <GenericPanel
          config={ASSOC_CONSULTANT_PROFILES_CONFIG}
          data={assocProfilesData || []}
          onSave={(next) => onAssocProfilesChange?.(next as IConfigAssociatedConsultantProfile[])}
          variant='standard'
        />
      )}
    </>
  );
};
