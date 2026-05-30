import { useState, useEffect } from 'react';
import { IConfigWorkLocationAssociation } from '@serviceops/interfaces';
import { useConfiguration } from '@serviceops/confighooks';
import { GenericPanel } from '@serviceops/genericpanel';
import { ASSOCIATION_CONFIG, associationColumns } from '../../shared/userConfig.config';

interface AssociationsSectionProps {
  data?: IConfigWorkLocationAssociation[];
  onDataChange?: (data: IConfigWorkLocationAssociation[]) => void;
}

const AssociationsSection = ({ data, onDataChange }: AssociationsSectionProps) => {
  const { userConfig: apiUC, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigWorkLocationAssociation[]>([]);

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (apiUC?.workLocationAssociations) {
      setRows(apiUC.workLocationAssociations);
    }
  }, [data, apiUC]);

  const handleSave = (next: IConfigWorkLocationAssociation[]) => {
    setRows(next);
    if (onDataChange) {
      onDataChange(next);
    } else {
      saveSection('userConfig', {
        workLocations: apiUC?.workLocations ?? [],
        workingTimes: apiUC?.workingTimes ?? [],
        associatedProfiles: apiUC?.associatedProfiles ?? [],
        shifts: apiUC?.shifts ?? [],
        workLocationAssociations: next,
      });
    }
  };

  return (
    <GenericPanel
      config={ASSOCIATION_CONFIG}
      data={rows}
      onSave={handleSave}
      customColumns={associationColumns as any}
      variant='standard'
    />
  );
};

export { AssociationsSection };
