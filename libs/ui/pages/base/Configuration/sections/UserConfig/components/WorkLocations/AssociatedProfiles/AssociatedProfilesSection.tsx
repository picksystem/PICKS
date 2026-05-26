import { useState, useEffect } from 'react';
import { IConfigWorkLocationAssociatedProfile } from '@serviceops/interfaces';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';
import { GenericPanel } from '@serviceops/pages/base/Configuration/shared/GenericPanel/GenericPanel';
import {
  ASSOCIATED_PROFILE_CONFIG,
  associatedProfileColumns,
} from '../../shared/userConfig.config';

interface AssociatedProfilesSectionProps {
  data?: IConfigWorkLocationAssociatedProfile[];
  onDataChange?: (data: IConfigWorkLocationAssociatedProfile[]) => void;
}

const AssociatedProfilesSection = ({ data, onDataChange }: AssociatedProfilesSectionProps) => {
  const { userConfig: apiUC, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigWorkLocationAssociatedProfile[]>([]);

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (apiUC?.associatedProfiles) {
      setRows(apiUC.associatedProfiles);
    }
  }, [data, apiUC]);

  const handleSave = (next: IConfigWorkLocationAssociatedProfile[]) => {
    setRows(next);
    if (onDataChange) {
      onDataChange(next);
    } else {
      saveSection('userConfig', {
        workLocations: apiUC?.workLocations ?? [],
        workingTimes: apiUC?.workingTimes ?? [],
        associatedProfiles: next,
        shifts: apiUC?.shifts ?? [],
        workLocationAssociations: apiUC?.workLocationAssociations ?? [],
      });
    }
  };

  return (
    <GenericPanel
      config={ASSOCIATED_PROFILE_CONFIG}
      data={rows}
      onSave={handleSave}
      customColumns={associatedProfileColumns as any}
      variant='standard'
    />
  );
};

export { AssociatedProfilesSection };
